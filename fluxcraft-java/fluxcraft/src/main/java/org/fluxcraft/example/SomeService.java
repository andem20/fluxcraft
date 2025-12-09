package org.fluxcraft.example;

import java.util.List;

public class SomeService {

    public void createEntities(List<CreateStuffCommand> createCommands) {
        for (CreateStuffCommand command : createCommands) {
            if (isValid(command)) {
                System.out.println("Valid command: " + command);
            }
        }

        System.out.println("saved to database");
    }

    private boolean isValid(CreateStuffCommand command) {
        return command.id > 0 && command.product > 0 && command.station > 0 && command.volume > 0;
    }
}
