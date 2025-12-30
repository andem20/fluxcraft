package org.fluxcraft.lib.core;

import java.net.URISyntaxException;
import java.nio.file.Path;

public class FluxCraft {
    static {
        // FIXME
        String osName = System.getProperty("os.name");
        String extention = osName.equalsIgnoreCase("linux") ? "so" : "dll";
        Path path;
        try {
            path = Path.of(ClassLoader.getSystemResource("libfluxcraft_jni." + extention).toURI()).toAbsolutePath();
            System.load(path.toString());
        } catch (URISyntaxException e) {
            e.printStackTrace();
        }
    }

    public Pipeline load(String path) {
        return Pipeline.load(path);
    }
}
