package org.fluxcraft.lib.util;

import java.nio.ByteBuffer;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.UUID;

import org.apache.arrow.vector.table.Row;

import lombok.experimental.UtilityClass;

@UtilityClass
public class ExtractUtil {

    public static Object extractValue(Row row, String column, Class<?> type) {
        return switch (type) {
            case Class<?> t when t == int.class || t == Integer.class -> row.getInt(column);
            case Class<?> t when t == long.class || t == Long.class -> row.getBigInt(column);
            case Class<?> t when t == float.class || t == Float.class -> row.getFloat4(column);
            case Class<?> t when t == double.class || t == Double.class -> row.getFloat8(column);
            case Class<?> t when t == short.class || t == Short.class -> row.getUInt2(column);
            case Class<?> t when t == byte.class || t == Byte.class -> row.getUInt1(column);
            case Class<?> t when t == boolean.class || t == Boolean.class -> row.getBit(column);
            case Class<?> t when t == String.class -> row.getVarCharObj(column);
            case Class<?> t when t == byte[].class -> row.getVarBinary(column);
            case Class<?> t when t == java.time.LocalDate.class -> row.getDateMilli(column);
            case Class<?> t when t == java.time.LocalTime.class -> row.getTimeMilli(column);
            case Class<?> t when t == java.time.Instant.class -> row.getTimeStampMilli(column);
            case Class<?> t when t == java.time.ZonedDateTime.class -> extractZonedDateTime(row, column);
            case Class<?> t when t == java.util.UUID.class -> extractUUID(row, column);

            default -> throw new IllegalArgumentException(
                    "Unsupported Arrow → Java mapping for type: " + type.getName());
        };
    }

    public static ZonedDateTime extractZonedDateTime(Row row, String column) {
        return ZonedDateTime.of(row.getTimeStampMicroObj(column), ZoneId.systemDefault());
    }

    public static UUID extractUUID(Row row, String column) {
        Object raw = row.getVarCharObj(column); // or getVarBinaryObj depending on schema

        if (raw == null)
            return null;

        if (raw instanceof byte[] bytes) {
            // 16-byte binary
            ByteBuffer buf = ByteBuffer.wrap(bytes);
            return new UUID(buf.getLong(), buf.getLong());
        }

        if (raw instanceof String s) {
            return UUID.fromString(s);
        }

        throw new IllegalArgumentException("Cannot convert column " + column + " to UUID");
    }
}
