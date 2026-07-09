class Cursor {
  private pos = 0;

  constructor(private readonly buf: Uint8Array) {}

  get offset() {
    return this.pos;
  }

  readByte(): number {
    if (this.pos >= this.buf.length) throw new Error("out of range");
    return this.buf[this.pos++];
  }

  readBytes(n: number): Uint8Array {
    if (this.pos + n > this.buf.length) throw new Error("out of range");
    const out = this.buf.subarray(this.pos, this.pos + n);
    this.pos += n;
    return out;
  }

  readVarint32(): number {
    let result = 0;
    let shift = 0;

    while (shift < 35) {
      const b = this.readByte();
      result |= (b & 0x7f) << shift;

      if ((b & 0x80) === 0) return result >>> 0;

      shift += 7;
    }

    throw new Error("bad varint");
  }

  readLengthPrefixedBytes(): Uint8Array {
    const len = this.readVarint32();
    return this.readBytes(len);
  }
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf-8", { fatal: false });

function encodeVarint32(n: number): Uint8Array {
  const out: number[] = [];

  while (n > 0x7f) {
    out.push((n & 0x7f) | 0x80);
    n >>>= 7;
  }

  out.push(n);
  return new Uint8Array(out);
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function indexOfBytes(
  haystack: Uint8Array,
  needle: Uint8Array,
  from = 0,
): number {
  outer: for (let i = from; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return i;
  }

  return -1;
}

function decodeMmkvString(valueBytes: Uint8Array): string | null {
  // MMKV deletion marker
  if (valueBytes.length === 0) return null;

  try {
    const c = new Cursor(valueBytes);

    // MMKV string value:
    //   [string byte length varint][utf8 bytes]
    const stringBytes = c.readLengthPrefixedBytes();

    return textDecoder.decode(stringBytes);
  } catch {
    return null;
  }
}

function extractStringValueByKey(
  mmkvBytes: Uint8Array,
  key: string,
): string | null {
  const keyBytes = textEncoder.encode(key);

  // MMKV map entry key:
  //   [key byte length varint][key utf8 bytes]
  const keyPattern = concat(encodeVarint32(keyBytes.length), keyBytes);

  let from = 4; // skip old-style actualSize holder
  let latest: string | null = null;

  while (true) {
    const hit = indexOfBytes(mmkvBytes, keyPattern, from);
    if (hit === -1) break;

    try {
      const afterKey = hit + keyPattern.length;
      const c = new Cursor(mmkvBytes.subarray(afterKey));

      // MMKV map entry value:
      //   [value byte length varint][value bytes]
      const valueBytes = c.readLengthPrefixedBytes();

      latest = decodeMmkvString(valueBytes);
    } catch {
      // false positive; ignore
    }

    from = hit + 1;
  }

  return latest;
}

const mmkvBytes = await Bun.file("./mmkv.default").bytes();

const authObject = Object.fromEntries(
  ["TOKEN", "REFRESH_TOKEN", "DEVICE_ID"].map((key) => [
    key.toLowerCase(),
    extractStringValueByKey(mmkvBytes, key),
  ]),
)
const res = await fetch('https://zeta-line.kozika.workers.dev/admin/zeta-cred', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-admin-secret': Bun.env.ZETA_INIT_SECRET
  },
  body: new File([JSON.stringify(authObject)], 'zeta-cred.json')
});

console.log("Sent credentials:", authObject, await res.text());

export {};
