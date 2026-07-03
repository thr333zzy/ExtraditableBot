import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { BotClient } from '../structures/BotClient';
import type { Command } from '../structures/Command';

export async function loadCommands(client: BotClient): Promise<void> {
  const commandsPath = join(__dirname, '..', 'commands');
  const categories = readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    const files = readdirSync(categoryPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of files) {
      const filePath = join(categoryPath, file);
      const imported = (await import(filePath)) as { default?: Command };
      const command = imported.default;

      if (!command?.data || !command.execute) {
        console.warn(`[commandHandler] ${filePath} no exporta un Command válido, se omite.`);
        continue;
      }

      client.commands.set(command.data.name, command);
    }
  }

  console.log(`[commandHandler] ${client.commands.size} comandos cargados.`);
}
