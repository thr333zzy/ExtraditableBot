import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../structures/Command';

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Comprueba la latencia del bot'),

  async execute(interaction, client) {
    await interaction.reply(`🏓 Pong! Latencia: **${Math.round(client.ws.ping)}ms**`);
  },
};

export default command;
