import { MessageFlags, type Interaction, type InteractionReplyOptions } from 'discord.js';
import type { BotClient } from '../../structures/BotClient';
import { handleButton, handleSelectMenu } from '../../handlers/buttonHandler';

export default {
  name: 'interactionCreate',
  once: false,
  async execute(interaction: Interaction, client: BotClient) {
    if (interaction.isAutocomplete()) {
      const command = client.commands.get(interaction.commandName);
      if (!command?.autocomplete) return;

      try {
        await command.autocomplete(interaction, client);
      } catch (error) {
        console.error(`[interactionCreate] Error en autocomplete de /${interaction.commandName}:`, error);
        await interaction.respond([]).catch(() => undefined);
      }
      return;
    }

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
      return;
    }

    if (interaction.isStringSelectMenu()) {
      try {
        await handleSelectMenu(interaction, client);
      } catch (error) {
        console.error('[interactionCreate] Error manejando menú:', error);
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
