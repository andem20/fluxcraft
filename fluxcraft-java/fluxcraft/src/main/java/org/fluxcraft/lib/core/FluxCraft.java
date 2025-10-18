package org.fluxcraft.lib.core;

import java.nio.file.Path;
import java.nio.file.Paths;

public class FluxCraft {
    static {
        // FIXME
        String osName = System.getProperty("os.name");
        String extention = osName.equalsIgnoreCase("linux") ? "so" : "dll";
        Path path = Paths.get("../../fluxcraft-rs/target/debug/libfluxcraft_jni." + extention).toAbsolutePath();
        System.load(path.toString());
    }

    public Pipeline load(String path) {
        return Pipeline.load(path);
    }
}
