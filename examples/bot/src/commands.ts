import { SlashCommandBuilder } from "discord.js";

export const zetaCommand = new SlashCommandBuilder()
  .setName("zeta")
  .setDescription("Zetaの紐づけを設定する")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("plot")
      .setDescription("プロットを検索してチャンネルに紐づける")
      .addStringOption((option) =>
        option
          .setName("keyword")
          .setDescription("キーワード")
          .setRequired(true)
          .setAutocomplete(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("unlink")
      .setDescription("トークをチャンネルから解除する"),
  );
