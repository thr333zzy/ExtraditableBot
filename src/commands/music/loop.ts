import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('loop')
    .setDescription('Configura el modo de repetición')
    .addStringOption((option) =>
      option
        .setName('modo')
        .setDescription('Modo de repetición')
        .setRequired(true)
        .addChoices(
          { name: 'Desactivado', value: 'off' },
          { name: 'Canción actual', value: 'track' },
          { name: 'Cola completa', value: 'queue' },
        ),
    ) as SlashCommandBuilder,

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const mode = interaction.options.getString('modo', true) as 'off' | 'track' | 'queue';
    await player.setRepeatMode(mode);

    const labels = { off: 'desactivado', track: 'canción actual', queue: 'cola completa' };
    await interaction.reply(`🔁 Modo de repetición: **${labels[mode]}**.`);
  },
};

export default command;
