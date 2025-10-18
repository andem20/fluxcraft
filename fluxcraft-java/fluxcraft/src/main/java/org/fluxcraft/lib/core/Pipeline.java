package org.fluxcraft.lib.core;

public class Pipeline {
    private long nativeHandle;

    private Pipeline(long nativeHandle) {
        this.nativeHandle = nativeHandle;
    }

    public native byte[] execute();

    protected static native Pipeline load(String path);
}
