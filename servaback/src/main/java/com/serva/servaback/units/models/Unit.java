package com.serva.servaback.units.models;

import com.serva.servaback.units.enums.UnitType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "serva_hse_unit"
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

    @Builder.Default
    @Column(name = "unit_type", nullable = false)
    private UnitType unitType = UnitType.TWO_BEDROOM;

    @Column(name = "unit_price",  nullable = false)
    private Double unitPrice;

    @Column(name = "occupied", nullable = false)
    private Boolean occupied;

    @Column(name = "date_cr", updatable = false)
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
