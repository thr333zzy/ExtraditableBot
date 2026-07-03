import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer } from '../../utils/musicChecks';
import { nowPlayingEmbed } from '../../structures/musicEmbeds';
import { nowPlayingRow, playerOptionsRow } from '../../structures/musicButtons';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Muestra la canción que está sonando ahora'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;

    const current = player.queue.current;
    if (!current) {
      await interaction.reply({ content: 'No hay ninguna canción sonando ahora mismo.' });
      return;
    }

    await interaction.reply({
      embeds: [nowPlayingEmbed(player, current, client)],
      components: [nowPlayingRow(interaction.guildId!, player.paused), playerOptionsRow(interaction.guildId!, player)],
    });
  },
};

export default command;
