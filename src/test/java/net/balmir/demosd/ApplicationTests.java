package net.balmir.demosd;

import net.balmir.demosd.controller.AuthController;
import net.balmir.demosd.dto.AuthResponse;
import net.balmir.demosd.dto.LoginRequest;
import net.balmir.demosd.dto.RegisterRequest;
import net.balmir.demosd.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class ApplicationTests {

    @Autowired
    private AuthController authController;

    @Autowired
    private JwtService jwtService;

    @Test
    void contextLoads() {
    }

    @Test
    void registeredUserCanLogInAndReceiveValidToken() {
        String email = "test-" + UUID.randomUUID() + "@example.invalid";
        String password = "test-password-123";

        assertEquals(HttpStatus.OK, authController.register(new RegisterRequest(email, password)).getStatusCode());

        AuthResponse response = authController.login(new LoginRequest(email, password));

        assertNotNull(response.token());
        assertEquals(email, jwtService.extractUsername(response.token()));
    }

}
