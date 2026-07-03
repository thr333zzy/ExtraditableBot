import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireActivePlayer, requireSameVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Elimina una canción de la cola por su posición')
    .addIntegerOption((option) =>
      option
        .setName('posicion')
        .setDescription('Posición en la cola (empieza en 1)')
        .setMinValue(1)
        .setRequired(true),
    ) as SlashCommandBuilder,

  async execute(interaction, client) {
    const player = await requireActivePlayer(interaction, client);
    if (!player) return;
    if (!(await requireSameVoiceChannel(interaction, player))) return;

    const position = interaction.options.getInteger('posicion', true);
    const index = position - 1;

    if (index < 0 || index >= player.queue.tracks.length) {
      await interaction.reply({ content: `Posición inválida. La cola tiene ${player.queue.tracks.length} canciones.` });
      return;
    }

    const track = player.queue.tracks[index];
    await player.queue.remove(index);

    await interaction.reply(`🗑️ Eliminado: **${track.info.title}**`);
  },
};

export default command;
