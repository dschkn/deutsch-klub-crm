import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  repositoriesPath
} from "./chunk-4QVAYRYH.js";
import {
  formatRelativeTime
} from "./chunk-CMJMYVQM.js";
import {
  emitVcrArgParseError,
  handleVcrApiError,
  resolveVcrScope,
  validateVcrJsonOutput
} from "./chunk-MGUQN3V3.js";
import {
  outputError,
  validateOptionalIntegerRange
} from "./chunk-BUZRVER7.js";
import "./chunk-XPKWKPWA.js";
import {
  listSubcommand
} from "./chunk-5OT26JZN.js";
import "./chunk-7C7MMT4J.js";
import "./chunk-RLJA2KI7.js";
import {
  AGENT_REASON
} from "./chunk-QH7WYDEP.js";
import "./chunk-OCEM4YAQ.js";
import {
  table
} from "./chunk-QEEGXNFK.js";
import "./chunk-XHC5YRFY.js";
import {
  outputAgentError
} from "./chunk-2QBF3ZL3.js";
import "./chunk-ECCWJHC6.js";
import {
  getFlagsSpecification,
  parseArguments,
  printError
} from "./chunk-EHTPDXTS.js";
import {
  isAPIError
} from "./chunk-P6AK7SVK.js";
import "./chunk-P4QNYOFB.js";
import "./chunk-2RVK3DDN.js";
import {
  output_manager_default
} from "./chunk-OX7KI3LF.js";
import "./chunk-GGP5R3FU.js";
import {
  require_source
} from "./chunk-S7KYDPEM.js";
import {
  __toESM
} from "./chunk-TZ2YI2VH.js";

// src/commands/vcr/ls.ts
var import_chalk = __toESM(require_source(), 1);
function printRepositories(list) {
  if (list.repositories.length === 0) {
    output_manager_default.log("No repositories found.");
    return;
  }
  const headers = ["Name", "ID", "Created"].map((h) => import_chalk.default.cyan(h));
  const rows = [
    headers,
    ...list.repositories.map((repo) => [
      import_chalk.default.bold(repo.name),
      import_chalk.default.dim(repo.id),
      formatRelativeTime(repo.createdAt)
    ])
  ];
  const tableOutput = table(rows, { hsep: 3 }).split("\n").map((line) => line.trimEnd()).join("\n").replace(/^/gm, "  ");
  output_manager_default.print(`
${tableOutput}
`);
  if (list.nextCursor) {
    output_manager_default.log(
      `More results available. Re-run with \`--cursor ${list.nextCursor}\`.`
    );
  }
}
async function ls(client, argv, telemetry) {
  let parsedArgs;
  try {
    parsedArgs = parseArguments(
      argv,
      getFlagsSpecification(listSubcommand.options)
    );
  } catch (err) {
    emitVcrArgParseError(client, err, "vcr ls --project <name-or-id>");
    printError(err);
    return 1;
  }
  const fr = validateVcrJsonOutput(client, parsedArgs.flags);
  if (typeof fr === "number") {
    return fr;
  }
  const project = parsedArgs.flags["--project"];
  const cursor = parsedArgs.flags["--cursor"];
  const limitFlag = parsedArgs.flags["--limit"];
  telemetry.trackCliOptionProject(project);
  telemetry.trackCliOptionLimit(limitFlag);
  telemetry.trackCliOptionCursor(cursor);
  telemetry.trackCliOptionFormat(parsedArgs.flags["--format"]);
  const limitResult = validateOptionalIntegerRange(limitFlag, {
    flag: "--limit",
    min: 1,
    max: 100
  });
  if (!limitResult.valid) {
    outputAgentError(
      client,
      {
        status: "error",
        reason: AGENT_REASON.INVALID_ARGUMENTS,
        message: limitResult.message
      },
      1
    );
    return outputError(
      client,
      fr.jsonOutput,
      limitResult.code,
      limitResult.message
    );
  }
  const scope = await resolveVcrScope(client, {
    project,
    jsonOutput: fr.jsonOutput
  });
  if (typeof scope === "number") {
    return scope;
  }
  const path = repositoriesPath(scope, {
    limit: limitResult.value,
    cursor
  });
  output_manager_default.spinner("Fetching repositories...");
  try {
    const list = await client.fetch(path);
    if (fr.jsonOutput) {
      client.stdout.write(`${JSON.stringify(list, null, 2)}
`);
    } else {
      printRepositories(list);
    }
    return 0;
  } catch (err) {
    if (isAPIError(err)) {
      return handleVcrApiError(client, err, fr.jsonOutput);
    }
    throw err;
  } finally {
    output_manager_default.stopSpinner();
  }
}
export {
  ls as default
};
