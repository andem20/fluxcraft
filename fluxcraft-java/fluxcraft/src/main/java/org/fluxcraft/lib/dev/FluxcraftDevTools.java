package org.fluxcraft.lib.dev;

public class FluxcraftDevTools {

    private static FluxcraftDevTools instance;

    private native void startServer(String response);

    public static FluxcraftDevTools init() {
        if (instance == null) {
            instance = new FluxcraftDevTools();
            instance.startServer("Hello");
        }

        return instance;
    }
}
