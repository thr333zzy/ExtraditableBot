import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Vacía la cola de canciones sin desconectar el bot'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const count = player.queue.tracks.length;
    await player.queue.splice(0, count);

    await interaction.reply(`🧹 Se eliminaron **${count}** canciones de la cola.`);
  },
};

export default command;
