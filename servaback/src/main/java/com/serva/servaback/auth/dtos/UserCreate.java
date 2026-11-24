package com.serva.servaback.auth.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserCreate (
    @NotBlank(message = "Name is required")
    String firstName,

    String  lastName,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Contact Required")
    String contact,

    @NotBlank(message = "Password Required")
    String password,

    String role
) {}
