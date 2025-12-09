package org.fluxcraft.example;

import java.time.ZonedDateTime;

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
    long station;
    long product;
    double volume;
    ZonedDateTime parsed_time;
}