import { MessageFlags, type Interaction, type InteractionReplyOptions } from 'discord.js';
import type { BotClient } from '../../structures/BotClient';
import { handleButton } from '../../handlers/buttonHandler';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, client: BotClient) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(`[interactionCreate] Error ejecutando /${interaction.commandName}:`, error);
        const payload: InteractionReplyOptions = {
          content: 'Hubo un error al ejecutar este comando.',
          flags: MessageFlags.Ephemeral,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => undefined);
        } else {
          await interaction.reply(payload).catch(() => undefined);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      try {
        await handleButton(interaction, client);
      } catch (error) {
        console.error('[interactionCreate] Error manejando botón:', error);
        const payload: InteractionReplyOptions = {
          content: 'Hubo un error al procesar esta acción.',
          flags: MessageFlags.Ephemeral,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => undefined);
        } else {
          await interaction.reply(payload).catch(() => undefined);
        }
      }
    }
  },
};
