import { describe, test } from "node:test";
import { registerRuntimeTests } from "./runtime-test-suite.ts";

registerRuntimeTests({ describe, test });
