import { MessageFlags, type ButtonInteraction, type GuildMember } from 'discord.js';
import type { BotClient } from '../structures/BotClient';
import { nowPlayingEmbed, queueEmbed } from '../structures/musicEmbeds';
import { nowPlayingRow, queueRow, BUTTON_PREFIX } from '../structures/musicButtons';

function inSameVoiceChannel(interaction: ButtonInteraction, voiceChannelId?: string | null): boolean {
  const member = interaction.member as GuildMember | null;
  return Boolean(member?.voice.channelId && member.voice.channelId === voiceChannelId);
}

export async function handleButton(interaction: ButtonInteraction, client: BotClient): Promise<void> {
  const [prefix, action, guildId, extra] = interaction.customId.split(':');
  const id = `${prefix}:${action}`;

  if (!guildId || interaction.guildId !== guildId) return;

  const player = client.lavalink.getPlayer(guildId);
  if (!player) {
    await interaction.reply({
      content: 'No hay ninguna reproducción activa en este servidor.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (!inSameVoiceChannel(interaction, player.voiceChannelId)) {
    await interaction.reply({
      content: 'Debes estar en el mismo canal de voz que el bot para usar estos controles.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  switch (id) {
    case BUTTON_PREFIX.PAUSE: {
      if (player.paused) {
        await player.resume();
      } else {
        await player.pause();
      }

      const current = player.queue.current;
      if (current) {
        await interaction.update({
          embeds: [nowPlayingEmbed(player, current)],
          components: [nowPlayingRow(guildId, player.paused)],
        });
      } else {
        await interaction.deferUpdate();
      }
      break;
    }

    case BUTTON_PREFIX.SKIP: {
      await interaction.deferUpdate();
      await player.skip();
      break;
    }

    case BUTTON_PREFIX.STOP: {
      await interaction.deferUpdate();
      await player.destroy();
      break;
    }

    case BUTTON_PREFIX.QUEUE: {
      const page = 0;
      await interaction.reply({
        embeds: [queueEmbed(player, page)],
        components: [queueRow(guildId, page, Math.max(1, Math.ceil(player.queue.tracks.length / 10)))],
        flags: MessageFlags.Ephemeral,
      });
      break;
    }

    case BUTTON_PREFIX.QUEUE_PREV:
    case BUTTON_PREFIX.QUEUE_NEXT: {
      const currentPage = Number(extra ?? '0');
      const nextPage = id === BUTTON_PREFIX.QUEUE_NEXT ? currentPage + 1 : currentPage - 1;
      const totalPages = Math.max(1, Math.ceil(player.queue.tracks.length / 10));

      await interaction.update({
        embeds: [queueEmbed(player, nextPage)],
        components: [queueRow(guildId, Math.min(Math.max(nextPage, 0), totalPages - 1), totalPages)],
      });
      break;
    }

    default:
      break;
  }
}
