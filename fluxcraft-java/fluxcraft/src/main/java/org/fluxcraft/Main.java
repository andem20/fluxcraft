package org.fluxcraft;

import java.io.IOException;

import org.fluxcraft.example.CreateStuffCommand;
import org.fluxcraft.lib.core.DataFrame;
import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.core.Pipeline;

import lombok.extern.log4j.Log4j2;

@Log4j2
public class Main {
    public static void main(String[] args) {
        FluxCraft fluxcraft = new FluxCraft();

        Pipeline pipeline = fluxcraft
                .load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_3.json");
        DataFrame dataFrame = pipeline.execute();
        log.debug("Output type: " + pipeline.getOutputType());
        var start = System.nanoTime();

        try {
            dataFrame.parse(CreateStuffCommand.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        log.debug("total: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");
    }
}
