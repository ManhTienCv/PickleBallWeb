package com.demopick.pickleball.modules.chat.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/v1")
public class AdminChatController {

    private final Map<String, Map<String, Object>> conversations = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> sessionMessages = new ConcurrentHashMap<>();
    private final AtomicLong messageIdGen = new AtomicLong(1);
    private final ObjectMapper objectMapper = new ObjectMapper();

    // SSE Emitters for real-time live chat
    private final Map<String, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();
    private final List<SseEmitter> adminEmitters = new CopyOnWriteArrayList<>();

    @GetMapping("/admin/chat/conversations")
    public ResponseEntity<Map<String, Object>> getConversations() {
        List<Map<String, Object>> list = new ArrayList<>(conversations.values());
        list.sort((a, b) -> String.valueOf(b.getOrDefault("updated_at", "")).compareTo(String.valueOf(a.getOrDefault("updated_at", ""))));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", list);
        response.put("message", "Lấy danh sách hội thoại thành công.");
        return ResponseEntity.ok(response);
    }

    @GetMapping({
            "/admin/chat/messages/{sessionId}",
            "/chat/messages/{sessionId}",
            "/user/chat/messages",
            "/chat/messages"
    })
    public ResponseEntity<Map<String, Object>> getMessages(
            @PathVariable(required = false) String sessionId,
            @RequestParam(value = "session_id", required = false) String sessionParam
    ) {
        String effectiveSessionId = (sessionId != null && !sessionId.isBlank()) ? sessionId : sessionParam;
        List<Map<String, Object>> messages = (effectiveSessionId != null && !effectiveSessionId.isBlank())
                ? sessionMessages.getOrDefault(effectiveSessionId, Collections.emptyList())
                : Collections.emptyList();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", messages);
        response.put("session_token", "CHAT_TOKEN_" + (effectiveSessionId != null ? effectiveSessionId : "GUEST"));
        response.put("message", "Lấy tin nhắn thành công.");
        return ResponseEntity.ok(response);
    }

    @PostMapping({
            "/admin/chat/messages",
            "/chat/messages",
            "/user/chat/send",
            "/admin/chat/send"
    })
    public ResponseEntity<Map<String, Object>> sendMessage(
            HttpServletRequest request,
            @RequestBody Map<String, Object> payload
    ) {
        String uri = request != null ? request.getRequestURI() : "";
        boolean isAdminUri = uri.contains("/admin/");
        String defaultSenderType = isAdminUri ? "admin" : "user";
        String senderType = String.valueOf(payload.getOrDefault("sender_type", defaultSenderType));
        String defaultSenderName = senderType.equals("admin") ? "Lễ tân" : "Khách hàng";
        String senderName = String.valueOf(payload.getOrDefault("sender_name", defaultSenderName));

        String sessionId = String.valueOf(payload.getOrDefault("session_id", "SESSION-" + UUID.randomUUID().toString().substring(0, 8)));
        String messageText = String.valueOf(payload.getOrDefault("message", ""));
        String nowStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));

        Map<String, Object> msg = new HashMap<>();
        msg.put("id", messageIdGen.getAndIncrement());
        msg.put("session_id", sessionId);
        msg.put("sender_type", senderType);
        msg.put("sender_name", senderName);
        msg.put("message", messageText);
        msg.put("created_at", nowStr);

        sessionMessages.computeIfAbsent(sessionId, k -> new CopyOnWriteArrayList<>()).add(msg);

        // Update conversation summary
        Map<String, Object> conv = conversations.computeIfAbsent(sessionId, k -> new ConcurrentHashMap<>());
        conv.put("session_id", sessionId);
        if (!senderType.equals("admin") || !conv.containsKey("customer_name")) {
            conv.put("customer_name", senderName);
        }
        conv.put("last_message", messageText);
        conv.put("last_sender", senderType);
        conv.put("updated_at", nowStr);
        int currentUnread = (int) conv.getOrDefault("unread_count", 0);
        conv.put("unread_count", senderType.equals("user") ? currentUnread + 1 : 0);

        // Broadcast to live SSE streams
        broadcastMessage(sessionId, msg);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", msg);
        response.put("session_token", "CHAT_TOKEN_" + sessionId);
        response.put("message", "Gửi tin nhắn thành công.");
        return ResponseEntity.ok(response);
    }

    @GetMapping(value = {"/user/chat/stream", "/chat/stream"}, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(
            HttpServletRequest request,
            @RequestParam(value = "session_id", required = false) String sessionId
    ) {
        // 30 minutes timeout
        SseEmitter emitter = new SseEmitter(1800_000L);

        String uri = request != null ? request.getRequestURI() : "";
        boolean isUserStream = uri.contains("/user/chat/stream") || (sessionId != null && !sessionId.isBlank() && !uri.contains("/admin"));

        if (isUserStream && sessionId != null && !sessionId.isBlank()) {
            userEmitters.computeIfAbsent(sessionId, k -> new CopyOnWriteArrayList<>()).add(emitter);
            emitter.onCompletion(() -> removeUserEmitter(sessionId, emitter));
            emitter.onTimeout(() -> removeUserEmitter(sessionId, emitter));
            emitter.onError((e) -> removeUserEmitter(sessionId, emitter));
        } else {
            adminEmitters.add(emitter);
            emitter.onCompletion(() -> adminEmitters.remove(emitter));
            emitter.onTimeout(() -> adminEmitters.remove(emitter));
            emitter.onError((e) -> adminEmitters.remove(emitter));
        }

        try {
            // Send initial ping event
            emitter.send(SseEmitter.event().name("ping").data("connected"));
        } catch (IOException ignored) {}

        return emitter;
    }

    private void removeUserEmitter(String sessionId, SseEmitter emitter) {
        List<SseEmitter> list = userEmitters.get(sessionId);
        if (list != null) {
            list.remove(emitter);
            if (list.isEmpty()) {
                userEmitters.remove(sessionId);
            }
        }
    }

    private void broadcastMessage(String sessionId, Map<String, Object> msg) {
        try {
            String json = objectMapper.writeValueAsString(msg);

            // 1. Send to user listening on this session
            List<SseEmitter> uList = userEmitters.get(sessionId);
            if (uList != null) {
                for (SseEmitter emitter : uList) {
                    try {
                        emitter.send(SseEmitter.event().name("message").data(json));
                    } catch (Exception ex) {
                        uList.remove(emitter);
                    }
                }
            }

            // 2. Send to all admin consoles
            for (SseEmitter emitter : adminEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("message").data(json));
                } catch (Exception ex) {
                    adminEmitters.remove(emitter);
                }
            }

            // 3. Send conversations_updated event to admin
            List<Map<String, Object>> convList = new ArrayList<>(conversations.values());
            convList.sort((a, b) -> String.valueOf(b.getOrDefault("updated_at", "")).compareTo(String.valueOf(a.getOrDefault("updated_at", ""))));
            String convJson = objectMapper.writeValueAsString(convList);
            for (SseEmitter emitter : adminEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("conversations_updated").data(convJson));
                } catch (Exception ex) {
                    adminEmitters.remove(emitter);
                }
            }
        } catch (Exception e) {
            // Logging can be added if needed
        }
    }
}
