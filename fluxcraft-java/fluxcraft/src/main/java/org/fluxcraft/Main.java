package org.fluxcraft;

import org.fluxcraft.lib.core.Fluxcraft;

public class Main {
    public static void main(String[] args) {
        Fluxcraft fluxcraft = new Fluxcraft();

        String output = fluxcraft.hello("Andy");
        System.out.println(output);
    }
}
