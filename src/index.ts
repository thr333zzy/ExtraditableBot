import { env } from './config/env';
import { BotClient } from './structures/BotClient';
import { loadCommands } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';

// Evita que un error async suelto (ej. Lavalink desconectado en medio de una
// operación) tumbe todo el proceso del bot. Solo se loguea.
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});
process.on('uncaughtException', (error) => {
  console.error('[uncaughtException]', error);
});

async function main() {
  const client = new BotClient();

  await loadCommands(client);
  await loadEvents(client);

  await client.login(env.DISCORD_TOKEN);
}

main().catch((error) => {
  console.error('Error fatal al iniciar el bot:', error);
  process.exit(1);
});
