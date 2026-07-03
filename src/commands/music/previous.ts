import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';
import { playPrevious } from '../../utils/previousTrack';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('previous')
    .setDescription('Vuelve a reproducir la canción anterior'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const track = await playPrevious(player);
    if (!track) {
      await interaction.reply({ content: 'No hay ninguna canción anterior en el historial.' });
      return;
    }

    await interaction.reply(`⏮️ Reproduciendo de nuevo: **${track.info.title}**`);
  },
};

export default command;
