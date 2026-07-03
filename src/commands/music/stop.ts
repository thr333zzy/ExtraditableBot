import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la reproducción, vacía la cola y desconecta el bot'),

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    await player.destroy();
    await interaction.reply('⏹️ Reproducción detenida y cola vaciada.');
  },
};

export default command;
