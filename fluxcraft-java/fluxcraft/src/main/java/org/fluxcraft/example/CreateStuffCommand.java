package org.fluxcraft.example;

import java.time.ZonedDateTime;

import org.fluxcraft.lib.core.Column;
import org.fluxcraft.lib.core.FluxCraftEntity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStuffCommand implements FluxCraftEntity {
    long id;
    @Column("station")
    long stationId;
    @Column("product")
    long productId;
    double volume;
    @Column("parsed_time")
    ZonedDateTime timestamp;
}