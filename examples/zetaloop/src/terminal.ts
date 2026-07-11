import sliceAnsi from "slice-ansi";
import stringWidth from "string-width";
import wrapAnsi from "wrap-ansi";
import type { ZetaloopPlot, TranscriptEntry } from "./state.ts";
import { truncate } from "./text.ts";

export type PaneState = {
  plot: ZetaloopPlot;
  roomId?: string;
  entries: TranscriptEntry[];
  streaming?: string;
};

export class SideBySideRenderer {
  private readonly tty = process.stdout.isTTY;
  private readonly plain = !process.stdout.isTTY || Bun.env.NO_TTY === "1";
  private frame = 0;

  render(left: PaneState, right: PaneState): void {
    if (this.plain) {
      this.renderPlain(left, right);
      return;
    }

    const width = Math.max(80, process.stdout.columns || 120);
    const height = Math.max(24, process.stdout.rows || 36);
    const paneWidth = Math.floor((width - 3) / 2);
    const bodyHeight = height - 4;
    const leftLines = this.paneLines(left, paneWidth, bodyHeight);
    const rightLines = this.paneLines(right, paneWidth, bodyHeight);
    const divider = " | ";
    const output: string[] = [];

    output.push(`${boxTitle("A", left.plot, paneWidth)}${divider}${boxTitle("B", right.plot, paneWidth)}`);
    output.push(`${"-".repeat(paneWidth)}${divider}${"-".repeat(paneWidth)}`);
    for (let index = 0; index < bodyHeight; index += 1) {
      output.push(`${padRight(leftLines[index] ?? "", paneWidth)}${divider}${padRight(rightLines[index] ?? "", paneWidth)}`);
    }

    if (this.frame === 0) {
      process.stdout.write("\x1b[?25l");
    }
    process.stdout.write("\x1b[H\x1b[2J");
    process.stdout.write(output.join("\n"));
    this.frame += 1;
  }

  close(): void {
    if (this.tty && this.frame > 0) {
      process.stdout.write("\x1b[?25h\n");
    }
  }

  private renderPlain(left: PaneState, right: PaneState): void {
    const leftLast = left.streaming || left.entries.at(-1)?.text;
    const rightLast = right.streaming || right.entries.at(-1)?.text;
    console.log(`[A:${left.plot.name}] ${truncate(leftLast ?? "", 240)}`);
    console.log(`[B:${right.plot.name}] ${truncate(rightLast ?? "", 240)}`);
  }

  private paneLines(pane: PaneState, width: number, maxLines: number): string[] {
    const lines: string[] = [];
    lines.push(`character: ${pane.plot.characterName}`);
    if (pane.roomId) {
      lines.push(`room: ${pane.roomId}`);
    }
    lines.push("");

    for (const entry of pane.entries) {
      const label = entry.direction === "input" ? "< input" : "> output";
      lines.push(...wrap(`${label}: ${entry.text}`, width));
      lines.push("");
    }

    if (pane.streaming) {
      lines.push(...wrap(`> streaming: ${pane.streaming}`, width));
      lines.push("");
    }

    return lines.slice(Math.max(0, lines.length - maxLines));
  }
}

function boxTitle(label: string, plot: ZetaloopPlot, width: number): string {
  return padRight(`${label}: ${truncateToWidth(plot.name, Math.max(8, width - 4))}`, width);
}

function wrap(text: string, width: number): string[] {
  const clean = text.replaceAll(/\s+/g, " ").trim();
  if (!clean) {
    return [""];
  }

  return wrapAnsi(clean, width, {
    hard: true,
    trim: false,
    wordWrap: true,
  }).split("\n");
}

function padRight(value: string, width: number): string {
  const text = truncateToWidth(value, width);
  return text + " ".repeat(Math.max(0, width - stringWidth(text)));
}

function truncateToWidth(value: string, width: number): string {
  if (stringWidth(value) <= width) {
    return value;
  }
  return sliceAnsi(value, 0, width);
}
