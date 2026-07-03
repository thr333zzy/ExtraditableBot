import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireVoiceChannel } from '../../utils/musicChecks';
import { formatDuration } from '../../utils/formatDuration';

const AUTOCOMPLETE_RESULT_LIMIT = 10;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Reproduce una canción desde YouTube, Spotify o Apple Music')
    .addStringOption((option) =>
      option
        .setName('busqueda')
        .setDescription('Nombre de la canción o un link de YouTube/Spotify/Apple Music')
        .setRequired(true)
        .setAutocomplete(true),
    ) as SlashCommandBuilder,

  async autocomplete(interaction, client) {
    const focused = interaction.options.getFocused();

    if (focused.length < 2 || /^https?:\/\//i.test(focused) || !client.lavalink.useable) {
      await interaction.respond([]).catch(() => undefined);
      return;
    }

    const node = client.lavalink.nodeManager.leastUsedNodes()[0];
    if (!node) {
      await interaction.respond([]).catch(() => undefined);
      return;
    }

    const result = await node
      .search({ query: focused, source: 'ytsearch' }, interaction.user)
      .catch(() => undefined);

    if (!result || result.loadType === 'error' || result.tracks.length === 0) {
      await interaction.respond([]).catch(() => undefined);
      return;
    }

    const choices = result.tracks.slice(0, AUTOCOMPLETE_RESULT_LIMIT).map((track) => ({
      name: truncate(
        `${track.info.title} - ${track.info.author} (${formatDuration(track.info.duration)})`,
        100,
      ),
      value: truncate(track.info.uri, 100),
    }));

    await interaction.respond(choices).catch(() => undefined);
  },

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
