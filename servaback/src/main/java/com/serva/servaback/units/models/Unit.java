package com.serva.servaback.units.models;

import com.serva.servaback.units.UnitType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "unit"
)
@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Unit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "unit_uri")
    private Long id;

    @Column(name = "unit_number", length = 10, nullable = false)
    private String unitNumber;

    @Column(name = "unit_type", nullable = false)
    private UnitType unitType;

    @Column(name = "unit_price",  nullable = false)
    private Double unitPrice;

    @Column(name = "occupied", nullable = false)
    private Boolean occupied;

    @Column(name = "date_cr", insertable = false, updatable = false)
    private LocalDateTime dateCr;

    @Column(name = "date_lu", insertable = false, updatable = false)
    private LocalDateTime dateLu;

    @PrePersist
    public void prePersist() {
        this.dateCr = LocalDateTime.now();
    }

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
