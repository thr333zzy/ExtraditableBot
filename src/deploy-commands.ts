import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { REST, Routes } from 'discord.js';
import { env } from './config/env';
import type { Command } from './structures/Command';

async function main() {
  const commandsPath = join(__dirname, 'commands');
  const categories = readdirSync(commandsPath);
  const body = [];

  for (const category of categories) {
    const categoryPath = join(commandsPath, category);
    const files = readdirSync(categoryPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of files) {
      const filePath = join(categoryPath, file);
      const imported = (await import(pathToFileURL(filePath).href)) as { default?: Command };
      if (!imported.default?.data) continue;
      body.push(imported.default.data.toJSON());
    }
  }

  const rest = new REST().setToken(env.DISCORD_TOKEN);

  if (env.DISCORD_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID), {
      body,
    });
    console.log(
      `[deploy-commands] ${body.length} comandos registrados en el servidor ${env.DISCORD_GUILD_ID} (instantáneo).`,
    );
  } else {
    await rest.put(Routes.applicationCommands(env.DISCORD_CLIENT_ID), { body });
    console.log(
      `[deploy-commands] ${body.length} comandos registrados globalmente (puede tardar hasta 1h en propagarse).`,
    );
  }
}

main().catch((error) => {
  console.error('[deploy-commands] Error registrando comandos:', error);
  process.exit(1);
});
