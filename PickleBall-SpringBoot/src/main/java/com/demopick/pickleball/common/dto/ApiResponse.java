package com.demopick.pickleball.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private T data;
    private Object error;
    private String message;
    private Map<String, Object> meta;
    private Boolean success;

    public ApiResponse() {}

    public ApiResponse(T data, Object error, String message, Map<String, Object> meta) {
        this.data = data;
        this.error = error;
        this.message = message;
        this.meta = meta;
        this.success = (error == null);
    }

    public ApiResponse(T data, Object error, String message, Map<String, Object> meta, boolean success) {
        this.data = data;
        this.error = error;
        this.message = message;
        this.meta = meta;
        this.success = success;
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(data, null, message, null, true);
    }

    public static <T> ApiResponse<T> success(T data, String message, Map<String, Object> meta) {
        return new ApiResponse<>(data, null, message, meta, true);
    }

    public static <T> ApiResponse<T> error(String message, Object errorDetails) {
        return new ApiResponse<>(null, errorDetails != null ? errorDetails : "ERROR", message, null, false);
    }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }

    public Object getError() { return error; }
    public void setError(Object error) { this.error = error; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Map<String, Object> getMeta() { return meta; }
    public void setMeta(Map<String, Object> meta) { this.meta = meta; }

    @com.fasterxml.jackson.annotation.JsonProperty("success")
    public boolean isSuccess() {
        if (success != null) return success;
        return error == null;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
