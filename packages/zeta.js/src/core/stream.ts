export type StreamEvent<T = unknown> = {
  data: T;
  event?: string;
  id?: string;
  retry?: number;
  raw: string;
};

export async function* readEventStream<T = unknown>(response: Response): AsyncGenerator<StreamEvent<T>> {
  if (!response.body) {
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      yield* drainEvents<T>(buffer, (rest) => {
        buffer = rest;
      });
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      yield parseEvent<T>(buffer);
    }
  } finally {
    reader.releaseLock();
  }
}

function* drainEvents<T>(buffer: string, setBuffer: (rest: string) => void): Generator<StreamEvent<T>> {
  let cursor = 0;

  while (true) {
    const next = findBoundary(buffer, cursor);
    if (!next) {
      setBuffer(buffer.slice(cursor));
      return;
    }

    const raw = buffer.slice(cursor, next.index);
    cursor = next.after;
    if (raw.trim()) {
      yield parseEvent<T>(raw);
    }
  }
}

function findBoundary(buffer: string, start: number): { index: number; after: number } | undefined {
  const lf = buffer.indexOf("\n\n", start);
  const crlf = buffer.indexOf("\r\n\r\n", start);

  if (lf < 0 && crlf < 0) {
    return undefined;
  }

  if (crlf >= 0 && (lf < 0 || crlf < lf)) {
    return { index: crlf, after: crlf + 4 };
  }

  return { index: lf, after: lf + 2 };
}

function parseEvent<T>(raw: string): StreamEvent<T> {
  const dataLines: string[] = [];
  let event: string | undefined;
  let id: string | undefined;
  let retry: number | undefined;

  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith(":")) {
      continue;
    }

    const index = line.indexOf(":");
    const field = index >= 0 ? line.slice(0, index) : line;
    const value = index >= 0 ? line.slice(index + 1).replace(/^ /, "") : "";

    if (field === "data") {
      dataLines.push(value);
    } else if (field === "event") {
      event = value;
    } else if (field === "id") {
      id = value;
    } else if (field === "retry") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        retry = parsed;
      }
    }
  }

  const text = dataLines.join("\n");
  return {
    data: parseData<T>(text),
    event,
    id,
    retry,
    raw,
  };
}

function parseData<T>(text: string): T {
  if (!text) {
    return "" as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
