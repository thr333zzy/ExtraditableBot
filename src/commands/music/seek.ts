import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';
import { formatDuration } from '../../utils/formatDuration';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('seek')
    .setDescription('Salta a un punto específico de la canción actual')
    .addIntegerOption((option) =>
      option
        .setName('segundos')
        .setDescription('Segundos a los que quieres saltar')
        .setMinValue(0)
        .setRequired(true),
    ) as SlashCommandBuilder,

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const current = player.queue.current;
    if (!current) {
      await interaction.reply({ content: 'No hay ninguna canción sonando ahora mismo.' });
      return;
    }

    if (!current.info.isSeekable) {
      await interaction.reply({ content: 'Esta canción no permite saltar a un punto específico (ej. streams en vivo).' });
      return;
    }

    const seconds = interaction.options.getInteger('segundos', true);
    const ms = seconds * 1000;

    if (ms > current.info.duration) {
      await interaction.reply({ content: `La canción dura ${formatDuration(current.info.duration)}, no puedes saltar más allá de eso.` });
      return;
    }

    await player.seek(ms);
    await interaction.reply(`⏩ Saltado a **${formatDuration(ms)}**.`);
  },
};

export default command;
