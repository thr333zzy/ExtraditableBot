import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder().setName('pause').setDescription('Pausa la reproducción actual'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    if (player.paused) {
      await interaction.reply({ content: 'La reproducción ya está pausada.' });
      return;
    }

    await player.pause();
    await interaction.reply('⏸️ Pausado.');
  },
};

export default command;
