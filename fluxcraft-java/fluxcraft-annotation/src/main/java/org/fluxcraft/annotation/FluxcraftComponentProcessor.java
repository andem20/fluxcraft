package org.fluxcraft.annotation;

import java.io.Writer;
import java.util.Iterator;
import java.util.Set;
import java.util.TreeSet;

import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.tools.JavaFileObject;

import org.fluxcraft.annotation.api.FluxcraftComponent;

@SupportedAnnotationTypes("org.fluxcraft.annotation.api.FluxcraftComponent")
@SupportedSourceVersion(SourceVersion.RELEASE_21)
public class FluxcraftComponentProcessor extends AbstractProcessor {

    public final Set<String> components = new TreeSet<>();

    @Override
    public boolean process(Set<? extends TypeElement> annotations,
            RoundEnvironment roundEnv) {

        for (Element element : roundEnv.getElementsAnnotatedWith(FluxcraftComponent.class)) {

            if (element.getKind() != ElementKind.CLASS)
                continue;

            TypeElement type = (TypeElement) element;
            components.add(type.getQualifiedName().toString());
        }

        if (roundEnv.processingOver() && !components.isEmpty()) {
            generateRegistry();
        }

        return true;
    }

    private void generateRegistry() {
        try {
            String pkg = "org.fluxcraft.generated";
            String cls = "FluxcraftComponentRegistry";

            JavaFileObject file = processingEnv.getFiler()
                    .createSourceFile(pkg + "." + cls);

            try (Writer w = file.openWriter()) {
                w.write("""
                        package %s;

                        import java.util.List;

                        public final class %s {
                            private %s() {}

                            public static final List<String> CLASS_NAMES = List.of(
                        """.formatted(pkg, cls, cls));

                Iterator<String> it = components.iterator();
                while (it.hasNext()) {
                    String c = it.next();
                    w.write("        \"" + c + "\"");
                    if (it.hasNext())
                        w.write(",");
                    w.write("\n");
                }

                w.write("""
                            );
                        }
                        """);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}