import { describe, test } from "bun:test";
import { registerRuntimeTests } from "./runtime-test-suite.ts";

registerRuntimeTests({ describe, test });
