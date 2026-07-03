import type { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import type { BotClient } from './BotClient';

export interface Command {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction, client: BotClient) => Promise<void>;
}
