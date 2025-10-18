package org.fluxcraft;

import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.core.Pipeline;

public class Main {
    public static void main(String[] args) {
        FluxCraft fluxcraft = new FluxCraft();

        try {
            Pipeline pipeline = fluxcraft.load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_2.json");
            byte[] output = pipeline.execute();
            System.out.println(output.length);
        } catch(Exception e) {
            System.err.println(e);
        }
    }
}
