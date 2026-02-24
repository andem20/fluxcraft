package org.fluxcraft;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.fluxcraft.lib.core.FluxCraft;
import org.fluxcraft.lib.dev.FluxcraftDevTools;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

class DevToolsTest {

    @Test
    void servicerTest() throws InterruptedException, IOException, URISyntaxException {
        FluxCraft fluxcraft = new FluxCraft();
        FluxcraftDevTools.init();
        Thread.sleep(Duration.ofSeconds(1));

        HttpClient client = HttpClient.newHttpClient();

        HttpResponse<String> response = client.send(
                HttpRequest.newBuilder(new URI("http://127.0.0.1:9999")).GET().build(),
                HttpResponse.BodyHandlers.ofString());

        Assertions.assertEquals(200, response.statusCode());
    }
}
