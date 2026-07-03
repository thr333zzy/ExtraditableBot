import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder().setName('shuffle').setDescription('Mezcla el orden de la cola'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    if (player.queue.tracks.length < 2) {
      await interaction.reply({ content: 'No hay suficientes canciones en la cola para mezclar.' });
      return;
    }

    await player.queue.shuffle();
    await interaction.reply('🔀 Cola mezclada.');
  },
};

export default command;
