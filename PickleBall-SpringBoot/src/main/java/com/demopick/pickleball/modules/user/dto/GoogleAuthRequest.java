package com.demopick.pickleball.modules.user.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public class GoogleAuthRequest {
    private String email;
    private String name;
    private String phone;

    @JsonAlias({"avatar_url", "picture", "avatar"})
    private String picture;

    @JsonAlias({"google_id", "sub", "googleId"})
    private String googleId;

    @JsonAlias({"access_token", "accessToken"})
    private String accessToken;

    public GoogleAuthRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }

    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
}
