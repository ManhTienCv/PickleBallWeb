package com.demopick.pickleball.modules.chat.controller;

import com.demopick.pickleball.common.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/admin/chat/messages/{sessionId}")
    public ResponseEntity<Map<String, Object>> getMessages(@PathVariable String sessionId) {
        List<Map<String, Object>> messages = sessionMessages.getOrDefault(sessionId, Collections.emptyList());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", messages);
        response.put("message", "Lấy tin nhắn thành công.");
        return ResponseEntity.ok(response);
    }

    @PostMapping({"/admin/chat/messages", "/chat/messages"})
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody Map<String, Object> payload) {
        String sessionId = String.valueOf(payload.getOrDefault("session_id", "SESSION-" + UUID.randomUUID().toString().substring(0, 8)));
        String senderType = String.valueOf(payload.getOrDefault("sender_type", "user"));
        String senderName = String.valueOf(payload.getOrDefault("sender_name", senderType.equals("admin") ? "Lễ tân" : "Khách hàng"));
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

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", msg);
        response.put("message", "Gửi tin nhắn thành công.");
        return ResponseEntity.ok(response);
    }
}
