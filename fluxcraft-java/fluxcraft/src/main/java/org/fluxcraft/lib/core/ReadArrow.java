package org.fluxcraft.lib.core;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.apache.arrow.memory.BufferAllocator;
import org.apache.arrow.memory.RootAllocator;
import org.apache.arrow.vector.VectorSchemaRoot;
import org.apache.arrow.vector.ipc.ArrowStreamReader;
import org.apache.arrow.vector.table.Row;
import org.apache.arrow.vector.table.Table;

public class ReadArrow {
    public static void readArrowStreamFromBytes(byte[] arrowBytes) throws IOException {
        var start = System.nanoTime();
        try (BufferAllocator allocator = new RootAllocator();
                ByteArrayInputStream bais = new ByteArrayInputStream(arrowBytes);
                ArrowStreamReader reader = new ArrowStreamReader(bais, allocator)) {

            var temp = (System.nanoTime() - start) / 1_000_000.0;
            System.out.println("inputstream: " + temp + "ms");
            start = System.nanoTime();
            VectorSchemaRoot root;
            while ((root = reader.getVectorSchemaRoot()) != null && reader.loadNextBatch()) {
                System.out.println("Read batch with " + root.getRowCount() + " rows");
                try (Table table = new Table(root)) {
                    int count = 0;
                    for (Row row : table) {
                        count += row.getBigInt(0);
                    }
                }
                // for (int i = 0; i < root.getRowCount(); i++) {
                // String row = "";
                // for (FieldVector fieldVector : root.getFieldVectors()) {
                // row += fieldVector.getObject(i);
                // row += ",";
                // }
                // System.out.println("");
                // System.out.println(row);
                // }
            }
            System.out.println("read: " + (System.nanoTime() - start) / 1_000_000.0 + "ms");
        }
    }
}
