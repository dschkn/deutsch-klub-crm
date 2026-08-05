import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  getSubcommand
} from "../../chunks/chunk-YPQSDAEW.js";
import {
  addSubcommand7 as addSubcommand,
  getCommandAliases,
  linkCommand
} from "../../chunks/chunk-D43MOSMZ.js";
import "../../chunks/chunk-5OT26JZN.js";
import "../../chunks/chunk-7C7MMT4J.js";
import "../../chunks/chunk-RLJA2KI7.js";
import "../../chunks/chunk-JJWESW5Y.js";
import "../../chunks/chunk-QKR7GNAK.js";
import "../../chunks/chunk-5AJNUXWP.js";
import "../../chunks/chunk-7S3QUMIG.js";
import "../../chunks/chunk-22GUZ5KG.js";
import "../../chunks/chunk-IDMKFYEA.js";
import "../../chunks/chunk-HA7C7SDO.js";
import {
  ensureLink
} from "../../chunks/chunk-EJV2KFOF.js";
import "../../chunks/chunk-OKWMOW2F.js";
import "../../chunks/chunk-QH7WYDEP.js";
import {
  isPromptCanceledError
} from "../../chunks/chunk-AA3E7OLF.js";
import "../../chunks/chunk-IIUE7CDZ.js";
import {
  detectExplicitScope,
  getScope
} from "../../chunks/chunk-OCEM4YAQ.js";
import {
  help
} from "../../chunks/chunk-QY63UKTP.js";
import "../../chunks/chunk-QEEGXNFK.js";
import {
  addRepoLink,
  ensureRepoLink,
  pull,
  resolveProjectCwd
} from "../../chunks/chunk-XHC5YRFY.js";
import "../../chunks/chunk-2QBF3ZL3.js";
import {
  TelemetryClient
} from "../../chunks/chunk-ECCWJHC6.js";
import {
  getFlagsSpecification,
  parseArguments,
  printError
} from "../../chunks/chunk-EHTPDXTS.js";
import {
  cmd
} from "../../chunks/chunk-P6AK7SVK.js";
import "../../chunks/chunk-P4QNYOFB.js";
import "../../chunks/chunk-2RVK3DDN.js";
import {
  output_manager_default
} from "../../chunks/chunk-OX7KI3LF.js";
import "../../chunks/chunk-GGP5R3FU.js";
import {
  require_source
} from "../../chunks/chunk-S7KYDPEM.js";
import {
  __toESM
} from "../../chunks/chunk-TZ2YI2VH.js";

// src/commands/link/index.ts
var import_chalk = __toESM(require_source(), 1);

// src/util/telemetry/commands/link/index.ts
var LinkTelemetryClient = class extends TelemetryClient {
  trackCliArgumentCwd() {
    this.trackCliArgument({
      arg: "cwd",
      value: this.redactedValue
    });
  }
  trackCliFlagRepo(flag) {
    if (flag) {
      this.trackCliFlag("repo");
    }
  }
  trackCliFlagYes(yes) {
    if (yes) {
      this.trackCliFlag("yes");
    }
  }
  trackCliFlagConfirm(flag) {
    if (flag) {
      this.trackCliFlag("confirm");
    }
  }
  trackCliOptionTeam(value) {
    if (value) {
      this.trackCliOption({
        option: "team",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionProjectId(value) {
    if (value) {
      this.trackCliOption({
        option: "project-id",
        value: this.redactedValue
      });
    }
  }
  trackCliSubcommandAdd(actual) {
    this.trackCliSubcommand({
      subcommand: "add",
      value: actual
    });
  }
};

// src/commands/link/index.ts
var COMMAND_CONFIG = {
  add: getCommandAliases(addSubcommand)
};
function warnOidcRefreshFailed() {
  output_manager_default.print(
    `${import_chalk.default.yellow("!")} Linked project, but failed to refresh VERCEL_OIDC_TOKEN in .env.local. Rerun the link command to retry.
`
  );
}
async function refreshOidcTokenAfterLink(client, cwd) {
  const originalCwd = client.cwd;
  try {
    client.cwd = await resolveProjectCwd(cwd);
    output_manager_default.print("\n");
    const exitCode = await pull(client, ["--yes"], "vercel-cli:link", {
      oidcTokenOnly: true
    });
    if (exitCode !== 0) {
      warnOidcRefreshFailed();
    }
  } catch (_error) {
    warnOidcRefreshFailed();
  } finally {
    client.cwd = originalCwd;
  }
}
async function link(client) {
  try {
    return await client.withEscapePromptCancellation(() => linkProject(client));
  } catch (error) {
    if (isPromptCanceledError(error)) {
      output_manager_default.print("  Canceled.\n");
      return 0;
    }
    throw error;
  }
}
async function linkProject(client) {
  let parsedArgs = null;
  const flagsSpecification = getFlagsSpecification(linkCommand.options);
  try {
    parsedArgs = parseArguments(client.argv.slice(2), flagsSpecification, {
      permissive: true
    });
  } catch (error) {
    printError(error);
    return 1;
  }
  const { subcommand, subcommandOriginal } = getSubcommand(
    parsedArgs.args.slice(1),
    COMMAND_CONFIG
  );
  const telemetry = new LinkTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  function printHelp(command) {
    output_manager_default.print(
      help(command, { parent: linkCommand, columns: client.stderr.columns })
    );
  }
  if (subcommand === "add") {
    if (parsedArgs.flags["--help"]) {
      telemetry.trackCliFlagHelp("link", subcommandOriginal);
      printHelp(addSubcommand);
      return 2;
    }
    telemetry.trackCliSubcommandAdd(subcommandOriginal);
    const yes2 = !!parsedArgs.flags["--yes"];
    try {
      await addRepoLink(client, client.cwd, { yes: yes2 });
    } catch (err) {
      if (isPromptCanceledError(err)) {
        throw err;
      }
      output_manager_default.prettyError(err);
      return 1;
    }
    return 0;
  }
  try {
    parsedArgs = parseArguments(client.argv.slice(2), flagsSpecification);
  } catch (error) {
    printError(error);
    return 1;
  }
  if (parsedArgs.flags["--help"]) {
    telemetry.trackCliFlagHelp("link");
    output_manager_default.print(help(linkCommand, { columns: client.stderr.columns }));
    return 2;
  }
  telemetry.trackCliFlagRepo(parsedArgs.flags["--repo"]);
  telemetry.trackCliFlagYes(parsedArgs.flags["--yes"]);
  telemetry.trackCliOptionProject(parsedArgs.flags["--project"]);
  if ("--confirm" in parsedArgs.flags) {
    telemetry.trackCliFlagConfirm(parsedArgs.flags["--confirm"]);
    output_manager_default.warn("`--confirm` is deprecated, please use `--yes` instead");
    parsedArgs.flags["--yes"] = parsedArgs.flags["--confirm"];
  }
  const yes = !!parsedArgs.flags["--yes"];
  let cwd = parsedArgs.args[1];
  if (cwd) {
    telemetry.trackCliArgumentCwd();
    output_manager_default.warn(
      `The ${cmd("vc link <directory>")} syntax is deprecated, please use ${cmd(
        `vc link --cwd ${cwd}`
      )} instead`
    );
  } else {
    cwd = client.cwd;
  }
  if (parsedArgs.flags["--repo"]) {
    output_manager_default.warn(`The ${cmd("--repo")} flag is in alpha, please report issues`);
    try {
      await ensureRepoLink(client, cwd, { yes, overwrite: true });
    } catch (err) {
      if (isPromptCanceledError(err)) {
        throw err;
      }
      output_manager_default.prettyError(err);
      return 1;
    }
  } else {
    const explicitScopeProvided = detectExplicitScope(client);
    const selectedOrg = explicitScopeProvided ? (await getScope(client, { resolveLocalScope: true })).org : void 0;
    const linkNonInteractive = client.nonInteractive || client.argv.includes("--non-interactive");
    const link2 = await ensureLink("link", client, cwd, {
      autoConfirm: yes,
      forceDelete: true,
      selectedOrg,
      projectName: parsedArgs.flags["--project"],
      successEmoji: "success",
      nonInteractive: linkNonInteractive,
      pullEnv: false
    });
    if (typeof link2 === "number") {
      return link2;
    }
    await refreshOidcTokenAfterLink(client, cwd);
  }
  return 0;
}
export {
  link as default
};
