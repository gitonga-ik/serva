package com.serva.servaback.auth.dtos;

import jakarta.validation.constraints.*;

public record LoginRequest(
        @NotBlank(message = "Email not provided")
        @Email(message = "Provide valid email")
        String email,

        @NotBlank(message = "Password")
        String password
) {}
