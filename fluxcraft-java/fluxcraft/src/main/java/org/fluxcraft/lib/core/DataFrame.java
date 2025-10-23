package org.fluxcraft.lib.core;

public class DataFrame {
    private long nativeHandle;

    private DataFrame(long nativeHandle) {
        this.nativeHandle = nativeHandle;
    }

    public native byte[] toCsvBytes(char separator);

    public native byte[] toArrow();
}
