package org.fluxcraft.lib.core;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.fluxcraft.annotation.api.FluxcraftComponent;

@FluxcraftComponent
public final class FluxCraftRegistry {
    private static Map<String, Class<?>> registry = org.fluxcraft.generated.FluxcraftComponentRegistry.CLASS_NAMES
            .stream().filter(n -> !FluxCraftRegistry.class.getName().equals(n))
            .map(FluxCraftRegistry::toClass)
            .collect(Collectors.toMap(n -> n.getName(), Function.identity()));

    private static Class<?> toClass(String className) {
        try {
            return Class.forName(className);
        } catch (ClassNotFoundException e) {
            e.printStackTrace(); // FIXME
            return null;
        }
    }

    public static Map<String, Class<?>> getRegistry() {
        return registry;
    }
}
