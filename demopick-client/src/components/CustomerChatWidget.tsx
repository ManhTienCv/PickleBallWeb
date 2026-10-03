import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, ShieldCheck, Minimize2, Phone } from "lucide-react";
import api from "@/lib/api";

interface ChatMessage {
  id: number;
  session_id: string;
  sender_type: "user" | "admin";
  sender_name: string;
  message: string;
  created_at: string;
}

export default function CustomerChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 1,
      session_id: "default",
      sender_type: "admin",
      sender_name: "DemoPick Assistant",
      message: "Xin chào! DemoPick Club có thể hỗ trợ gì cho bạn về đặt sân hoặc mua phụ kiện Pickleball?",
      created_at: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Tự động đóng khung chat khi nhấp chuột ra ngoài (Click Outside Dismiss) hoặc bấm phím Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Sinh và lưu trữ session_id và chatToken của khách trong LocalStorage (Chống IDOR)
  const [sessionId] = useState<string>(() => {
    let saved = localStorage.getItem("demopick_chat_session");
    if (!saved) {
      saved = "GUEST_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
      localStorage.setItem("demopick_chat_session", saved);
    }
    return saved;
  });

  const [chatToken, setChatToken] = useState<string>(() => {
    return localStorage.getItem("demopick_chat_token") || "";
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Nạp lịch sử tin nhắn ban đầu (1 lần duy nhất) và duy trì stream SSE thời gian thực
  useEffect(() => {
    if (!isOpen || !sessionId) return;

    let eventSource: EventSource | null = null;

    // 1. Nạp tin nhắn ban đầu 1 lần duy nhất
    const fetchInitialMessages = async () => {
      try {
        const tokenParam = chatToken ? `&token=${encodeURIComponent(chatToken)}` : "";
        const res = await api.get(`/chat/messages?session_id=${sessionId}${tokenParam}`, {
          headers: {
            "X-Skip-Auth-Modal": "true",
            ...(chatToken ? { "X-Chat-Token": chatToken } : {}),
          },
        });
        if (res.data?.session_token) {
          setChatToken(res.data.session_token);
          localStorage.setItem("demopick_chat_token", res.data.session_token);
        }
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setMessages(res.data.data);
        }
      } catch {
        // Fallback tin nhắn chào mặc định nếu chưa có kết nối
        setMessages((prev) => {
          if (prev.length === 0) {
            return [
              {
                id: 1,
                session_id: sessionId,
                sender_type: "admin",
                sender_name: "DemoPick Assistant",
                message: "Xin chào! DemoPick Club có thể hỗ trợ gì cho bạn về đặt sân hoặc mua phụ kiện Pickleball?",
                created_at: new Date().toISOString(),
              },
            ];
          }
          return prev;
        });
      }
    };

    fetchInitialMessages();

    // 2. Mở kết nối Server-Sent Events (SSE) thời gian thực chuẩn Senior (Zero Polling)
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || "/api/v1";
      const streamUrl = `${apiBase}/chat/stream?session_id=${encodeURIComponent(sessionId)}`;
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener("message", (e) => {
        try {
          const newMsg: ChatMessage = JSON.parse(e.data);
          if (newMsg && newMsg.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              if (
                newMsg.sender_type === "user" &&
                prev.some((m) => m.sender_type === "user" && m.message === newMsg.message)
              ) {
                return prev.map((m) =>
                  m.sender_type === "user" && m.message === newMsg.message ? newMsg : m
                );
              }
              return [...prev, newMsg];
            });
          }
        } catch (err) {
          console.warn("Lỗi parse SSE message:", err);
        }
      });

      eventSource.onerror = () => {
        // Trình duyệt tự động reconnect theo chuẩn SSE khi rớt mạng
      };
    } catch (err) {
      console.warn("Khởi tạo EventSource SSE thất bại:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isOpen, sessionId]);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");

    // Optimistic UI update
    const optimisticMsg: ChatMessage = {
      id: Date.now(),
      session_id: sessionId,
      sender_type: "user",
      sender_name: "Tôi",
      message: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      setIsSending(true);
      const res = await api.post(
        "/chat/messages",
        {
          session_id: sessionId,
          message: textToSend,
          sender_type: "user",
          sender_name: "Khách hàng",
          token: chatToken,
        },
        {
          headers: {
            "X-Skip-Auth-Modal": "true",
            ...(chatToken ? { "X-Chat-Token": chatToken } : {}),
          },
        }
      );
      if (res.data?.session_token && !chatToken) {
        setChatToken(res.data.session_token);
        localStorage.setItem("demopick_chat_token", res.data.session_token);
      }
    } catch {
      // Giữ tin nhắn optimistic nếu lỗi kết nối
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút bấm Floating Button mở Chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all relative group cursor-pointer"
          aria-label="Mở khung chat hỗ trợ"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
            Hỗ trợ trực tuyến 24/7
          </span>
        </button>
      )}

      {/* Cửa sổ Khung Chat */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="w-[350px] sm:w-[380px] h-[500px] bg-card text-card-foreground rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Hỗ Trợ DemoPick Club</h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse inline-block"></span>
                  Trực tuyến | Hotline: 1900 6868
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Thu nhỏ khung chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Dòng lưu ý phản hồi chậm & Hotline liên hệ trực tiếp */}
          <div className="bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/25 px-3.5 py-2.5 text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2 shrink-0">
            <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Tư vấn viên có thể phản hồi chậm do quá tải. Quý khách cần hỗ trợ gấp vui lòng gọi trực tiếp hotline{' '}
              <a href="tel:19006868" className="font-bold text-emerald-700 dark:text-emerald-400 underline hover:text-emerald-800">
                1900 6868
              </a>.
            </p>
          </div>

          {/* Danh sách tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/30 text-xs">
            {messages.map((m) => {
              const isAdmin = m.sender_type === "admin";
              return (
                <div key={m.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl ${isAdmin
                      ? "bg-card text-foreground border border-border rounded-tl-none shadow-sm"
                      : "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/20"
                      }`}
                  >
                    {isAdmin && (
                      <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {m.sender_name || "Tư vấn viên"}
                      </p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap text-[13px]">{m.message}</p>
                    <p className={`text-[9px] mt-1 text-right ${isAdmin ? "text-muted-foreground" : "text-emerald-100"}`}>
                      {new Date(m.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập tin nhắn */}
          <form onSubmit={handleSendMessage} className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
            <input
              type="text"
              placeholder="Nhập tin nhắn để được hỗ trợ..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-muted/50 border border-input rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-foreground"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              className="w-10 h-10 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
