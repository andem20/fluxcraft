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

import lombok.extern.log4j.Log4j2;

@Log4j2
public class DataFrame {
    private long nativeHandle;

    private DataFrame(long nativeHandle) {
        this.nativeHandle = nativeHandle;
    }

    public native byte[] toCsvBytes(char separator);

    public native byte[] toArrow();

    public <T> List<T> parse(Class<? extends FluxCraftEntity> clazz) throws IOException {
        byte[] arrowBytes = this.toArrow();

        var start = System.nanoTime();
        try (BufferAllocator allocator = new RootAllocator();
                ByteArrayInputStream bais = new ByteArrayInputStream(arrowBytes);
                ArrowStreamReader reader = new ArrowStreamReader(bais, allocator)) {

            var temp = (System.nanoTime() - start) / 1_000_000.0;
            log.debug("inputstream: " + temp + "ms");

            start = System.nanoTime();
            VectorSchemaRoot root;
            List<FluxCraftEntity> result = new ArrayList<>();
            while ((root = reader.getVectorSchemaRoot()) != null && reader.loadNextBatch()) {
                log.debug("Read batch with " + root.getRowCount() + " rows");
                try (Table table = new Table(root)) {
                    for (Row row : table) {
                        FluxCraftEntity entity = FluxCraftEntity.parse(row, clazz);
                        result.add(entity);
                    }
                }
            }
            log.debug("read: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");

            return null;
        }
    }
}
