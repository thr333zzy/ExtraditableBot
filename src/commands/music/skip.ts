import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder().setName('skip').setDescription('Salta a la siguiente canción'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const skipped = player.queue.current;
    await player.skip();
    await interaction.reply(`⏭️ Saltada: **${skipped?.info.title ?? 'canción actual'}**`);
  },
};

export default command;
