package net.balmir.demosd.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public JwtService(@Value("${jwt.secret:}") String jwtSecret) {
        this.secretKey = jwtSecret.isBlank()
                ? Jwts.SIG.HS256.key().build()
                : Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(secretKey)
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaimsFromToken(token).getSubject();
    }

    public Claims extractAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
    public Boolean isTokenValid(String token,UserDetails userDetails) {
        String userName=extractUsername(token);
        return userDetails.getUsername().equals(userName);
    }
    public Boolean isTokenExpired(String token) {
        Date expiration = extractAllClaimsFromToken(token).getExpiration();
        return expiration.before(new Date());
    }

}
