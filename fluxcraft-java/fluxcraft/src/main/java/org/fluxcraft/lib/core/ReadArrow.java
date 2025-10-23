package org.fluxcraft.lib.core;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.apache.arrow.memory.BufferAllocator;
import org.apache.arrow.memory.RootAllocator;
import org.apache.arrow.vector.FieldVector;
import org.apache.arrow.vector.VectorSchemaRoot;
import org.apache.arrow.vector.ipc.ArrowStreamReader;

public class ReadArrow {
    public static void readArrowStreamFromPointer(byte[] arrowBytes) throws IOException {
        try (BufferAllocator allocator = new RootAllocator();
                ByteArrayInputStream bais = new ByteArrayInputStream(arrowBytes);
                ArrowStreamReader reader = new ArrowStreamReader(bais, allocator)) {

            VectorSchemaRoot root;
            while ((root = reader.getVectorSchemaRoot()) != null && reader.loadNextBatch()) {
                System.out.println("Read batch with " + root.getRowCount() + " rows");
                for (int i = 0; i < root.getRowCount(); i++) {
                    String row = "";
                    for (FieldVector fieldVector : root.getFieldVectors()) {
                        row += fieldVector.getObject(i);
                        row += ",";
                    }
                    System.out.println("");
                    System.out.println(row);
                }
            }
        }
    }
}
