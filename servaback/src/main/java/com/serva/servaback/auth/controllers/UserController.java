package com.serva.servaback.auth.controllers;

import com.serva.servaback.auth.dtos.LoginRequest;
import com.serva.servaback.auth.dtos.RoleCreate;
import com.serva.servaback.auth.dtos.UserCreate;
import com.serva.servaback.auth.services.RoleService;
import com.serva.servaback.auth.services.UserService;
import com.serva.servaback.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RequiredArgsConstructor
@RestController
@RequestMapping("api/auth/")
public class UserController {
    private final UserService userService;
    private final JwtService jwtService;
    private final RoleService roleService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public String createUser(@RequestBody UserCreate user){
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Boolean>> login(@RequestBody @NonNull LoginRequest user) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.email(), user.password()));

        UserDetails usr = (UserDetails) auth.getPrincipal();
        assert usr != null;
        String token = jwtService.generateToken(usr);

        ResponseCookie cookie = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .path("/")
                .maxAge(Duration.ofHours(1))
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("success", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cleared = ResponseCookie.from("access_token", "")
                .httpOnly(true).secure(true).sameSite("Lax").path("/").maxAge(0).build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .build();
    }

    @GetMapping("/whoami")
    public Map<String, Object> me(@AuthenticationPrincipal UserDetails user) {
        return Map.of(
                "username", user.getUsername(),
                "roles", user.getAuthorities()
        );
    }

    @PostMapping("/role")
    public RoleCreate createRole(@RequestBody RoleCreate role){
        return roleService.createRole(role);
    }
}
