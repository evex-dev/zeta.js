/// <reference lib="deno.ns" />

import { registerRuntimeTests } from "./runtime-test-suite.ts";

registerRuntimeTests({
  describe: (_name, fn) => fn(),
  test: (name, fn) => Deno.test(name, fn),
});
