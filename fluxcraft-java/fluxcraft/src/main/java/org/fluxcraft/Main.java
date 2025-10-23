package org.fluxcraft;

import java.io.IOException;

import org.fluxcraft.lib.core.DataFrame;
import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.core.Pipeline;
import org.fluxcraft.lib.core.ReadArrow;

public class Main {
    public static void main(String[] args) {
        FluxCraft fluxcraft = new FluxCraft();

        Pipeline pipeline = fluxcraft
                .load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_2.json");
        DataFrame dataFrame = pipeline.execute();
        var start = System.nanoTime();
        // byte[] result = dataFrame.toCsvBytes(',');
        // System.out.println(new String(result, StandardCharsets.UTF_8));
        // System.out.println(result.length);

        byte[] arrowBytes = dataFrame.toArrow();

        try {
            ReadArrow.readArrowStreamFromPointer(arrowBytes);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("time: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");
    }
}
