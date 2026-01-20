package org.fluxcraft.lib.core;

import java.util.concurrent.ConcurrentHashMap;

public final class FluxCraftRegistry {
    private static ConcurrentHashMap<String, Class<? extends FluxCraftEntity>> registry = new ConcurrentHashMap<>();

    public static synchronized void register(Class<? extends FluxCraftEntity> clazz) {
        if (registry.contains(clazz)) {
            throw new IllegalArgumentException("Cannot insert already registered class: " + clazz);
        }

        registry.put(clazz.getSimpleName(), clazz);
    }

    public static Class<? extends FluxCraftEntity> get(String className) {
        return registry.get(className);
    }
}
