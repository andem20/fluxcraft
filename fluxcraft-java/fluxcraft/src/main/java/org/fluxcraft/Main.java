package org.fluxcraft;

import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.core.Pipeline;

public class Main {
    public static void main(String[] args) {
        FluxCraft fluxcraft = new FluxCraft();

        Pipeline pipeline = fluxcraft.load("/home/anders/Documents/projects/fluxcraft/resources/example_pipelin_2.json");
        byte[] output = pipeline.execute();
        System.out.println(output.length);
    }
}
