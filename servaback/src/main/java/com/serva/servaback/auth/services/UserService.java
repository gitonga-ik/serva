package com.serva.servaback.auth.services;

import com.serva.servaback.auth.dtos.UserCreate;
import com.serva.servaback.auth.models.Role;
import com.serva.servaback.auth.models.User;
import com.serva.servaback.auth.repositories.RoleRepository;
import com.serva.servaback.auth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public String createUser(UserCreate user){
        String DEFAULT_ROLE = "USER";
        String roleName = (user.role() != null && !user.role().isBlank())
                ? user.role().trim().toUpperCase()
                : DEFAULT_ROLE;

        Role userRole = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName));

        User newUser = User.builder()
                .firstName(user.firstName())
                .lastName(user.lastName())
                .email(user.email())
                .contact(user.contact())
                .password(passwordEncoder.encode(user.password()))
                .role(userRole)
                .build();

        userRepository.saveAndFlush(newUser);
        return "User created";
    }
}
