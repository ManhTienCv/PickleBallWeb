package com.demopick.pickleball.modules.user.dto;

import com.demopick.pickleball.modules.user.entity.User;

import java.util.List;

public class AuthResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private String role;
    private List<String> roles;

    public AuthResponse() {}

    public AuthResponse(Long id, String name, String email, String phone, String avatarUrl, String role, List<String> roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.roles = roles;
    }

    public static AuthResponse fromUser(User user) {
        String r = user.getRole();
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                r,
                List.of(r)
        );
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
