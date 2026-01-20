package org.fluxcraft.lib.core;

import java.io.IOException;
import java.util.List;

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

    public <T extends FluxCraftEntity> List<T> execute(Class<T> outputType) throws IOException {
        return this.execute().parse(outputType);
    }
}
