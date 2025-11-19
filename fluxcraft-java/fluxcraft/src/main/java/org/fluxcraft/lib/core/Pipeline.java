package org.fluxcraft.lib.core;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.apache.arrow.memory.BufferAllocator;
import org.apache.arrow.memory.RootAllocator;
import org.apache.arrow.vector.VectorSchemaRoot;
import org.apache.arrow.vector.ipc.ArrowStreamReader;
import org.apache.arrow.vector.table.Row;
import org.apache.arrow.vector.table.Table;

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

    public <T> List<T> readArrowStreamFromBytes(byte[] arrowBytes, Class<? extends FluxCraftEntity> clazz)
            throws IOException {

        var start = System.nanoTime();
        try (BufferAllocator allocator = new RootAllocator();
                ByteArrayInputStream bais = new ByteArrayInputStream(arrowBytes);
                ArrowStreamReader reader = new ArrowStreamReader(bais, allocator)) {

            var temp = (System.nanoTime() - start) / 1_000_000.0;
            System.out.println("inputstream: " + temp + "ms");

            start = System.nanoTime();
            VectorSchemaRoot root;
            List<FluxCraftEntity> result = new ArrayList<>();
            while ((root = reader.getVectorSchemaRoot()) != null && reader.loadNextBatch()) {
                System.out.println("Read batch with " + root.getRowCount() + " rows");
                try (Table table = new Table(root)) {
                    for (Row row : table) {
                        FluxCraftEntity entity = FluxCraftEntity.parse(row, clazz);
                        result.add(entity);
                    }
                }
            }
            System.out.println("read: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");

            return null;
        }
    }
}
