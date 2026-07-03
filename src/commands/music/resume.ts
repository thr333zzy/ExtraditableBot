import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder().setName('resume').setDescription('Reanuda la reproducción pausada'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    if (!player.paused) {
      await interaction.reply({ content: 'La reproducción no está pausada.' });
      return;
    }

    await player.resume();
    await interaction.reply('▶️ Reanudado.');
  },
};

export default command;
