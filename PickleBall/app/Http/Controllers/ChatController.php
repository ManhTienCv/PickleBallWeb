<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    /**
     * Tạo và xác minh chữ ký bảo mật cho phiên chat của khách (Chống IDOR đọc trộm chat)
     */
    protected function generateSessionToken(string $sessionId): string
    {
        $salt = config('app.key') ?: 'demopick_chat_security_key';
        return substr(hash_hmac('sha256', "chat_session_{$sessionId}", $salt), 0, 32);
    }

    /**
     * Khách hàng lấy danh sách tin nhắn (Tối ưu hóa với after_id để Auto-polling không gây tải)
     */
    public function getCustomerMessages(Request $request): JsonResponse
    {
        $sessionId = $request->query('session_id');
        $afterId = (int) $request->query('after_id', 0);

        if (!$sessionId) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu session_id định danh phiên chat.',
            ], 400);
        }

        $expectedToken = $this->generateSessionToken($sessionId);
        $providedToken = $request->header('X-Chat-Token') ?: $request->query('token');

        // Chống IDOR: Nếu có token gửi lên nhưng không khớp với phiên -> từ chối truy cập
        if ($providedToken && !hash_equals($expectedToken, $providedToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác thực phiên chat không hợp lệ (Unauthorized chat session).',
            ], 403);
        }

        $messages = [];

        try {
            $query = Message::where('session_id', $sessionId);
            if ($afterId > 0) {
                $query->where('id', '>', $afterId);
            }
            $messages = $query->orderBy('id', 'asc')->get()->toArray();

            // Đánh dấu các tin nhắn của admin gửi cho khách là đã đọc
            Message::where('session_id', $sessionId)
                ->where('sender_type', 'admin')
                ->where('is_read', false)
                ->update(['is_read' => true]);
        } catch (\Throwable $e) {
            // Fallback Cache store
            $allCacheMessages = Cache::get("demopick_chat_session_{$sessionId}", []);
            if ($afterId > 0) {
                $messages = array_values(array_filter($allCacheMessages, fn($m) => ($m['id'] ?? 0) > $afterId));
            } else {
                $messages = $allCacheMessages;
            }
        }

        // Nếu chưa có tin nhắn nào, tự tạo tin nhắn chào tự động
        if (empty($messages) && $afterId === 0) {
            $welcomeMsg = [
                'id' => 1,
                'session_id' => $sessionId,
                'user_id' => null,
                'sender_name' => 'DemoPick Assistant',
                'sender_type' => 'admin',
                'message' => 'Xin chào! DemoPick Club có thể hỗ trợ gì cho bạn về đặt sân Pickleball hoặc mua dụng cụ thi đấu?',
                'is_read' => true,
                'created_at' => now()->toIso8601String(),
            ];
            $messages = [$welcomeMsg];
            Cache::put("demopick_chat_session_{$sessionId}", $messages, 86400 * 7);
        }

        return response()->json([
            'success' => true,
            'session_token' => $expectedToken,
            'data' => $messages,
        ])->header('X-Chat-Token', $expectedToken);
    }

    /**
     * Khách hàng gửi tin nhắn
     */
    public function sendCustomerMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string|max:64',
            'message' => 'required|string|max:2000',
            'sender_name' => 'nullable|string|max:100',
            'token' => 'nullable|string|max:64',
        ]);

        $sessionId = $validated['session_id'];
        $expectedToken = $this->generateSessionToken($sessionId);
        $providedToken = $request->header('X-Chat-Token') ?: ($validated['token'] ?? null);

        if ($providedToken && !hash_equals($expectedToken, $providedToken)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác thực phiên chat không hợp lệ (Unauthorized chat session).',
            ], 403);
        }

        $cleanMessage = strip_tags(trim($validated['message']));
        $userId = auth('sanctum')->id();
        $senderName = $validated['sender_name'] ?? ($userId ? auth('sanctum')->user()->name : 'Khách hàng');

        $msgData = [
            'id' => (int) (microtime(true) * 1000),
            'session_id' => $sessionId,
            'user_id' => $userId,
            'sender_name' => $senderName,
            'sender_type' => 'user',
            'message' => $cleanMessage,
            'is_read' => false,
            'created_at' => now()->toIso8601String(),
        ];

        try {
            $created = Message::create([
                'session_id' => $sessionId,
                'user_id' => $userId,
                'sender_name' => $senderName,
                'sender_type' => 'user',
                'message' => $cleanMessage,
                'is_read' => false,
            ]);
            $msgData['id'] = $created->id;
            $msgData['created_at'] = $created->created_at->toIso8601String();
        } catch (\Throwable $e) {
            Log::info('Chat DB fallback to cache: ' . $e->getMessage());
        }

        // Cập nhật Cache cho session
        $cached = Cache::get("demopick_chat_session_{$sessionId}", []);
        $cached[] = $msgData;

        // Tự động phát hiện thông tin nhạy cảm (PII: OTP, Password, CVV)
        $hasPii = preg_match('/\b(otp|mã xác thực|ma xac thuc|mật khẩu|mat khau|password|cvv)\b/i', $cleanMessage);
        if ($hasPii) {
            $warningMsg = [
                'id' => (int) (microtime(true) * 1000) + 1,
                'session_id' => $sessionId,
                'user_id' => null,
                'sender_name' => 'DemoPick Security Bot',
                'sender_type' => 'admin',
                'message' => '🛡️ Lưu ý an toàn: Nhân viên DemoPick Club không bao giờ yêu cầu bạn cung cấp mật khẩu tài khoản, mã xác thực OTP hay mã CVV qua khung chat. Vui lòng bảo mật thông tin tài khoản!',
                'is_read' => true,
                'created_at' => now()->toIso8601String(),
            ];
            try {
                Message::create([
                    'session_id' => $sessionId,
                    'user_id' => null,
                    'sender_name' => 'DemoPick Security Bot',
                    'sender_type' => 'admin',
                    'message' => $warningMsg['message'],
                    'is_read' => true,
                ]);
            } catch (\Throwable $e) {}
            $cached[] = $warningMsg;
        }

        Cache::put("demopick_chat_session_{$sessionId}", $cached, 86400 * 7);

        // Lưu vào danh sách hội thoại admin
        $allConversations = Cache::get('demopick_chat_conversations', []);
        $allConversations[$sessionId] = [
            'session_id' => $sessionId,
            'customer_name' => $senderName,
            'last_message' => $cleanMessage,
            'last_sender' => 'user',
            'unread_count' => ($allConversations[$sessionId]['unread_count'] ?? 0) + 1,
            'updated_at' => now()->toIso8601String(),
        ];
        Cache::put('demopick_chat_conversations', $allConversations, 86400 * 7);

        return response()->json([
            'success' => true,
            'session_token' => $expectedToken,
            'data' => $msgData,
            'message' => 'Gửi tin nhắn thành công.',
        ], 201)->header('X-Chat-Token', $expectedToken);
    }

    /**
     * Admin: Lấy danh sách các cuộc trò chuyện
     */
    public function getAdminConversations(): JsonResponse
    {
        $conversations = [];

        try {
            $latestMessageIds = Message::select(DB::raw('MAX(id) as max_id'))
                ->groupBy('session_id')
                ->pluck('max_id');

            $dbConversations = Message::whereIn('id', $latestMessageIds)
                ->orderBy('id', 'desc')
                ->get();

            foreach ($dbConversations as $item) {
                $unreadCount = Message::where('session_id', $item->session_id)
                    ->where('sender_type', 'user')
                    ->where('is_read', false)
                    ->count();

                $conversations[] = [
                    'session_id' => $item->session_id,
                    'customer_name' => $item->sender_name ?: 'Khách hàng',
                    'last_message' => $item->message,
                    'last_sender' => $item->sender_type,
                    'unread_count' => $unreadCount,
                    'updated_at' => $item->created_at->toIso8601String(),
                ];
            }
        } catch (\Throwable $e) {
            $cachedConv = Cache::get('demopick_chat_conversations', []);
            $conversations = array_values($cachedConv);
        }

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    /**
     * Admin: Lấy chi tiết lịch sử tin nhắn của một phiên
     */
    public function getAdminConversationMessages(string $sessionId): JsonResponse
    {
        $messages = [];

        try {
            $messages = Message::where('session_id', $sessionId)
                ->orderBy('id', 'asc')
                ->get()
                ->toArray();

            Message::where('session_id', $sessionId)
                ->where('sender_type', 'user')
                ->where('is_read', false)
                ->update(['is_read' => true]);
        } catch (\Throwable $e) {
            $messages = Cache::get("demopick_chat_session_{$sessionId}", []);
        }

        // Cập nhật reset unread_count trong Cache
        $allConversations = Cache::get('demopick_chat_conversations', []);
        if (isset($allConversations[$sessionId])) {
            $allConversations[$sessionId]['unread_count'] = 0;
            Cache::put('demopick_chat_conversations', $allConversations, 86400 * 7);
        }

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    /**
     * Admin: Gửi tin nhắn phản hồi
     */
    public function sendAdminReply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
            'message' => 'required|string|max:2000',
        ]);

        $sessionId = $validated['session_id'];
        $cleanMessage = strip_tags(trim($validated['message']));
        $adminUser = auth('sanctum')->user();
        $senderName = $adminUser ? $adminUser->name : 'DemoPick Hỗ Trợ';

        $msgData = [
            'id' => (int) (microtime(true) * 1000),
            'session_id' => $sessionId,
            'user_id' => $adminUser ? $adminUser->id : null,
            'sender_name' => $senderName,
            'sender_type' => 'admin',
            'message' => $cleanMessage,
            'is_read' => true,
            'created_at' => now()->toIso8601String(),
        ];

        try {
            $created = Message::create([
                'session_id' => $sessionId,
                'user_id' => $adminUser ? $adminUser->id : null,
                'sender_name' => $senderName,
                'sender_type' => 'admin',
                'message' => $cleanMessage,
                'is_read' => true,
            ]);
            $msgData['id'] = $created->id;
            $msgData['created_at'] = $created->created_at->toIso8601String();
        } catch (\Throwable $e) {
            Log::info('Admin chat reply DB fallback: ' . $e->getMessage());
        }

        $cached = Cache::get("demopick_chat_session_{$sessionId}", []);
        $cached[] = $msgData;
        Cache::put("demopick_chat_session_{$sessionId}", $cached, 86400 * 7);

        // Cập nhật lại cuộc trò chuyện
        $allConversations = Cache::get('demopick_chat_conversations', []);
        if (isset($allConversations[$sessionId])) {
            $allConversations[$sessionId]['last_message'] = $cleanMessage;
            $allConversations[$sessionId]['last_sender'] = 'admin';
            $allConversations[$sessionId]['updated_at'] = now()->toIso8601String();
            Cache::put('demopick_chat_conversations', $allConversations, 86400 * 7);
        }

        return response()->json([
            'success' => true,
            'data' => $msgData,
            'message' => 'Đã gửi phản hồi hỗ trợ.',
        ], 201);
    }

    /**
     * Khách hàng: Stream tin nhắn mới thời gian thực bằng Server-Sent Events (SSE)
     * Thay thế hoàn toàn cơ chế Polling 3 giây
     */
    public function streamCustomerMessages(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $sessionId = $request->query('session_id');
        $afterId = (int) $request->query('after_id', 0);

        if (!$sessionId) {
            return response()->stream(function () {
                echo "event: error\ndata: " . json_encode(['message' => 'Missing session_id']) . "\n\n";
            }, 400, ['Content-Type' => 'text/event-stream']);
        }

        return response()->stream(function () use ($sessionId, $afterId) {
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            $currentAfterId = $afterId;
            $startTime = time();
            $maxExecutionTime = 40; // Kết nối 40s rồi để EventSource auto-reconnect

            echo "event: connected\n";
            echo "data: " . json_encode(['status' => 'online', 'session_id' => $sessionId]) . "\n\n";
            flush();

            while ((time() - $startTime) < $maxExecutionTime) {
                if (connection_aborted()) {
                    break;
                }

                $newMessages = [];

                try {
                    $newMessages = Message::where('session_id', $sessionId)
                        ->where('id', '>', $currentAfterId)
                        ->orderBy('id', 'asc')
                        ->get()
                        ->toArray();
                } catch (\Throwable $e) {
                    $cached = Cache::get("demopick_chat_session_{$sessionId}", []);
                    $newMessages = array_values(array_filter($cached, fn($m) => ($m['id'] ?? 0) > $currentAfterId));
                }

                if (!empty($newMessages)) {
                    foreach ($newMessages as $msg) {
                        $currentAfterId = max($currentAfterId, (int) ($msg['id'] ?? 0));
                        echo "event: message\n";
                        echo "data: " . json_encode($msg) . "\n\n";
                    }
                    flush();
                }

                echo ": ping\n\n";
                flush();

                usleep(800000); // 0.8s idle nội bộ, 0 request HTTP mới
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    /**
     * Admin: Stream cập nhật danh sách hội thoại và tin nhắn mới (SSE)
     * Thay thế hoàn toàn cơ chế Polling 3 giây của AdminChat
     */
    public function streamAdminUpdates(Request $request): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $token = $request->bearerToken() ?: $request->query('token');
        if ($token) {
            $pat = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($pat) {
                auth()->setUser($pat->tokenable);
            }
        }

        $selectedSessionId = $request->query('session_id');
        $afterId = (int) $request->query('after_id', 0);

        return response()->stream(function () use ($selectedSessionId, $afterId) {
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            $currentAfterId = $afterId;
            $startTime = time();
            $maxExecutionTime = 40;
            $lastConversationHash = '';

            echo "event: connected\n";
            echo "data: " . json_encode(['status' => 'admin_connected']) . "\n\n";
            flush();

            while ((time() - $startTime) < $maxExecutionTime) {
                if (connection_aborted()) {
                    break;
                }

                // 1. Kiểm tra tin nhắn mới cho phiên chat đang chọn
                if ($selectedSessionId) {
                    $newMessages = [];
                    try {
                        $newMessages = Message::where('session_id', $selectedSessionId)
                            ->where('id', '>', $currentAfterId)
                            ->orderBy('id', 'asc')
                            ->get()
                            ->toArray();
                    } catch (\Throwable $e) {
                        $cached = Cache::get("demopick_chat_session_{$selectedSessionId}", []);
                        $newMessages = array_values(array_filter($cached, fn($m) => ($m['id'] ?? 0) > $currentAfterId));
                    }

                    if (!empty($newMessages)) {
                        foreach ($newMessages as $msg) {
                            $currentAfterId = max($currentAfterId, (int) ($msg['id'] ?? 0));
                            echo "event: message\n";
                            echo "data: " . json_encode($msg) . "\n\n";
                        }
                        flush();
                    }
                }

                // 2. Kiểm tra thay đổi trong danh sách hội thoại
                $cachedConv = Cache::get('demopick_chat_conversations', []);
                $convHash = md5(json_encode($cachedConv));
                if ($convHash !== $lastConversationHash) {
                    $lastConversationHash = $convHash;
                    echo "event: conversations_updated\n";
                    echo "data: " . json_encode(array_values($cachedConv)) . "\n\n";
                    flush();
                }

                echo ": ping\n\n";
                flush();

                usleep(800000);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache, no-transform',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}

