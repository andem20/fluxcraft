package org.fluxcraft.lib.core;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import org.apache.arrow.memory.BufferAllocator;
import org.apache.arrow.memory.RootAllocator;
import org.apache.arrow.vector.VectorSchemaRoot;
import org.apache.arrow.vector.ipc.ArrowStreamReader;
import org.apache.arrow.vector.table.Row;
import org.apache.arrow.vector.table.Table;
import org.fluxcraft.example.SomeService.CreateStuffCommand;

public class ReadArrow {
    public static VectorSchemaRoot readArrowStreamFromBytes(byte[] arrowBytes) throws IOException {
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
                    for (Row row : table) {
                        long id = row.getBigInt(0);
                        long stationId = row.getBigInt(1);
                        long productId = row.getBigInt(2);
                        double volume = row.getFloat8(3);
                        ZonedDateTime timestamp = ZonedDateTime.of(row.getTimeStampMicroObj(6), ZoneId.systemDefault());

                        CreateStuffCommand command = new CreateStuffCommand(id, stationId, productId, volume,
                                timestamp);
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

            return root;
        }
    }
}
