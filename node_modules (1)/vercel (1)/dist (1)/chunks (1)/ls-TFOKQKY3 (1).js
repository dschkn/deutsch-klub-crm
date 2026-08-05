import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  repositoryImagesPath
} from "./chunk-4QVAYRYH.js";
import {
  formatBytes,
  formatDigest,
  formatImageStatus,
  formatRelativeTime
} from "./chunk-CMJMYVQM.js";
import {
  emitVcrArgParseError,
  handleVcrApiError,
  requireVcrRepository,
  resolveVcrScope,
  validateVcrJsonOutput
} from "./chunk-MGUQN3V3.js";
import {
  outputError,
  validateOptionalIntegerRange
} from "./chunk-BUZRVER7.js";
import "./chunk-XPKWKPWA.js";
import {
  imageLsSubcommand
} from "./chunk-RLJA2KI7.js";
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

// src/commands/vcr/image/ls.ts
var import_chalk = __toESM(require_source(), 1);
function formatType(kind) {
  return kind === "index" ? "Index" : "Image";
}
function printImages(list) {
  if (list.images.length === 0) {
    output_manager_default.log("No images found.");
    return;
  }
  const headers = [
    "Image ID",
    "Digest",
    "Tags",
    "Type",
    "Status",
    "Arch",
    "Size",
    "Created"
  ].map((h) => import_chalk.default.cyan(h));
  const rows = [
    headers,
    ...list.images.map((image) => [
      import_chalk.default.bold(image.id),
      import_chalk.default.dim(formatDigest(image.manifestDigest)),
      image.tags.length > 0 ? image.tags.join(", ") : import_chalk.default.dim("<none>"),
      formatType(image.kind),
      formatImageStatus(image.status),
      image.arch ?? "-",
      formatBytes(image.sizeInBytes),
      formatRelativeTime(image.createdAt)
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
      getFlagsSpecification(imageLsSubcommand.options)
    );
  } catch (err) {
    emitVcrArgParseError(
      client,
      err,
      "vcr image ls <repository> --project <name-or-id>"
    );
    printError(err);
    return 1;
  }
  const fr = validateVcrJsonOutput(client, parsedArgs.flags);
  if (typeof fr === "number") {
    return fr;
  }
  const repository = parsedArgs.args[0];
  const project = parsedArgs.flags["--project"];
  const cursor = parsedArgs.flags["--cursor"];
  const limitFlag = parsedArgs.flags["--limit"];
  const untagged = parsedArgs.flags["--untagged"];
  telemetry.trackCliOptionProject(project);
  telemetry.trackCliOptionLimit(limitFlag);
  telemetry.trackCliOptionCursor(cursor);
  telemetry.trackCliFlagUntagged(untagged);
  telemetry.trackCliOptionFormat(parsedArgs.flags["--format"]);
  const missingRepository = requireVcrRepository(
    client,
    repository,
    fr.jsonOutput,
    "vcr image ls <repository>"
  );
  if (typeof missingRepository === "number") {
    return missingRepository;
  }
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
  const path = repositoryImagesPath(scope, repository, {
    limit: limitResult.value,
    cursor,
    untagged
  });
  output_manager_default.spinner("Fetching images...");
  try {
    const list = await client.fetch(path);
    if (fr.jsonOutput) {
      client.stdout.write(`${JSON.stringify(list, null, 2)}
`);
    } else {
      printImages(list);
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
