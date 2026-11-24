package com.serva.servaback.auth.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "serva_auth_user"
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usr_uri")
    private Long id;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(unique = true, name = "email")
    private String email;

    @Column(name = "contact")
    private String contact;

    @Column(name = "password")
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usr_role", referencedColumnName = "id", nullable = false)
    private Role role;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "date_cr", nullable = false, updatable = false)
    private LocalDateTime dateCr;

    @Column(name = "date_lu", nullable = false)
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
