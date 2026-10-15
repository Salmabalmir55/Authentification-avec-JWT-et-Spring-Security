package net.balmir.demosd.dto;

public record LoginRequest(
        String email,
        String password
) {
}
