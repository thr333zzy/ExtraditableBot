import { MessageFlags, type ChatInputCommandInteraction, type VoiceBasedChannel } from 'discord.js';
import type { Player } from 'lavalink-client';
import type { BotClient } from '../structures/BotClient';

export async function requireVoiceChannel(
  interaction: ChatInputCommandInteraction,
): Promise<VoiceBasedChannel | null> {
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  const channel = member?.voice.channel;

  if (!channel) {
    await interaction.reply({
      content: 'Debes estar en un canal de voz para usar este comando.',
      flags: MessageFlags.Ephemeral,
    });
    return null;
  }

  return channel;
}

export async function requireActivePlayer(
  interaction: ChatInputCommandInteraction,
  client: BotClient,
): Promise<Player | null> {
  const player = interaction.guildId ? client.lavalink.getPlayer(interaction.guildId) : undefined;

  if (!player) {
    await interaction.reply({
      content: 'No hay ninguna reproducción activa en este servidor.',
      flags: MessageFlags.Ephemeral,
    });
    return null;
  }

  return player;
}

export async function requireSameVoiceChannel(
  interaction: ChatInputCommandInteraction,
  player: Player,
): Promise<boolean> {
  const member = await interaction.guild?.members.fetch(interaction.user.id);
  const channelId = member?.voice.channelId;

  if (!channelId || channelId !== player.voiceChannelId) {
    await interaction.reply({
      content: 'Debes estar en el mismo canal de voz que el bot para usar este comando.',
      flags: MessageFlags.Ephemeral,
    });
    return false;
  }

  return true;
}
