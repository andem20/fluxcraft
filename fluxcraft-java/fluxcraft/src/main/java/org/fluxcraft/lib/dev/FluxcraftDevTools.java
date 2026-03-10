package org.fluxcraft.lib.dev;

import java.lang.reflect.Field;

import org.fluxcraft.lib.core.FluxCraftRegistry;

public class FluxcraftDevTools {

    private static FluxcraftDevTools instance;

    private native void startServer(String response);

    public static FluxcraftDevTools init() {
        if (instance == null) {
            instance = new FluxcraftDevTools();
            StringBuilder builder = new StringBuilder();
            builder.append("[");
            FluxCraftRegistry.getRegistry().entrySet().forEach(entry -> {
                builder.append("{");
                addQuoted(builder, "type");
                builder.append(":");
                addQuoted(builder, entry.getKey());
                builder.append(",");
                addQuoted(builder, "fields");
                builder.append(": {");
                Field[] fields = entry.getValue().getDeclaredFields();
                for (int i = 0; i < fields.length; i++) {
                    Field field = fields[i];
                    addQuoted(builder, field.getName());
                    builder.append(":");
                    addQuoted(builder, field.getType().getSimpleName());
                    if (i + 1 != fields.length) {
                        builder.append(",");
                    }
                }
                builder.append("}}");
            });
            builder.append("]");
            instance.startServer(builder.toString());
        }

        return instance;
    }

    private static void addQuoted(StringBuilder builder, String key) {
        builder.append("\"");
        builder.append(key);
        builder.append("\"");
    }
}
