import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Search,
  Send,
  User,
  ShieldCheck,
  Clock,
  RefreshCw,
  CheckCheck,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Conversation {
  session_id: string;
  customer_name: string;
  last_message: string;
  last_sender: "user" | "admin";
  unread_count: number;
  updated_at: string;
}

interface ChatMessage {
  id: number;
  session_id: string;
  sender_type: "user" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

const fallbackConversations: Conversation[] = [
  {
    session_id: "GUEST_demo_hoangnam",
    customer_name: "Nguyễn Lê Hoàng Nam",
    last_message: "Bên mình có nhận căng cước vợt lấy ngay trong ca chiều không shop?",
    last_sender: "user",
    unread_count: 1,
    updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    session_id: "GUEST_demo_phuongvu",
    customer_name: "Vũ Mai Phương",
    last_message: "Mình vừa đặt Sân VIP C1 lúc 18h tối nay, check giúp mình nhé.",
    last_sender: "user",
    unread_count: 0,
    updated_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    session_id: "GUEST_demo_tiendung",
    customer_name: "Đặng Tiến Dũng",
    last_message: "Dạ vâng cảm ơn shop, mình đã nhận được bóng Franklin.",
    last_sender: "admin",
    unread_count: 0,
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>(fallbackConversations);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("GUEST_demo_hoangnam");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Nạp danh sách hội thoại
  const fetchConversations = async () => {
    try {
      const res = await api.get("/admin/chat/conversations");
      if (res.data?.success && Array.isArray(res.data.data)) {
        setConversations(res.data.data);
      }
    } catch {
      // Giữ fallbackConversations
    }
  };

  // Nạp chi tiết tin nhắn theo session đang chọn
  const fetchMessages = async (sessionId: string) => {
    try {
      const res = await api.get(`/admin/chat/messages/${sessionId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMessages(res.data.data);
      }
    } catch {
      // Fallback tin nhắn mẫu nếu offline
      if (sessionId === "GUEST_demo_hoangnam") {
        setMessages([
          {
            id: 101,
            session_id: sessionId,
            sender_type: "user",
            sender_name: "Nguyễn Lê Hoàng Nam",
            message: "Chào shop, sân mình hôm nay còn giờ trống từ 17h đến 19h không ạ?",
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          },
          {
            id: 102,
            session_id: sessionId,
            sender_type: "admin",
            sender_name: "Chủ sân (Admin)",
            message: "Chào anh Nam! Chiều nay bên em còn Sân A2 (Trong nhà) trống khung 17h30 - 19h30 ạ.",
            created_at: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
          },
          {
            id: 103,
            session_id: sessionId,
            sender_type: "user",
            sender_name: "Nguyễn Lê Hoàng Nam",
            message: "Bên mình có nhận căng cước vợt lấy ngay trong ca chiều không shop?",
            created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
        ]);
      }
    }
  };

  // 1. Nạp danh sách hội thoại và tin nhắn ban đầu (1 lần duy nhất)
  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchMessages(selectedSessionId);
    }
  }, [selectedSessionId]);

  // 2. Mở Server-Sent Events (SSE) stream nhận cập nhật realtime từ Server (Zero Polling)
  useEffect(() => {
    let eventSource: EventSource | null = null;

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
      const adminToken = localStorage.getItem("demopick_admin_token") || "";
      const queryParams = new URLSearchParams();
      if (adminToken) queryParams.set("token", adminToken);
      if (selectedSessionId) queryParams.set("session_id", selectedSessionId);

      const streamUrl = `${apiBase}/chat/stream?${queryParams.toString()}`;
      eventSource = new EventSource(streamUrl);

      // Nhận tin nhắn mới cho phiên chat đang chọn
      eventSource.addEventListener("message", (e) => {
        try {
          const newMsg: ChatMessage = JSON.parse(e.data);
          if (newMsg && newMsg.id && newMsg.session_id === selectedSessionId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              if (
                newMsg.sender_type === "admin" &&
                prev.some((m) => m.sender_type === "admin" && m.message === newMsg.message)
              ) {
                return prev.map((m) =>
                  m.sender_type === "admin" && m.message === newMsg.message ? newMsg : m
                );
              }
              return [...prev, newMsg];
            });
          }
        } catch (err) {
          console.warn("Lỗi parse SSE message:", err);
        }
      });

      // Nhận cập nhật danh sách cuộc hội thoại khi có khách nhắn
      eventSource.addEventListener("conversations_updated", (e) => {
        try {
          const convList: ChatConversation[] = JSON.parse(e.data);
          if (Array.isArray(convList) && convList.length > 0) {
            setConversations(convList);
          }
        } catch (err) {
          console.warn("Lỗi parse SSE conversations:", err);
        }
      });

      eventSource.onerror = () => {
        // Trình duyệt tự động reconnect
      };
    } catch (err) {
      console.warn("Khởi tạo Admin EventSource thất bại:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [selectedSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    fetchMessages(sessionId);
    // Xóa huy hiệu unread tạm thời
    setConversations((prev) =>
      prev.map((c) => (c.session_id === sessionId ? { ...c, unread_count: 0 } : c))
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending || !selectedSessionId) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");

    // Optimistic UI
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: selectedSessionId,
      sender_type: "admin",
      sender_name: "Quản trị viên",
      message: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setIsSending(true);
      await api.post("/admin/chat/send", {
        session_id: selectedSessionId,
        message: textToSend,
      });
      // Cập nhật lại conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.session_id === selectedSessionId
            ? { ...c, last_message: textToSend, last_sender: "admin", updated_at: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast.error("Không thể gửi tin nhắn. Đang hoạt động ở chế độ Demo.");
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_message.toLowerCase().includes(search.toLowerCase())
  );

  const activeConversation = conversations.find((c) => c.session_id === selectedSessionId);

  return (
    <AppLayout
      title="Tư Vấn Trực Tuyến & Live Chat Khách Hàng"
      subtitle="Kênh phản hồi thời gian thực hỗ trợ đặt sân và đơn hàng"
      noScroll={true}
      headerRight={
        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 py-1.5 px-3 font-semibold text-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Chat Console (3s Polling)</span>
        </Badge>
      }
    >
      <div className="flex-1 flex bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-0 h-full">
        {/* SIDEBAR TRÁI: DANH SÁCH HỘI THOẠI */}
        <div className="w-80 md:w-96 border-r border-slate-200 flex flex-col shrink-0 bg-slate-50/50">
          <div className="p-3.5 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Tìm cuộc hội thoại, khách hàng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Không tìm thấy cuộc trò chuyện nào.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.session_id === selectedSessionId;
                return (
                  <button
                    key={conv.session_id}
                    onClick={() => handleSelectSession(conv.session_id)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative ${
                      isSelected
                        ? "bg-emerald-50/80"
                        : "hover:bg-slate-100/70"
                    }`}
                  >
                    {/* Cột sáng màu xanh báo hiệu cuộc hội thoại đang chọn */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r z-10" />
                    )}

                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                      {conv.customer_name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-emerald-950" : "text-slate-900"}`}>
                          {conv.customer_name}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.updated_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className={`text-xs truncate ${conv.unread_count > 0 ? "font-bold text-slate-900" : "text-slate-500"}`}>
                        {conv.last_sender === "admin" && <span className="text-emerald-600 mr-1">Bạn:</span>}
                        {conv.last_message}
                      </p>
                    </div>

                    {conv.unread_count > 0 && (
                      <Badge className="bg-rose-500 hover:bg-rose-600 text-white rounded-full text-[10px] px-1.5 py-0.5 shrink-0">
                        {conv.unread_count}
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* KHUNG PHẢI: NỘI DUNG CUỘC TRÒ CHUYỆN */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* Header hội thoại */}
          <div className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-bold text-sm">
                {activeConversation?.customer_name.charAt(0).toUpperCase() || "K"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {activeConversation?.customer_name || "Khách hàng"}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  ID Phiên: {selectedSessionId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-semibold py-1 px-2.5">
                Đang trực tuyến
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMessages(selectedSessionId)}
                className="h-8 gap-1 text-xs border-slate-200 text-slate-600"
                title="Tải lại tin nhắn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Vùng hiển thị tin nhắn */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/60">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300" />
                <p className="text-xs">Chưa có tin nhắn trong cuộc trò chuyện này.</p>
              </div>
            ) : (
              messages.map((m) => {
                const isAdmin = m.sender_type === "admin";
                return (
                  <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isAdmin
                          ? "bg-emerald-600 text-white rounded-tr-none shadow-emerald-600/10"
                          : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-[10px]">
                        {isAdmin ? (
                          <span className="text-emerald-100 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {m.sender_name || "Quản trị viên"}
                          </span>
                        ) : (
                          <span className="text-slate-600 flex items-center gap-1">
                            <User className="w-3 h-3 text-emerald-600" /> {m.sender_name || "Khách hàng"}
                          </span>
                        )}
                      </div>

                      <p className="whitespace-pre-wrap text-[13px]">{m.message}</p>

                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isAdmin ? "text-emerald-100" : "text-slate-400"}`}>
                        <span>
                          {new Date(m.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {isAdmin && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer: Nhập tin nhắn gửi */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 shrink-0">
            <Input
              placeholder={`Nhắn phản hồi cho ${activeConversation?.customer_name || "khách hàng"}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-white rounded-xl h-10 px-5 text-xs shadow-sm"
            >
              <Send className="w-4 h-4" />
              <span>Gửi</span>
            </Button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
