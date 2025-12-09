package org.fluxcraft;

import java.io.IOException;

import org.fluxcraft.example.CreateStuffCommand;
import org.fluxcraft.lib.core.DataFrame;
import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.core.Pipeline;

public class Main {
    public static void main(String[] args) {
        FluxCraft fluxcraft = new FluxCraft();

        Pipeline pipeline = fluxcraft
                .load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_3.json");
        DataFrame dataFrame = pipeline.execute();
        System.out.println("Output type: " + pipeline.getOutputType());
        var start = System.nanoTime();

        byte[] arrowBytes = dataFrame.toArrow();
        System.out.println("toArrow: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");

        try {
            pipeline.readArrowStreamFromBytes(arrowBytes, CreateStuffCommand.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("total: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");
    }
}
