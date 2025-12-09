package org.fluxcraft.lib.core;

import java.lang.reflect.Field;

import org.apache.arrow.vector.table.Row;
import org.fluxcraft.lib.util.ExtractUtil;

public interface FluxCraftEntity {

    static <T> T parse(Row row, Class<?> clazz) {
        try {
            @SuppressWarnings("unchecked")
            T instance = (T) clazz.getDeclaredConstructor().newInstance();

            for (Field field : clazz.getDeclaredFields()) {
                field.setAccessible(true);

                String columnName = field.getName();
                Object value = ExtractUtil.extractValue(row, columnName, field.getType());

                if (value != null) {
                    field.set(instance, value);
                }
            }

            return instance;

        } catch (Exception e) {
            throw new RuntimeException("Failed to map row to " + clazz, e);
        }
    }
}