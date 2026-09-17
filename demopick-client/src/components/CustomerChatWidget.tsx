import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Bot, ShieldCheck, Minimize2 } from "lucide-react";
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sinh và lưu trữ session_id của khách trong LocalStorage
  const [sessionId] = useState<string>(() => {
    let saved = localStorage.getItem("demopick_chat_session");
    if (!saved) {
      saved = "GUEST_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();
      localStorage.setItem("demopick_chat_session", saved);
    }
    return saved;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Nạp lịch sử tin nhắn và Auto-polling 3 giây/lần khi khung chat đang mở
  useEffect(() => {
    let interval: any = null;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/user/chat/messages?session_id=${sessionId}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMessages(res.data.data);
        }
      } catch {
        // Fallback tin nhắn chào mặc định nếu chưa có kết nối
        if (messages.length === 0) {
          setMessages([
            {
              id: 1,
              session_id: sessionId,
              sender_type: "admin",
              sender_name: "DemoPick Assistant",
              message: "Xin chào! DemoPick Club có thể hỗ trợ gì cho bạn về đặt sân hoặc mua phụ kiện Pickleball?",
              created_at: new Date().toISOString(),
            },
          ]);
        }
      }
    };

    if (isOpen) {
      fetchMessages();
      interval = setInterval(fetchMessages, 3000); // Polling mỗi 3 giây
    }

    return () => {
      if (interval) clearInterval(interval);
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
      await api.post("/user/chat/send", {
        session_id: sessionId,
        message: textToSend,
      });
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
        <div className="w-[350px] sm:w-[380px] h-[500px] bg-card text-card-foreground rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
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
                  Trực tuyến | Phản hồi ngay
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

          {/* Danh sách tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/30 text-xs">
            {messages.map((m) => {
              const isAdmin = m.sender_type === "admin";
              return (
                <div key={m.id} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl ${
                      isAdmin
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
