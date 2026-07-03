import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';
import { requireVoiceChannel } from '../../utils/musicChecks';

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Une el bot a tu canal de voz'),

  async execute(interaction, client) {
    const channel = await requireVoiceChannel(interaction);
    if (!channel) return;

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

    await interaction.reply(`✅ Me uní a **${channel.name}**.`);
  },
};

export default command;
