package org.fluxcraft.lib.core;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

public class FluxCraft {
    static {
        loadNativeModule("libfluxcraft_jni");
    }

    public Pipeline load(String path) {
        return Pipeline.load(path);
    }

    private static void loadNativeModule(String baseName) {
        String os = System.getProperty("os.name").toLowerCase();
        String ext = os.contains("win") ? "dll" : os.contains("mac") ? "dylib" : "so";

        String resourceName = baseName + "." + ext;

        try (InputStream in = ClassLoader.getSystemResourceAsStream(resourceName)) {
            if (in == null) {
                throw new RuntimeException("Native library not found: " + resourceName);
            }

            Path temp = Files.createTempFile(baseName, "." + ext);
            temp.toFile().deleteOnExit();

            Files.copy(in, temp, StandardCopyOption.REPLACE_EXISTING);
            System.load(temp.toAbsolutePath().toString());
        } catch (IOException e) {
            throw new RuntimeException("Failed to load native library", e);
        }
    }

}
