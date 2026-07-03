import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer } from '../../utils/musicChecks';
import { queueEmbed } from '../../structures/musicEmbeds';
import { queueRow } from '../../structures/musicButtons';

const command: Command = {
  data: new SlashCommandBuilder().setName('queue').setDescription('Muestra la cola de canciones'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;

    const totalPages = Math.max(1, Math.ceil(player.queue.tracks.length / 10));

    await interaction.reply({
      embeds: [queueEmbed(player, 0)],
      components: [queueRow(interaction.guildId!, 0, totalPages)],
    });
  },
};

export default command;
