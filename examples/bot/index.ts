import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  type ApplicationCommand,
  type Interaction,
} from "discord.js";
import { ApiError } from "zeta.js";
import { handleKeywordAutocomplete } from "./src/autocomplete.ts";
import { zetaCommand } from "./src/commands.ts";
import { PlotLinkingService } from "./src/plotLinking.ts";
import { BindingStore } from "./src/state.ts";
import { TalkMessageService } from "./src/talkMessages.ts";
import { createConfiguredZetaClient } from "./src/zeta.ts";

const discordToken = Bun.env.DISCORD_TOKEN;
if (!discordToken) {
  throw new Error("DISCORD_TOKEN is required.");
}

const zeta = await createConfiguredZetaClient();
const store = new BindingStore();
await store.load();

let zetaCommandId: string | undefined;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const getZetaCommandId = () => zetaCommandId;
const talkMessages = new TalkMessageService(client, zeta, store, getZetaCommandId);
const plotLinking = new PlotLinkingService(zeta, store, talkMessages, getZetaCommandId);

client.once(Events.ClientReady, async (readyClient) => {
  const commands = await readyClient.application.commands.set([zetaCommand.toJSON()]);
  zetaCommandId = commands.find((command: ApplicationCommand) => command.name === "zeta")?.id;
  console.log(`Logged in as ${readyClient.user.tag}. Registered global /zeta command.`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isAutocomplete()) {
      await handleKeywordAutocomplete(interaction, zeta);
      return;
    }

    if (interaction.isChatInputCommand()) {
      await plotLinking.handleCommand(interaction);
      return;
    }

    if (interaction.isButton()) {
      await plotLinking.handlePlotButton(interaction);
    }
  } catch (error) {
    await respondToInteractionError(interaction, error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot || !client.user) {
    return;
  }

  await talkMessages.handleMessageTrigger(message).catch(async (error) => {
    console.error("message handling failed", describeError(error));
    await message.reply("メッセージをZetaに送信できませんでした.").catch(() => undefined);
  });
});

await client.login(discordToken);

async function respondToInteractionError(interaction: Interaction, error: unknown): Promise<void> {
  console.error("interaction failed", describeError(error));
  const content = "コマンドの実行に失敗しました.";

  if (!interaction.isRepliable()) {
    return;
  }

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp({ content, flags: MessageFlags.Ephemeral }).catch(() => undefined);
  } else {
    await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => undefined);
  }
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof ApiError) {
    return {
      name: error.name,
      status: error.status,
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return { name: error.name, message: error.message };
  }

  return { message: String(error) };
}
