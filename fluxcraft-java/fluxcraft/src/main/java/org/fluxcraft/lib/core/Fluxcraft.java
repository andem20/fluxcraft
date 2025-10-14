package org.fluxcraft.lib.core;

import java.nio.file.Path;
import java.nio.file.Paths;

public class Fluxcraft {

    /* 
     * TODO
     * load pipeline
     * execute
     * ...
     */

    static {
        // FIXME
        String osName = System.getProperty("os.name");
        String extention = osName.equalsIgnoreCase("linux") ? "so" : "dll";
        Path path = Paths.get("../../fluxcraft-rs/target/debug/libfluxcraft_jni." + extention).toAbsolutePath();
        System.load(path.toString());
    }
}
