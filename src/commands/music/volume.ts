import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Ajusta el volumen de reproducción')
    .addIntegerOption((option) =>
      option
        .setName('nivel')
        .setDescription('Nivel de volumen entre 0 y 100')
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true),
    ) as SlashCommandBuilder,

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const level = interaction.options.getInteger('nivel', true);
    await player.setVolume(level);

    await interaction.reply(`🔊 Volumen ajustado a **${level}%**.`);
  },
};

export default command;
