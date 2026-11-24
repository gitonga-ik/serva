package com.serva.servaback.auth.models;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "serva_auth_roles"
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name")
    private String name;

    @Column(name = "role_description")
    private String description;

    @Column(name = "date_cr", nullable = false, updatable = false)
    private LocalDateTime dateCr;

    @Column(name = "date_lu",  nullable = false)
    private LocalDateTime dateLu;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.dateCr = now;
        this.dateLu = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.dateLu = LocalDateTime.now();
    }
}
