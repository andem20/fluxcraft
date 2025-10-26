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
                .load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_3.json");
        DataFrame dataFrame = pipeline.execute();
        var start = System.nanoTime();

        // byte[] csvBytes = dataFrame.toCsvBytes(',');
        // String[] stringArr = new String(csvBytes, StandardCharsets.UTF_8).split(",");

        // for (String s : stringArr) {
        // System.out.println(s);
        // }

        byte[] arrowBytes = dataFrame.toArrow();
        System.out.println("toArrow: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");

        try {
            ReadArrow.readArrowStreamFromBytes(arrowBytes);
        } catch (IOException e) {
            e.printStackTrace();
        }

        System.out.println("total: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");
    }
}
