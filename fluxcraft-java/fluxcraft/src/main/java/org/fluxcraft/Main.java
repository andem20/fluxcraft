package org.fluxcraft;

import org.fluxcraft.lib.core.DataFrame;
import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.core.Pipeline;

public class Main {
    public static void main(String[] args) {
        FluxCraft fluxcraft = new FluxCraft();

        Pipeline pipeline = fluxcraft.load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_2.json");
        DataFrame dataFrame = pipeline.execute();
        byte[] result = dataFrame.toCsvBytes(',');
        System.out.println(result.length);
    }
}
