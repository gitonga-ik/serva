package com.serva.servaback.auth.dtos;

import jakarta.validation.constraints.NotBlank;

public record RoleCreate(
        @NotBlank(message = "Role name required")
        String name,

        @NotBlank(message = "Role description required")
        String description
) {}
