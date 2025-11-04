package org.fluxcraft.lib.core;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class Pipeline {
    private final long nativeHandle;
    private final String outputType;

    public native DataFrame execute();

    protected static native Pipeline load(String path);

    public String getOutputType() {
        return outputType;
    }
}
