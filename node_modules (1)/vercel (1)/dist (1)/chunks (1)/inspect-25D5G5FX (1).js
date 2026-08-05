import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  repositoryPath,
  repositoryTagPath
} from "./chunk-4QVAYRYH.js";
import {
  formatBytes,
  formatImageStatus,
  formatRelativeTime,
  formatTagReference
} from "./chunk-CMJMYVQM.js";
import {
  emitVcrArgParseError,
  handleVcrApiError,
  requireVcrRepositoryAndTag,
  resolveVcrScope,
  validateVcrJsonOutput
} from "./chunk-MGUQN3V3.js";
import "./chunk-BUZRVER7.js";
import "./chunk-XPKWKPWA.js";
import {
  tagsInspectSubcommand
} from "./chunk-7C7MMT4J.js";
import "./chunk-QH7WYDEP.js";
import "./chunk-OCEM4YAQ.js";
import "./chunk-XHC5YRFY.js";
import "./chunk-2QBF3ZL3.js";
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

// src/commands/vcr/tags/inspect.ts
var import_chalk = __toESM(require_source(), 1);
function printTag(tag, scope, repository) {
  output_manager_default.print("\n");
  output_manager_default.print(`  ${import_chalk.default.cyan("ID")}			${tag.imageId}
`);
  output_manager_default.print(`  ${import_chalk.default.cyan("Digest")}		${tag.manifestDigest}
`);
  output_manager_default.print(
    `  ${import_chalk.default.cyan("Image")}			${formatTagReference(
      scope.teamSlug,
      scope.projectName,
      repository.name,
      tag.tag
    )}
`
  );
  output_manager_default.print(`  ${import_chalk.default.cyan("Type")}			${tag.kind}
`);
  output_manager_default.print(`  ${import_chalk.default.cyan("Arch")}			${tag.arch ?? "-"}
`);
  output_manager_default.print(`  ${import_chalk.default.cyan("Platform")}		${tag.platform ?? "-"}
`);
  output_manager_default.print(
    `  ${import_chalk.default.cyan("Size")}			${formatBytes(tag.sizeInBytes)}
`
  );
  output_manager_default.print(
    `  ${import_chalk.default.cyan("Status")}		${formatImageStatus(tag.status)}
`
  );
  output_manager_default.print(
    `  ${import_chalk.default.cyan("Created")}		${formatRelativeTime(tag.createdAt)}
`
  );
  output_manager_default.print("\n");
}
async function inspect(client, argv, telemetry) {
  let parsedArgs;
  try {
    parsedArgs = parseArguments(
      argv,
      getFlagsSpecification(tagsInspectSubcommand.options)
    );
  } catch (err) {
    emitVcrArgParseError(
      client,
      err,
      "vcr tag inspect <repository> <tag> --project <name-or-id>"
    );
    printError(err);
    return 1;
  }
  const fr = validateVcrJsonOutput(client, parsedArgs.flags);
  if (typeof fr === "number") {
    return fr;
  }
  const repository = parsedArgs.args[0];
  const tag = parsedArgs.args[1];
  const project = parsedArgs.flags["--project"];
  telemetry.trackCliOptionProject(project);
  telemetry.trackCliOptionFormat(parsedArgs.flags["--format"]);
  const missingArgs = requireVcrRepositoryAndTag(
    client,
    repository,
    tag,
    fr.jsonOutput,
    "vcr tag inspect <repository> <tag>"
  );
  if (typeof missingArgs === "number") {
    return missingArgs;
  }
  const scope = await resolveVcrScope(client, {
    project,
    jsonOutput: fr.jsonOutput
  });
  if (typeof scope === "number") {
    return scope;
  }
  const path = repositoryTagPath(scope, repository, tag);
  output_manager_default.spinner("Fetching tag...");
  try {
    if (fr.jsonOutput) {
      const result = await client.fetch(path);
      client.stdout.write(`${JSON.stringify(result.tag, null, 2)}
`);
    } else {
      const [tagResult, repositoryResult] = await Promise.all([
        client.fetch(path),
        client.fetch(
          repositoryPath(scope, repository)
        )
      ]);
      output_manager_default.log(`${import_chalk.default.bold("Tag")} ${import_chalk.default.cyan(tag)}`);
      printTag(tagResult.tag, scope, repositoryResult.repository);
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
  inspect as default
};
