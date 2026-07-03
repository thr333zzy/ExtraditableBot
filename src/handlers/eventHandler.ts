import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { BotClient } from '../structures/BotClient';

interface EventModule {
  name: string;
  once?: boolean;
  emitter?: 'client' | 'lavalink';
  execute: (...args: unknown[]) => Promise<void> | void;
}

export async function loadEvents(client: BotClient): Promise<void> {
  const eventsPath = join(__dirname, '..', 'events');
  const categories = readdirSync(eventsPath);
  let count = 0;

  for (const category of categories) {
    const categoryPath = join(eventsPath, category);
    const files = readdirSync(categoryPath).filter(
      (file) => file.endsWith('.ts') || file.endsWith('.js'),
    );

    for (const file of files) {
      const filePath = join(categoryPath, file);
      const imported = (await import(filePath)) as { default?: EventModule };
      const event = imported.default;

      if (!event?.name || !event.execute) {
        console.warn(`[eventHandler] ${filePath} no exporta un Event válido, se omite.`);
        continue;
      }

      const target = (event.emitter === 'lavalink' ? client.lavalink : client) as unknown as {
        on: (name: string, listener: (...args: unknown[]) => void) => void;
        once: (name: string, listener: (...args: unknown[]) => void) => void;
      };
      const listener = (...args: unknown[]) => event.execute(...args, client);

      if (event.once) {
        target.once(event.name, listener);
      } else {
        target.on(event.name, listener);
      }

      count++;
    }
  }

  console.log(`[eventHandler] ${count} eventos cargados.`);
}
