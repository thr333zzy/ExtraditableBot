import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireVoiceChannel } from '../../utils/musicChecks';
import { formatDuration } from '../../utils/formatDuration';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción desde YouTube, Spotify o Apple Music')
    .addStringOption((option) =>
      option
        .setName('busqueda')
        .setDescription('Nombre de la canción o un link de YouTube/Spotify/Apple Music')
        .setRequired(true),
    ) as SlashCommandBuilder,

  async execute(interaction, client) {
    const channel = await requireVoiceChannel(interaction);
    if (!channel) return;

    await interaction.deferReply();

    let player = client.lavalink.getPlayer(interaction.guildId!);
    if (!player) {
      player = client.lavalink.createPlayer({
        guildId: interaction.guildId!,
        voiceChannelId: channel.id,
        textChannelId: interaction.channelId,
        selfDeaf: true,
      });
    }

    if (!player.connected) {
      await player.connect();
    }

    const query = interaction.options.getString('busqueda', true);
    const result = await player.search({ query }, interaction.user);

    if (result.loadType === 'error') {
      await interaction.editReply(`Error al buscar: ${result.exception?.message ?? 'desconocido'}`);
      return;
    }

    if (result.loadType === 'empty' || result.tracks.length === 0) {
      await interaction.editReply('No se encontraron resultados para tu búsqueda.');
      return;
    }

    if (result.loadType === 'playlist' && result.playlist) {
      await player.queue.add(result.tracks);
      await interaction.editReply(
        `🎶 Se agregaron **${result.tracks.length}** canciones de la playlist **${result.playlist.name}**.`,
      );
    } else {
      const track = result.tracks[0];
      await player.queue.add(track);
      await interaction.editReply(
        `🎶 Agregado a la cola: **${track.info.title}** (${formatDuration(track.info.duration)})`,
      );
    }

    if (!player.playing && !player.paused) {
      await player.play();
    }
  },
};

export default command;
