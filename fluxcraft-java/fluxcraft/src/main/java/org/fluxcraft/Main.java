package org.fluxcraft;

import org.fluxcraft.lib.core.Fluxcraft;
import org.fluxcraft.lib.core.Pipeline;

public class Main {
    public static void main(String[] args) {
        Fluxcraft fluxcraft = new Fluxcraft();

        Pipeline pipeline = Pipeline.load("/home/anders/Documents/projects/fluxcraft/resources/example_pipeline_2.json");

        byte[] output = pipeline.execute();
        System.out.println(output.length);
    }
}
