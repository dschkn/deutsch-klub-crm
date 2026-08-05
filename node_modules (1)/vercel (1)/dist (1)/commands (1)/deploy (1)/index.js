import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  Now,
  UploadErrorMissingArchive,
  createCertForCns,
  displayBuildLogsUntilFinalError,
  printDeploymentStatus,
  purchaseDomainIfAvailable,
  require_cjs,
  setupDomain
} from "../../chunks/chunk-HOYOJUQZ.js";
import {
  readLocalConfig
} from "../../chunks/chunk-EUARKVCA.js";
import {
  highlight
} from "../../chunks/chunk-V5P25P7F.js";
import "../../chunks/chunk-XBN2O34P.js";
import {
  parseMeta
} from "../../chunks/chunk-EKPSCRJZ.js";
import {
  getDeployment,
  mapCertError
} from "../../chunks/chunk-SGL3NMOP.js";
import {
  validateJsonOutput
} from "../../chunks/chunk-XPKWKPWA.js";
import {
  getSubcommand
} from "../../chunks/chunk-YPQSDAEW.js";
import {
  continueSubcommand,
  deployCommand,
  deprecatedArchiveSplitTgz,
  getCommandAliases,
  initSubcommand
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
  pickOverrides
} from "../../chunks/chunk-6CRRXESK.js";
import "../../chunks/chunk-NJUPUGOE.js";
import {
  stamp_default
} from "../../chunks/chunk-64IF634X.js";
import "../../chunks/chunk-VXYGCOKL.js";
import {
  ensureLink
} from "../../chunks/chunk-EJV2KFOF.js";
import {
  validatePaths,
  validateRootDirectory
} from "../../chunks/chunk-OKWMOW2F.js";
import {
  AGENT_STATUS
} from "../../chunks/chunk-QH7WYDEP.js";
import "../../chunks/chunk-AA3E7OLF.js";
import "../../chunks/chunk-IIUE7CDZ.js";
import "../../chunks/chunk-OCEM4YAQ.js";
import {
  help
} from "../../chunks/chunk-QY63UKTP.js";
import {
  table
} from "../../chunks/chunk-QEEGXNFK.js";
import {
  compileVercelConfig,
  createGitMeta,
  param,
  parseEnv,
  parseTarget,
  printAlignedLabel,
  require_dist as require_dist2,
  require_frameworks,
  require_lib
} from "../../chunks/chunk-XHC5YRFY.js";
import {
  outputAgentError
} from "../../chunks/chunk-2QBF3ZL3.js";
import {
  TelemetryClient
} from "../../chunks/chunk-ECCWJHC6.js";
import {
  getCommandNameWithGlobalFlags,
  getFlagsSpecification,
  parseArguments,
  printError
} from "../../chunks/chunk-EHTPDXTS.js";
import {
  AliasDomainConfigured,
  BuildError,
  BuildsRateLimited,
  ConflictingConfigFiles,
  ConflictingFilePath,
  ConflictingPathSegment,
  DeploymentNotFound,
  DeploymentsRateLimited,
  DeprecatedNowJson,
  DomainNotFound,
  DomainNotVerified,
  DomainPermissionDenied,
  DomainVerificationFailed,
  InvalidDomain,
  MissingBuildScript,
  NotDomainOwner,
  NowError,
  SchemaValidationFailed,
  TooManyRequests,
  UserAborted,
  code,
  getCommandName,
  isAPIError,
  require_bytes
} from "../../chunks/chunk-P6AK7SVK.js";
import "../../chunks/chunk-P4QNYOFB.js";
import "../../chunks/chunk-2RVK3DDN.js";
import {
  emoji,
  link_default,
  output_manager_default,
  prependEmoji,
  require_dist
} from "../../chunks/chunk-OX7KI3LF.js";
import {
  require_ms
} from "../../chunks/chunk-GGP5R3FU.js";
import {
  require_source
} from "../../chunks/chunk-S7KYDPEM.js";
import {
  __toESM
} from "../../chunks/chunk-TZ2YI2VH.js";

// src/commands/deploy/index.ts
var import_client3 = __toESM(require_dist2(), 1);
var import_error_utils = __toESM(require_dist(), 1);
var import_frameworks = __toESM(require_frameworks(), 1);
var import_bytes = __toESM(require_bytes(), 1);
var import_chalk = __toESM(require_source(), 1);
var import_fs_extra2 = __toESM(require_lib(), 1);
var import_ms = __toESM(require_ms(), 1);
import {
  getPrettyError,
  getSupportedNodeVersion,
  scanParentDirs
} from "@vercel/build-utils";
import { join as join2, resolve } from "path";

// src/util/deploy/generate-cert-for-deploy.ts
var import_tldts = __toESM(require_cjs(), 1);
async function generateCertForDeploy(client, contextName, deployURL) {
  const parsedDomain = (0, import_tldts.parse)(deployURL);
  const { domain } = parsedDomain;
  if (!domain) {
    return new InvalidDomain(deployURL);
  }
  output_manager_default.spinner(`Setting custom suffix domain ${domain}`);
  const result = await setupDomain(client, domain, contextName);
  output_manager_default.stopSpinner();
  if (result instanceof NowError) {
    return result;
  }
  output_manager_default.spinner(`Generating a wildcard certificate for ${domain}`);
  const cert = await createCertForCns(
    client,
    [domain, `*.${domain}`],
    contextName
  );
  output_manager_default.stopSpinner();
  if (cert instanceof NowError) {
    return cert;
  }
}

// src/util/deploy/create-deploy.ts
async function createDeploy(client, now, contextName, path, createArgs, org, isSettingUpProject, archive) {
  try {
    return await now.create(path, createArgs, org, isSettingUpProject, archive);
  } catch (err) {
    if (isAPIError(err)) {
      if (err.code === "rate_limited") {
        throw new DeploymentsRateLimited(err.message);
      }
      if (err.code === "domain_missing") {
        throw new DomainNotFound(err.value);
      }
      if (err.code === "domain_not_found" && err.domain) {
        throw new DomainNotFound(err.domain);
      }
      if (err.code === "domain_not_verified" && err.domain) {
        throw new DomainNotVerified(err.domain);
      }
      if (err.code === "domain_not_verified" && err.value) {
        throw new DomainVerificationFailed(err.value);
      }
      if (err.code === "not_domain_owner") {
        throw new NotDomainOwner(err.message);
      }
      if (err.code === "builds_rate_limited") {
        throw new BuildsRateLimited(err.message, {
          ctaLabel: err.ctaLabel,
          ctaUrl: err.ctaUrl,
          action: err.action,
          link: err.link
        });
      }
      if (err.code === "forbidden") {
        throw new DomainPermissionDenied(err.value, contextName);
      }
      if (err.code === "bad_request" && err.keyword) {
        throw new SchemaValidationFailed(
          err.message,
          err.keyword,
          err.dataPath,
          err.params
        );
      }
      if (err.code === "domain_configured") {
        throw new AliasDomainConfigured(err);
      }
      if (err.code === "missing_build_script") {
        throw new MissingBuildScript(err);
      }
      if (err.code === "conflicting_file_path") {
        throw new ConflictingFilePath(err);
      }
      if (err.code === "conflicting_path_segment") {
        throw new ConflictingPathSegment(err);
      }
      if (err.code === "cert_missing") {
        const result = await generateCertForDeploy(
          client,
          contextName,
          err.value
        );
        if (result instanceof NowError) {
          return result;
        }
        return createDeploy(
          client,
          now,
          contextName,
          path,
          createArgs,
          org,
          isSettingUpProject
        );
      }
      if (err.code === "not_found") {
        throw new DeploymentNotFound({ context: contextName });
      }
      const certError = mapCertError(err);
      if (certError) {
        return certError;
      }
    }
    throw err;
  }
}

// src/util/deploy/get-deployment-checks.ts
async function getDeploymentChecks(client, deploymentId) {
  const checksResponse = await client.fetch(
    `/v1/deployments/${encodeURIComponent(deploymentId)}/checks`
  );
  return checksResponse;
}

// src/util/deploy/get-deployment-check-runs.ts
async function getDeploymentCheckRuns(client, deploymentId) {
  const response = await client.fetch(
    `/v2/deployments/${encodeURIComponent(deploymentId)}/check-runs`
  );
  return response;
}

// src/util/deploy/get-deployment-check-run-logs.ts
var MAX_ATTEMPTS = 5;
var POLL_INTERVAL_MS = 2e3;
function parseNdjson(text) {
  const entries = [];
  for (const line of text.split("\n")) {
    if (!line.trim())
      continue;
    try {
      entries.push(JSON.parse(line));
    } catch {
    }
  }
  return entries;
}
async function getDeploymentCheckRunLogs(client, deploymentId, checkRunId) {
  const url = `/v2/deployments/${encodeURIComponent(deploymentId)}/check-runs/${encodeURIComponent(checkRunId)}/logs`;
  await new Promise((resolve2) => setTimeout(resolve2, 1e3));
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0)
      await new Promise((resolve2) => setTimeout(resolve2, POLL_INTERVAL_MS));
    const res = await client.fetch(url, { json: false });
    const text = typeof res === "string" ? res : await res.text();
    const entries = parseNdjson(text);
    const hasEof = entries.some((e) => e.level === "eof");
    if (hasEof) {
      return entries.filter((e) => e.level !== "eof" && e.level !== "debug").map(({ level, timestamp, message }) => ({
        level,
        timestamp,
        message
      }));
    }
  }
  return [];
}

// src/util/deploy/get-prebuilt-json.ts
var import_fs_extra = __toESM(require_lib(), 1);
import { join } from "path";
async function getPrebuiltJson(directory) {
  try {
    return await import_fs_extra.default.readJSON(join(directory, "builds.json"));
  } catch (_error) {
  }
  return null;
}

// src/util/deploy/validate-archive-format.ts
var import_client = __toESM(require_dist2(), 1);
var validArchiveFormats = new Set(import_client.VALID_ARCHIVE_FORMATS);
function isValidArchive(archive) {
  return validArchiveFormats.has(archive);
}

// src/util/get-error-cta.ts
function getErrorCta(source) {
  if (typeof source.ctaLabel === "string" && typeof source.ctaUrl === "string") {
    return { label: source.ctaLabel, url: source.ctaUrl };
  }
  if (typeof source.action === "string" && typeof source.link === "string") {
    return { label: source.action, url: source.link };
  }
  return void 0;
}

// src/util/telemetry/commands/deploy/index.ts
var import_client2 = __toESM(require_dist2(), 1);
var DeployTelemetryClient = class extends TelemetryClient {
  trackCliArgumentProjectPath(projectPaths) {
    if (projectPaths) {
      this.trackCliArgument({
        arg: "project-path",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionArchive(format) {
    if (format) {
      const allowedFormat = [
        ...import_client2.VALID_ARCHIVE_FORMATS,
        deprecatedArchiveSplitTgz
      ].includes(format) ? format : this.redactedValue;
      this.trackCliOption({
        option: "archive",
        value: allowedFormat
      });
    }
  }
  trackCliOptionBuildEnv(buildEnv) {
    if (buildEnv && buildEnv.length > 0) {
      this.trackCliOption({
        option: "build-env",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionEnv(env) {
    if (env && env.length > 0) {
      this.trackCliOption({
        option: "env",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionMeta(meta) {
    if (meta && meta.length > 0) {
      this.trackCliOption({
        option: "meta",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionName(name) {
    if (name) {
      this.trackCliOption({
        option: "name",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionRegions(regions) {
    if (regions) {
      this.trackCliOption({
        option: "regions",
        // consider revisiting once we come up with a way to query the list of regions
        value: this.redactedValue
      });
    }
  }
  trackCliOptionTarget(target) {
    if (target) {
      this.trackCliOption({
        option: "target",
        value: this.redactedTargetName(target)
      });
    }
  }
  trackCliFlagConfirm(flag) {
    if (flag) {
      this.trackCliFlag("confirm");
    }
  }
  trackCliFlagForce(flag) {
    if (flag) {
      this.trackCliFlag("force");
    }
  }
  trackCliFlagLogs(flag) {
    if (flag) {
      this.trackCliFlag("logs");
    }
  }
  trackCliFlagNoLogs(flag) {
    if (flag) {
      this.trackCliFlag("no-logs");
    }
  }
  trackCliFlagGuidance(flag) {
    if (flag) {
      this.trackCliFlag("guidance");
    }
  }
  trackCliFlagNoClipboard(flag) {
    if (flag) {
      this.trackCliFlag("no-clipboard");
    }
  }
  trackCliFlagNoWait(flag) {
    if (flag) {
      this.trackCliFlag("no-wait");
    }
  }
  trackCliFlagDry(flag) {
    if (flag) {
      this.trackCliFlag("dry");
    }
  }
  trackCliFlagPrebuilt(flag) {
    if (flag) {
      this.trackCliFlag("prebuilt");
    }
  }
  trackCliSubcommandInit(actual) {
    this.trackCliSubcommand({
      subcommand: "init",
      value: actual
    });
  }
  trackCliSubcommandContinue(actual) {
    this.trackCliSubcommand({
      subcommand: "continue",
      value: actual
    });
  }
  trackCliFlagProd(flag) {
    if (flag) {
      this.trackCliFlag("prod");
    }
  }
  trackTargetEnvironment(target) {
    super.trackTargetEnvironment(
      target === "production" ? "production" : "preview"
    );
  }
  trackCliFlagPublic(flag) {
    if (flag) {
      this.trackCliFlag("public");
    }
  }
  trackCliFlagSkipDomain(flag) {
    if (flag) {
      this.trackCliFlag("skip-domain");
    }
  }
  trackCliFlagWithCache(flag) {
    if (flag) {
      this.trackCliFlag("with-cache");
    }
  }
  trackCliFlagYes(flag) {
    if (flag) {
      this.trackCliFlag("yes");
    }
  }
  trackCliFlagJson(flag) {
    if (flag) {
      this.trackCliFlag("json");
    }
  }
  trackCliOptionFormat(format) {
    if (format) {
      this.trackCliOption({
        option: "format",
        value: format
      });
    }
  }
  trackDeploymentId(id) {
    if (id) {
      this.trackCommandOutput({
        key: "deployment-id",
        value: id
      });
    }
  }
};

// src/commands/deploy/index.ts
import { determineAgent } from "@vercel/detect-agent";
var COMMAND_CONFIG = {
  init: getCommandAliases(initSubcommand),
  continue: getCommandAliases(continueSubcommand)
};
var deploy_default = async (client) => {
  const telemetryClient = new DeployTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  let parsedArguments = null;
  const flagsSpecification = getFlagsSpecification(deployCommand.options);
  try {
    parsedArguments = parseArguments(client.argv.slice(2), flagsSpecification, {
      permissive: true
    });
  } catch (error) {
    printError(error);
    return 1;
  }
  const subArgs = parsedArguments.args[0] === deployCommand.name ? parsedArguments.args.slice(1) : parsedArguments.args;
  const { subcommand, subcommandOriginal } = getSubcommand(
    subArgs,
    COMMAND_CONFIG
  );
  function printSubcommandHelp(command) {
    output_manager_default.print(
      help(command, { parent: deployCommand, columns: client.stderr.columns })
    );
  }
  switch (subcommand) {
    case "init":
      if (parsedArguments.flags["--help"]) {
        telemetryClient.trackCliFlagHelp("deploy", subcommandOriginal);
        printSubcommandHelp(initSubcommand);
        return 2;
      }
      telemetryClient.trackCliSubcommandInit(subcommandOriginal);
      return handleInitDeployment(client, telemetryClient);
    case "continue":
      if (parsedArguments.flags["--help"]) {
        telemetryClient.trackCliFlagHelp("deploy", subcommandOriginal);
        printSubcommandHelp(continueSubcommand);
        return 2;
      }
      telemetryClient.trackCliSubcommandContinue(subcommandOriginal);
      return handleContinueSubcommand(client, telemetryClient);
    default:
      if (parsedArguments.flags["--help"]) {
        telemetryClient.trackCliFlagHelp("deploy");
        output_manager_default.print(help(deployCommand, { columns: client.stderr.columns }));
        return 2;
      }
      return handleDefaultDeploy(client, telemetryClient);
  }
};
async function handleInitDeployment(client, telemetryClient) {
  const flagsSpecification = getFlagsSpecification(initSubcommand.options);
  let parsedArguments;
  try {
    parsedArguments = parseArguments(client.argv.slice(2), flagsSpecification);
  } catch (error2) {
    printError(error2);
    return 1;
  }
  telemetryClient.trackCliFlagJson(parsedArguments.flags["--json"]);
  telemetryClient.trackCliOptionFormat(parsedArguments.flags["--format"]);
  telemetryClient.trackCliOptionProject(parsedArguments.flags["--project"]);
  const projectNameOrId = parsedArguments.flags["--project"];
  const formatResult = validateJsonOutput(parsedArguments.flags);
  if (!formatResult.valid) {
    output_manager_default.error(formatResult.error);
    return 1;
  }
  const asJson = formatResult.jsonOutput || client.nonInteractive;
  let args = parsedArguments.args;
  if (args[0] === "deploy")
    args = args.slice(1);
  if (args[0] === "init")
    args = args.slice(1);
  let paths;
  if (args.length > 0) {
    paths = args.map((item) => resolve(client.cwd, item));
    telemetryClient.trackCliArgumentProjectPath(paths[0]);
  } else {
    paths = [client.cwd];
  }
  const pathValidation = await validatePaths(client, paths);
  if (!pathValidation.valid) {
    return pathValidation.exitCode;
  }
  await compileVercelConfig(paths[0]);
  const shouldUseEarlyLocalConfig = paths[0] === client.cwd;
  let localConfig = shouldUseEarlyLocalConfig ? client.localConfig || readLocalConfig(paths[0]) : readLocalConfig(paths[0]);
  if (localConfig) {
    client.localConfig = localConfig;
    const { version } = localConfig;
    const file = highlight(localConfig[import_client3.fileNameSymbol]);
    const prop = code("version");
    if (version) {
      if (typeof version === "number") {
        if (version !== 2) {
          const two = code(String(2));
          output_manager_default.error(
            `The value of the ${prop} property within ${file} can only be ${two}.`
          );
          return 1;
        }
      } else {
        output_manager_default.error(
          `The ${prop} property inside your ${file} file must be a number.`
        );
        return 1;
      }
    }
  }
  const { log, debug, error } = output_manager_default;
  const quiet = !client.stdout.isTTY;
  let { path: cwd } = pathValidation;
  const autoConfirm = parsedArguments.flags["--yes"];
  const target = parseTarget({
    flagName: "target",
    flags: parsedArguments.flags
  });
  telemetryClient.trackTargetEnvironment(target);
  const parsedArchive = parsedArguments.flags["--archive"];
  if (typeof parsedArchive === "string" && !(isValidArchive(parsedArchive) || parsedArchive === deprecatedArchiveSplitTgz)) {
    output_manager_default.error(`Format must be one of: ${import_client3.VALID_ARCHIVE_FORMATS.join(", ")}`);
    return 1;
  }
  if (parsedArchive === deprecatedArchiveSplitTgz) {
    output_manager_default.print(
      `${prependEmoji(
        `${param("--archive=tgz")} now has the same behavior as ${param(
          "--archive=split-tgz"
        )}. Please use ${param("--archive=tgz")} instead.`,
        emoji("warning")
      )}
`
    );
  }
  const cliMeta = parseMeta(parsedArguments.flags["--meta"]);
  const isV0 = cliMeta.v0 === "true";
  const link = await ensureLink("deploy", client, cwd, {
    autoConfirm,
    // Only explicit names: the folder-name fallback is derived inside
    // `setupAndLink`, and passing it would suppress Git-match suggestions.
    projectName: projectNameOrId ?? localConfig?.name,
    failIfNotFound: !!projectNameOrId,
    v0: isV0
  });
  if (typeof link === "number") {
    return link;
  }
  const { org, project } = link;
  const rootDirectory = project.rootDirectory;
  const sourceFilesOutsideRootDirectory = project.sourceFilesOutsideRootDirectory ?? true;
  if (link.repoRoot) {
    cwd = link.repoRoot;
  }
  const contextName = org.slug;
  client.config.currentTeam = org.type === "team" ? org.id : void 0;
  if (rootDirectory && await validateRootDirectory(
    cwd,
    join2(cwd, rootDirectory),
    project ? `To change your Project Settings, go to https://vercel.com/${org?.slug}/${project.name}/settings` : ""
  ) === false) {
    return 1;
  }
  if (rootDirectory) {
    const rootDirectoryPath = join2(cwd, rootDirectory);
    await compileVercelConfig(rootDirectoryPath);
    const rootDirectoryConfig = readLocalConfig(rootDirectoryPath);
    if (rootDirectoryConfig) {
      debug(`Read local config from root directory (${rootDirectory})`);
      localConfig = rootDirectoryConfig;
    } else if (localConfig) {
      output_manager_default.print(
        `${prependEmoji(
          `The ${highlight(
            localConfig[import_client3.fileNameSymbol]
          )} file should be inside of the provided root directory.`,
          emoji("warning")
        )}
`
      );
    }
  }
  localConfig = localConfig || {};
  if (localConfig.name) {
    output_manager_default.print(
      `${prependEmoji(
        `The ${code("name")} property in ${highlight(
          localConfig[import_client3.fileNameSymbol]
        )} is deprecated (https://vercel.link/name-prop)`,
        emoji("warning")
      )}
`
    );
  }
  const isObject = (item) => Object.prototype.toString.call(item) === "[object Object]";
  if (typeof localConfig.env !== "undefined" && !isObject(localConfig.env)) {
    error(
      `The ${code("env")} property in ${highlight(
        localConfig[import_client3.fileNameSymbol]
      )} needs to be an object`
    );
    return 1;
  }
  if (typeof localConfig.build !== "undefined") {
    if (!isObject(localConfig.build)) {
      error(
        `The ${code("build")} property in ${highlight(
          localConfig[import_client3.fileNameSymbol]
        )} needs to be an object`
      );
      return 1;
    }
    if (typeof localConfig.build.env !== "undefined" && !isObject(localConfig.build.env)) {
      error(
        `The ${code("build.env")} property in ${highlight(
          localConfig[import_client3.fileNameSymbol]
        )} needs to be an object`
      );
      return 1;
    }
  }
  const meta = Object.assign({}, parseMeta(localConfig.meta), cliMeta);
  const gitMetadata = await createGitMeta(cwd, project);
  const deploymentEnv = Object.assign(
    {},
    parseEnv(localConfig.env),
    parseEnv(parsedArguments.flags["--env"])
  );
  const deploymentBuildEnv = Object.assign(
    {},
    parseEnv(localConfig.build && localConfig.build.env),
    parseEnv(parsedArguments.flags["--build-env"])
  );
  try {
    await addProcessEnv(log, deploymentEnv);
    await addProcessEnv(log, deploymentBuildEnv);
  } catch (err) {
    error((0, import_error_utils.errorToString)(err));
    return 1;
  }
  const regionFlag = (parsedArguments.flags["--regions"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  const regions = regionFlag.length > 0 ? regionFlag : localConfig.regions;
  const currentTeam = org.type === "team" ? org.id : void 0;
  const now = new Now({
    client,
    currentTeam
  });
  const deployStamp = stamp_default();
  const localConfigurationOverrides = pickOverrides(localConfig);
  const name = project.name;
  if (!name) {
    throw new Error(
      "`name` not found on project or provided by existing project"
    );
  }
  const noWait = true;
  try {
    const autoAssignCustomDomains = parsedArguments.flags["--skip-domain"] ? false : void 0;
    const createArgs = {
      name,
      env: deploymentEnv,
      build: { env: deploymentBuildEnv },
      forceNew: parsedArguments.flags["--force"],
      withCache: parsedArguments.flags["--with-cache"],
      prebuilt: true,
      vercelOutputDir: void 0,
      rootDirectory,
      quiet,
      nowConfig: {
        ...localConfig,
        images: void 0
      },
      regions,
      meta,
      gitMetadata,
      deployStamp,
      target,
      skipAutoDetectionConfirmation: autoConfirm,
      noWait,
      withFullLogs: false,
      autoAssignCustomDomains,
      manual: true,
      jsonOutput: asJson,
      linkedProject: project
    };
    if (!localConfig.builds || localConfig.builds.length === 0) {
      createArgs.projectSettings = {
        sourceFilesOutsideRootDirectory,
        rootDirectory,
        ...localConfigurationOverrides
      };
    }
    const { packageJson } = await scanParentDirs(
      join2(cwd, project?.rootDirectory ?? ""),
      true,
      cwd
    );
    let nodeVersion;
    if (packageJson?.engines?.node) {
      try {
        const { range } = await getSupportedNodeVersion(
          packageJson.engines.node
        );
        nodeVersion = range;
      } catch (error2) {
        if (error2 instanceof Error) {
          output_manager_default.warn(error2.message);
        }
      }
    }
    if (!createArgs.projectSettings)
      createArgs.projectSettings = {};
    createArgs.projectSettings.nodeVersion = nodeVersion;
    const deployment = await createDeploy(
      client,
      now,
      contextName,
      cwd,
      createArgs,
      org,
      !project,
      parsedArchive ? "tgz" : void 0
    );
    if (deployment instanceof NotDomainOwner) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "not_domain_owner",
              message: deployment.message,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        output_manager_default.error(deployment.message);
        return 1;
      }
    }
    if (deployment instanceof Error) {
      const msg = deployment.message || "An unexpected error occurred while deploying your project";
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "deploy_failed",
              message: msg,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        output_manager_default.error(
          msg,
          void 0,
          "https://vercel.link/help",
          "Contact Support"
        );
        return 1;
      }
    }
    if (deployment.readyState === "CANCELED") {
      if (asJson) {
        output_manager_default.stopSpinner();
        const deploymentJson = getDeploymentOutputJson(
          deployment,
          client.apiUrl,
          {
            name: "DEPLOYMENT_CANCELED",
            message: "The deployment has been canceled."
          }
        );
        const payload = client.nonInteractive ? {
          status: AGENT_STATUS.ERROR,
          reason: "deployment_canceled",
          message: "The deployment has been canceled.",
          deployment: deploymentJson,
          next: [
            {
              command: getCommandNameWithGlobalFlags("deploy", client.argv),
              when: "retry deploy"
            }
          ]
        } : deploymentJson;
        client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
      } else {
        output_manager_default.print("The deployment has been canceled.\n");
      }
      return 1;
    }
    if (deployment.checks?.["deployment-alias"]?.state === "failed") {
      return handleFailedCheckRuns(client, deployment, asJson);
    }
    if (deployment.checksConclusion === "failed") {
      const { checks } = await getDeploymentChecks(client, deployment.id);
      const counters = /* @__PURE__ */ new Map();
      checks.forEach((c) => {
        counters.set(c.conclusion, (counters.get(c.conclusion) ?? 0) + 1);
      });
      const counterList = Array.from(counters).map(([name2, no]) => `${no} ${name2}`).join(", ");
      if (asJson) {
        output_manager_default.stopSpinner();
        const message = `Running Checks: ${counterList}`;
        const deploymentJson = getDeploymentOutputJson(
          deployment,
          client.apiUrl,
          {
            name: "CHECKS_FAILED",
            message
          }
        );
        const payload = client.nonInteractive ? {
          status: AGENT_STATUS.ERROR,
          reason: "checks_failed",
          message,
          deployment: deploymentJson,
          next: [
            {
              command: getCommandNameWithGlobalFlags("deploy", client.argv),
              when: "retry deploy"
            }
          ]
        } : deploymentJson;
        client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
      } else {
        output_manager_default.error(`Running Checks: ${counterList}`);
      }
      return 1;
    }
    if (deployment === null) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "upload_failed",
              message: "Uploading failed. Please try again.",
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        error("Uploading failed. Please try again.");
        return 1;
      }
    }
    if (asJson) {
      output_manager_default.stopSpinner();
      const deploymentJson = getDeploymentOutputJson(deployment, client.apiUrl);
      const payload = client.nonInteractive ? {
        status: AGENT_STATUS.OK,
        deployment: deploymentJson,
        message: `Deployment ${deployment.url} ready.`,
        next: [
          {
            command: getCommandNameWithGlobalFlags(
              `inspect ${deployment.url}`,
              client.argv
            ),
            when: "Inspect deployment"
          },
          {
            command: getCommandNameWithGlobalFlags(
              "deploy --prod",
              client.argv
            ),
            when: "Promote to production"
          }
        ]
      } : deploymentJson;
      client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
      return 0;
    }
    return printDeploymentStatus(
      client,
      deployment,
      deployStamp,
      noWait,
      false,
      true
    );
  } catch (err) {
    if ((0, import_error_utils.isError)(err)) {
      debug(`Error: ${err}
${err.stack}`);
    }
    if (err instanceof UploadErrorMissingArchive) {
      output_manager_default.prettyError(err);
      return 1;
    }
    if (err instanceof NotDomainOwner) {
      output_manager_default.error(err.message);
      return 1;
    }
    if (err instanceof DomainNotFound || err instanceof DomainNotVerified || err instanceof NotDomainOwner || err instanceof DomainPermissionDenied || err instanceof DomainVerificationFailed || err instanceof SchemaValidationFailed || err instanceof InvalidDomain || err instanceof DeploymentNotFound || err instanceof BuildsRateLimited || err instanceof DeploymentsRateLimited || err instanceof AliasDomainConfigured || err instanceof MissingBuildScript || err instanceof ConflictingFilePath || err instanceof ConflictingPathSegment || err instanceof ConflictingConfigFiles || err instanceof DeprecatedNowJson) {
      handleCreateDeployError(err, localConfig);
      return 1;
    }
    if (isAPIError(err) && err.code === "size_limit_exceeded") {
      const { sizeLimit = 0 } = err;
      const message = `File size limit exceeded (${(0, import_bytes.default)(sizeLimit)})`;
      error(message);
      return 1;
    }
    printError(err);
    return 1;
  }
}
async function handleContinueSubcommand(client, telemetryClient) {
  const flagsSpecification = getFlagsSpecification(continueSubcommand.options);
  let parsedArguments;
  try {
    parsedArguments = parseArguments(client.argv.slice(2), flagsSpecification);
  } catch (error) {
    printError(error);
    return 1;
  }
  const idFlag = parsedArguments.flags["--id"];
  const parsedArchive = parsedArguments.flags["--archive"];
  const errorMessage = parsedArguments.flags["--error"];
  if (typeof parsedArchive === "string" && !isValidArchive(parsedArchive)) {
    output_manager_default.error(`Format must be one of: ${import_client3.VALID_ARCHIVE_FORMATS.join(", ")}`);
    return 1;
  }
  telemetryClient.trackCliOptionArchive(parsedArchive);
  if (parsedArchive && errorMessage !== void 0) {
    output_manager_default.error(`Cannot use ${param("--archive")} with ${param("--error")}`);
    return 1;
  }
  if (errorMessage !== void 0 && errorMessage.trim() === "") {
    output_manager_default.error(`${param("--error")} requires an error message`);
    return 1;
  }
  if (!idFlag) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: AGENT_STATUS.ERROR,
          reason: "missing_id",
          message: "Missing required --id flag. Provide the deployment ID to continue.",
          next: [
            {
              command: getCommandNameWithGlobalFlags(
                "deploy continue --id <deployment-id>",
                client.argv
              ),
              when: "provide deployment ID"
            }
          ]
        },
        1
      );
      return 1;
    } else {
      output_manager_default.error(
        `Missing required ${param("--id")} flag. Usage: ${getCommandName("deploy continue --id <deployment-id>")}`
      );
      return 1;
    }
  }
  const paths = [client.cwd];
  const pathValidation = await validatePaths(client, paths);
  if (!pathValidation.valid) {
    return pathValidation.exitCode;
  }
  await compileVercelConfig(paths[0]);
  const localConfig = client.localConfig || readLocalConfig(paths[0]);
  if (localConfig) {
    client.localConfig = localConfig;
  }
  let { path: cwd } = pathValidation;
  const link = await ensureLink("deploy", client, cwd, {
    autoConfirm: true,
    // Only explicit names: the folder-name fallback is derived inside
    // `setupAndLink`, and passing it would suppress Git-match suggestions.
    projectName: localConfig?.name
  });
  if (typeof link === "number") {
    return link;
  }
  const { org } = link;
  if (link.repoRoot) {
    cwd = link.repoRoot;
  }
  client.config.currentTeam = org.type === "team" ? org.id : void 0;
  if (errorMessage !== void 0) {
    try {
      await client.fetch(`/deployments/${idFlag}/continue`, {
        method: "POST",
        body: { errorMessage }
      });
      output_manager_default.success(`Marked deployment ${idFlag} as errored`);
      return 0;
    } catch (error) {
      printError(error);
      return 1;
    }
  }
  let vercelOutputDir = join2(cwd, ".vercel/output");
  if (link.repoRoot && link.project.rootDirectory) {
    vercelOutputDir = join2(cwd, link.project.rootDirectory, ".vercel/output");
  }
  const prebuiltExists = await import_fs_extra2.default.pathExists(vercelOutputDir);
  if (!prebuiltExists) {
    if (client.nonInteractive) {
      outputAgentError(
        client,
        {
          status: AGENT_STATUS.ERROR,
          reason: "prebuilt_not_found",
          message: 'No prebuilt output found in ".vercel/output". Run build first.',
          next: [
            {
              command: getCommandNameWithGlobalFlags("build", client.argv),
              when: "generate prebuilt output"
            },
            {
              command: getCommandNameWithGlobalFlags(
                `deploy continue --id ${idFlag}`,
                client.argv
              ),
              when: "deploy prebuilt output"
            }
          ]
        },
        1
      );
      return 1;
    } else {
      output_manager_default.error(
        `No prebuilt output found in ".vercel/output". Run ${getCommandName(
          "build"
        )} to generate a local build.`
      );
      return 1;
    }
  }
  const deployStamp = stamp_default();
  return handleContinueDeployment({
    client,
    deploymentId: idFlag,
    cwd,
    deployStamp,
    noWait: false,
    org,
    vercelOutputDir,
    archive: parsedArchive ? "tgz" : void 0
  });
}
async function handleDefaultDeploy(client, telemetryClient) {
  const flagsSpecification = getFlagsSpecification(deployCommand.options);
  let parsedArguments;
  try {
    parsedArguments = parseArguments(client.argv.slice(2), flagsSpecification);
  } catch (error2) {
    printError(error2);
    return 1;
  }
  telemetryClient.trackCliOptionArchive(parsedArguments.flags["--archive"]);
  telemetryClient.trackCliOptionEnv(parsedArguments.flags["--env"]);
  telemetryClient.trackCliOptionBuildEnv(parsedArguments.flags["--build-env"]);
  telemetryClient.trackCliOptionMeta(parsedArguments.flags["--meta"]);
  telemetryClient.trackCliFlagPrebuilt(parsedArguments.flags["--prebuilt"]);
  telemetryClient.trackCliOptionRegions(parsedArguments.flags["--regions"]);
  telemetryClient.trackCliFlagNoWait(parsedArguments.flags["--no-wait"]);
  telemetryClient.trackCliFlagDry(parsedArguments.flags["--dry"]);
  telemetryClient.trackCliFlagYes(parsedArguments.flags["--yes"]);
  telemetryClient.trackCliOptionTarget(parsedArguments.flags["--target"]);
  telemetryClient.trackCliFlagProd(parsedArguments.flags["--prod"]);
  telemetryClient.trackCliFlagSkipDomain(
    parsedArguments.flags["--skip-domain"]
  );
  telemetryClient.trackCliFlagLogs(parsedArguments.flags["--logs"]);
  telemetryClient.trackCliFlagNoLogs(parsedArguments.flags["--no-logs"]);
  telemetryClient.trackCliFlagGuidance(parsedArguments.flags["--guidance"]);
  telemetryClient.trackCliFlagForce(parsedArguments.flags["--force"]);
  telemetryClient.trackCliFlagWithCache(parsedArguments.flags["--with-cache"]);
  telemetryClient.trackCliFlagJson(parsedArguments.flags["--json"]);
  telemetryClient.trackCliOptionFormat(parsedArguments.flags["--format"]);
  telemetryClient.trackCliOptionProject(parsedArguments.flags["--project"]);
  const projectNameOrId = parsedArguments.flags["--project"];
  const formatResult = validateJsonOutput(parsedArguments.flags);
  if (!formatResult.valid) {
    output_manager_default.error(formatResult.error);
    return 1;
  }
  const asJson = formatResult.jsonOutput || client.nonInteractive;
  if ("--confirm" in parsedArguments.flags) {
    telemetryClient.trackCliFlagConfirm(parsedArguments.flags["--confirm"]);
    output_manager_default.warn("`--confirm` is deprecated, please use `--yes` instead");
    parsedArguments.flags["--yes"] = parsedArguments.flags["--confirm"];
  }
  if ("--no-logs" in parsedArguments.flags) {
    output_manager_default.warn("`--no-logs` is deprecated and now the default behavior.");
  }
  if (parsedArguments.args[0] === deployCommand.name) {
    parsedArguments.args.shift();
  }
  let paths;
  if (parsedArguments.args.length > 0) {
    paths = parsedArguments.args.map((item) => resolve(client.cwd, item));
    telemetryClient.trackCliArgumentProjectPath(paths[0]);
  } else {
    paths = [client.cwd];
  }
  const pathValidation = await validatePaths(client, paths);
  if (!pathValidation.valid) {
    return pathValidation.exitCode;
  }
  try {
    await compileVercelConfig(paths[0]);
  } catch (err) {
    if (err instanceof ConflictingConfigFiles || err instanceof DeprecatedNowJson) {
      output_manager_default.prettyError(err);
      return 1;
    }
    throw err;
  }
  const shouldUseEarlyLocalConfig = paths[0] === client.cwd;
  let localConfig = shouldUseEarlyLocalConfig ? client.localConfig || readLocalConfig(paths[0]) : readLocalConfig(paths[0]);
  if (localConfig) {
    client.localConfig = localConfig;
    const { version } = localConfig;
    const file = highlight(localConfig[import_client3.fileNameSymbol]);
    const prop = code("version");
    if (version) {
      if (typeof version === "number") {
        if (version !== 2) {
          const two = code(String(2));
          output_manager_default.error(
            `The value of the ${prop} property within ${file} can only be ${two}.`
          );
          return 1;
        }
      } else {
        output_manager_default.error(
          `The ${prop} property inside your ${file} file must be a number.`
        );
        return 1;
      }
    }
  }
  const { log, debug, error, prettyError } = output_manager_default;
  const quiet = !client.stdout.isTTY;
  let { path: cwd } = pathValidation;
  const autoConfirm = parsedArguments.flags["--yes"] || client.nonInteractive;
  if (parsedArguments.flags["--name"]) {
    output_manager_default.print(
      `${prependEmoji(
        `The ${param(
          "--name"
        )} option is deprecated (https://vercel.link/name-flag)`,
        emoji("warning")
      )}
`
    );
    telemetryClient.trackCliOptionName(parsedArguments.flags["--name"]);
  }
  if (parsedArguments.flags["--no-clipboard"]) {
    output_manager_default.print(
      `${prependEmoji(
        `The ${param(
          "--no-clipboard"
        )} option was ignored because it is the default behavior. Please remove it.`,
        emoji("warning")
      )}
`
    );
    telemetryClient.trackCliFlagNoClipboard(true);
  }
  const target = parseTarget({
    flagName: "target",
    flags: parsedArguments.flags
  });
  telemetryClient.trackTargetEnvironment(target);
  const skipDomain = parsedArguments.flags["--skip-domain"];
  if (skipDomain && target !== "production") {
    output_manager_default.error(
      "The `--skip-domain` option can only be used with production deployments. Use `--prod` or `--target=production`."
    );
    return 1;
  }
  const parsedArchive = parsedArguments.flags["--archive"];
  if (typeof parsedArchive === "string" && !(isValidArchive(parsedArchive) || parsedArchive === deprecatedArchiveSplitTgz)) {
    output_manager_default.error(`Format must be one of: ${import_client3.VALID_ARCHIVE_FORMATS.join(", ")}`);
    return 1;
  }
  if (parsedArchive === deprecatedArchiveSplitTgz) {
    output_manager_default.print(
      `${prependEmoji(
        `${param("--archive=tgz")} now has the same behavior as ${param(
          "--archive=split-tgz"
        )}. Please use ${param("--archive=tgz")} instead.`,
        emoji("warning")
      )}
`
    );
  }
  const cliMeta = parseMeta(parsedArguments.flags["--meta"]);
  const isV0 = cliMeta.v0 === "true";
  const link = await ensureLink("deploy", client, cwd, {
    autoConfirm,
    // Only explicit names: the folder-name fallback is derived inside
    // `setupAndLink`, and passing it would suppress Git-match suggestions.
    projectName: projectNameOrId ?? parsedArguments.flags["--name"] ?? localConfig?.name,
    failIfNotFound: !!projectNameOrId,
    requireExistingLink: parsedArguments.flags["--dry"],
    v0: isV0
  });
  if (typeof link === "number") {
    return link;
  }
  const { org, project } = link;
  const rootDirectory = project.rootDirectory;
  const sourceFilesOutsideRootDirectory = project.sourceFilesOutsideRootDirectory ?? true;
  if (link.repoRoot) {
    cwd = link.repoRoot;
  }
  let vercelOutputDir;
  if (parsedArguments.flags["--prebuilt"]) {
    vercelOutputDir = join2(cwd, ".vercel/output");
    if (link.repoRoot && link.project.rootDirectory) {
      vercelOutputDir = join2(cwd, link.project.rootDirectory, ".vercel/output");
    }
    const prebuiltExists = await import_fs_extra2.default.pathExists(vercelOutputDir);
    if (!prebuiltExists) {
      error(
        `The ${param(
          "--prebuilt"
        )} option was used, but no prebuilt output found in ".vercel/output". Run ${getCommandName(
          "build"
        )} to generate a local build.`
      );
      return 1;
    }
    const prebuiltBuild = await getPrebuiltJson(vercelOutputDir);
    const prebuiltError = prebuiltBuild?.error || prebuiltBuild?.builds?.find((build) => "error" in build)?.error;
    if (prebuiltError) {
      output_manager_default.log(
        `Prebuilt deployment cannot be created because ${getCommandName(
          "build"
        )} failed with error:
`
      );
      prettyError(prebuiltError);
      return 1;
    }
    const assumedTarget = target || "preview";
    if (prebuiltBuild?.target && prebuiltBuild.target !== assumedTarget) {
      let specifyTarget = "";
      if (prebuiltBuild.target === "production") {
        specifyTarget = ` --prod`;
      }
      prettyError({
        message: `The ${param(
          "--prebuilt"
        )} option was used with the target environment "${assumedTarget}", but the prebuilt output found in ".vercel/output" was built with target environment "${prebuiltBuild.target}". Please run ${getCommandName(`--prebuilt${specifyTarget}`)}.`,
        link: "https://vercel.link/prebuilt-environment-mismatch"
      });
      return 1;
    }
  }
  const contextName = org.slug;
  client.config.currentTeam = org.type === "team" ? org.id : void 0;
  if (rootDirectory && await validateRootDirectory(
    cwd,
    join2(cwd, rootDirectory),
    project ? `To change your Project Settings, go to https://vercel.com/${org?.slug}/${project.name}/settings` : ""
  ) === false) {
    return 1;
  }
  if (rootDirectory) {
    const rootDirectoryPath = join2(cwd, rootDirectory);
    await compileVercelConfig(rootDirectoryPath);
    const rootDirectoryConfig = readLocalConfig(rootDirectoryPath);
    if (rootDirectoryConfig) {
      debug(`Read local config from root directory (${rootDirectory})`);
      localConfig = rootDirectoryConfig;
    } else if (localConfig) {
      output_manager_default.print(
        `${prependEmoji(
          `The ${highlight(
            localConfig[import_client3.fileNameSymbol]
          )} file should be inside of the provided root directory.`,
          emoji("warning")
        )}
`
      );
    }
  }
  localConfig = localConfig || {};
  if (parsedArguments.flags["--dry"]) {
    try {
      const summary = await (0, import_client3.inspectDeploymentFiles)({
        path: cwd,
        archive: parsedArchive ? "tgz" : void 0,
        debug: output_manager_default.isDebugEnabled(),
        prebuilt: parsedArguments.flags["--prebuilt"],
        vercelOutputDir,
        projectName: project.name,
        rootDirectory,
        bulkRedirectsPath: localConfig.bulkRedirectsPath
      });
      const framework = resolveDeploymentFrameworkPreset({
        localFramework: localConfig.framework,
        projectFramework: project.framework
      });
      printDeploymentDryRun(
        client,
        summary,
        framework,
        asJson || !client.stdout.isTTY
      );
      return 0;
    } catch (err) {
      printError(err);
      return 1;
    }
  }
  if (localConfig.name) {
    output_manager_default.print(
      `${prependEmoji(
        `The ${code("name")} property in ${highlight(
          localConfig[import_client3.fileNameSymbol]
        )} is deprecated (https://vercel.link/name-prop)`,
        emoji("warning")
      )}
`
    );
  }
  const isObject = (item) => Object.prototype.toString.call(item) === "[object Object]";
  if (typeof localConfig.env !== "undefined" && !isObject(localConfig.env)) {
    error(
      `The ${code("env")} property in ${highlight(
        localConfig[import_client3.fileNameSymbol]
      )} needs to be an object`
    );
    return 1;
  }
  if (typeof localConfig.build !== "undefined") {
    if (!isObject(localConfig.build)) {
      error(
        `The ${code("build")} property in ${highlight(
          localConfig[import_client3.fileNameSymbol]
        )} needs to be an object`
      );
      return 1;
    }
    if (typeof localConfig.build.env !== "undefined" && !isObject(localConfig.build.env)) {
      error(
        `The ${code("build.env")} property in ${highlight(
          localConfig[import_client3.fileNameSymbol]
        )} needs to be an object`
      );
      return 1;
    }
  }
  const meta = Object.assign({}, parseMeta(localConfig.meta), cliMeta);
  const gitMetadata = await createGitMeta(cwd, project);
  const deploymentEnv = Object.assign(
    {},
    parseEnv(localConfig.env),
    parseEnv(parsedArguments.flags["--env"])
  );
  const deploymentBuildEnv = Object.assign(
    {},
    parseEnv(localConfig.build && localConfig.build.env),
    parseEnv(parsedArguments.flags["--build-env"])
  );
  try {
    await addProcessEnv(log, deploymentEnv);
    await addProcessEnv(log, deploymentBuildEnv);
  } catch (err) {
    error((0, import_error_utils.errorToString)(err));
    return 1;
  }
  const regionFlag = (parsedArguments.flags["--regions"] || "").split(",").map((s) => s.trim()).filter(Boolean);
  const regions = regionFlag.length > 0 ? regionFlag : localConfig.regions;
  const currentTeam = org.type === "team" ? org.id : void 0;
  const now = new Now({
    client,
    currentTeam
  });
  const deployStamp = stamp_default();
  let deployment = null;
  const noWait = !!parsedArguments.flags["--no-wait"];
  const withFullLogs = !!parsedArguments.flags["--logs"];
  const localConfigurationOverrides = pickOverrides(localConfig);
  const name = project.name;
  if (!name) {
    throw new Error(
      "`name` not found on project or provided by existing project"
    );
  }
  try {
    const autoAssignCustomDomains = parsedArguments.flags["--skip-domain"] ? false : void 0;
    const createArgs = {
      name,
      env: deploymentEnv,
      build: { env: deploymentBuildEnv },
      forceNew: parsedArguments.flags["--force"],
      withCache: parsedArguments.flags["--with-cache"],
      prebuilt: parsedArguments.flags["--prebuilt"],
      vercelOutputDir,
      rootDirectory,
      quiet,
      nowConfig: {
        ...localConfig,
        images: void 0
      },
      regions,
      meta,
      gitMetadata,
      deployStamp,
      target,
      skipAutoDetectionConfirmation: autoConfirm,
      noWait,
      withFullLogs,
      autoAssignCustomDomains,
      agentName: client.agentName,
      jsonOutput: asJson,
      linkedProject: project
    };
    if (!localConfig.builds || localConfig.builds.length === 0) {
      createArgs.projectSettings = {
        sourceFilesOutsideRootDirectory,
        rootDirectory,
        ...localConfigurationOverrides
      };
    }
    const { packageJson } = await scanParentDirs(
      join2(cwd, project?.rootDirectory ?? ""),
      true,
      cwd
    );
    let nodeVersion;
    if (packageJson?.engines?.node) {
      try {
        const { range } = await getSupportedNodeVersion(
          packageJson.engines.node
        );
        nodeVersion = range;
      } catch (error2) {
        if (error2 instanceof Error) {
          output_manager_default.warn(error2.message);
        }
      }
    }
    if (!createArgs.projectSettings)
      createArgs.projectSettings = {};
    createArgs.projectSettings.nodeVersion = nodeVersion;
    deployment = await createDeploy(
      client,
      now,
      contextName,
      cwd,
      createArgs,
      org,
      !project,
      parsedArchive ? "tgz" : void 0
    );
    if (deployment && !(deployment instanceof Error)) {
      telemetryClient.trackDeploymentId(deployment.id);
    }
    if (deployment instanceof NotDomainOwner) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "not_domain_owner",
              message: deployment.message,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        output_manager_default.error(deployment.message);
        return 1;
      }
    }
    if (deployment instanceof Error) {
      const msg = deployment.message || "An unexpected error occurred while deploying your project";
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "deploy_failed",
              message: msg,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        output_manager_default.error(
          msg,
          void 0,
          "https://vercel.link/help",
          "Contact Support"
        );
        return 1;
      }
    }
    if (deployment.readyState === "CANCELED") {
      if (asJson) {
        output_manager_default.stopSpinner();
        const deploymentJson = getDeploymentOutputJson(
          deployment,
          client.apiUrl,
          {
            name: "DEPLOYMENT_CANCELED",
            message: "The deployment has been canceled."
          }
        );
        const payload = client.nonInteractive ? {
          status: AGENT_STATUS.ERROR,
          reason: "deployment_canceled",
          message: "The deployment has been canceled.",
          deployment: deploymentJson,
          next: [
            {
              command: getCommandNameWithGlobalFlags("deploy", client.argv),
              when: "retry deploy"
            }
          ]
        } : deploymentJson;
        client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
      } else {
        output_manager_default.print("The deployment has been canceled.\n");
      }
      return 1;
    }
    if (deployment.checks?.["deployment-alias"]?.state === "failed") {
      return handleFailedCheckRuns(client, deployment, asJson);
    }
    if (deployment.checksConclusion === "failed") {
      const { checks } = await getDeploymentChecks(client, deployment.id);
      const counters = /* @__PURE__ */ new Map();
      checks.forEach((c) => {
        counters.set(c.conclusion, (counters.get(c.conclusion) ?? 0) + 1);
      });
      const counterList = Array.from(counters).map(([name2, no]) => `${no} ${name2}`).join(", ");
      if (asJson) {
        output_manager_default.stopSpinner();
        const message = `Running Checks: ${counterList}`;
        const deploymentJson = getDeploymentOutputJson(
          deployment,
          client.apiUrl,
          {
            name: "CHECKS_FAILED",
            message
          }
        );
        const payload = client.nonInteractive ? {
          status: AGENT_STATUS.ERROR,
          reason: "checks_failed",
          message,
          deployment: deploymentJson,
          next: [
            {
              command: getCommandNameWithGlobalFlags("deploy", client.argv),
              when: "retry deploy"
            }
          ]
        } : deploymentJson;
        client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
      } else {
        output_manager_default.error(`Running Checks: ${counterList}`);
      }
      return 1;
    }
    if (!noWait && shouldReconcileFinalDeployment(deployment)) {
      await getDeployment(client, contextName, deployment.id);
    }
    if (deployment === null) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "upload_failed",
              message: "Uploading failed. Please try again.",
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        error("Uploading failed. Please try again.");
        return 1;
      }
    }
  } catch (err) {
    if ((0, import_error_utils.isError)(err)) {
      debug(`Error: ${err}
${err.stack}`);
    }
    if (err instanceof UploadErrorMissingArchive) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "missing_archive",
              message: err.message,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        output_manager_default.prettyError(err);
        return 1;
      }
    }
    if (err instanceof NotDomainOwner) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "not_domain_owner",
              message: err.message,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
        return 1;
      } else {
        output_manager_default.error(err.message);
        return 1;
      }
    }
    if (err instanceof DomainNotFound && err.meta && err.meta.domain) {
      output_manager_default.debug(
        `The domain ${err.meta.domain} was not found, trying to purchase it`
      );
      const purchase = await purchaseDomainIfAvailable(
        client,
        err.meta.domain,
        contextName
      );
      if (purchase === true) {
        output_manager_default.success(`Successfully purchased the domain ${err.meta.domain}!`);
        return 0;
      }
      if (purchase === false || purchase instanceof UserAborted) {
        handleCreateDeployError(deployment, localConfig);
        return 1;
      }
      handleCreateDeployError(purchase, localConfig);
      return 1;
    }
    if (err instanceof DomainNotFound || err instanceof DomainNotVerified || err instanceof NotDomainOwner || err instanceof DomainPermissionDenied || err instanceof DomainVerificationFailed || err instanceof SchemaValidationFailed || err instanceof InvalidDomain || err instanceof DeploymentNotFound || err instanceof BuildsRateLimited || err instanceof DeploymentsRateLimited || err instanceof AliasDomainConfigured || err instanceof MissingBuildScript || err instanceof ConflictingFilePath || err instanceof ConflictingPathSegment || err instanceof ConflictingConfigFiles) {
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "deploy_failed",
              message: err instanceof Error ? err.message : String(err),
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
      }
      handleCreateDeployError(err, localConfig);
      return 1;
    }
    if (err instanceof BuildError) {
      if (now.url) {
        try {
          const failedDeployment = await getDeployment(
            client,
            contextName,
            now.url
          );
          if (asJson) {
            output_manager_default.stopSpinner();
            client.stdout.write(
              `${JSON.stringify(
                getDeploymentOutputJson(failedDeployment, client.apiUrl, {
                  name: "BUILD_ERROR",
                  message: err.message
                }),
                null,
                2
              )}
`
            );
          } else if (withFullLogs === false) {
            await displayBuildLogsUntilFinalError(
              client,
              failedDeployment,
              err.message
            );
          }
        } catch (_) {
          if (asJson) {
            output_manager_default.stopSpinner();
            client.stdout.write(
              `${JSON.stringify(
                {
                  error: {
                    name: "BUILD_ERROR",
                    message: err.message
                  },
                  url: `https://${now.url}`
                },
                null,
                2
              )}
`
            );
          } else {
            output_manager_default.log(
              `To check build logs run: ${getCommandName(
                `inspect ${now.url} --logs`
              )}`
            );
            output_manager_default.log(
              `Or inspect them in your browser at https://${now.url}/_logs`
            );
          }
        }
      }
      return 1;
    }
    if (isAPIError(err) && err.code === "size_limit_exceeded") {
      const { sizeLimit = 0 } = err;
      const message = `File size limit exceeded (${(0, import_bytes.default)(sizeLimit)})`;
      if (client.nonInteractive) {
        client.stdout.write(
          `${JSON.stringify(
            {
              status: AGENT_STATUS.ERROR,
              reason: "size_limit_exceeded",
              message,
              next: [
                {
                  command: getCommandNameWithGlobalFlags("deploy", client.argv),
                  when: "retry deploy"
                }
              ]
            },
            null,
            2
          )}
`
        );
      }
      error(message);
      return 1;
    }
    if (client.nonInteractive) {
      client.stdout.write(
        `${JSON.stringify(
          {
            status: AGENT_STATUS.ERROR,
            reason: "deploy_failed",
            message: err instanceof Error ? err.message : String(err),
            next: [
              {
                command: getCommandNameWithGlobalFlags("deploy", client.argv),
                when: "retry deploy"
              }
            ]
          },
          null,
          2
        )}
`
      );
    }
    printError(err);
    return 1;
  }
  if (asJson) {
    output_manager_default.stopSpinner();
    const deploymentJson = getDeploymentOutputJson(deployment, client.apiUrl);
    const payload = client.nonInteractive ? {
      status: AGENT_STATUS.OK,
      deployment: deploymentJson,
      message: `Deployment ${deployment.url} ready.`,
      next: [
        {
          command: getCommandNameWithGlobalFlags(
            `inspect ${deployment.url}`,
            client.argv
          ),
          when: "Inspect deployment"
        },
        {
          command: getCommandNameWithGlobalFlags(
            "deploy --prod",
            client.argv
          ),
          when: "Promote to production"
        }
      ]
    } : deploymentJson;
    client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
    return 0;
  }
  const { isAgent } = await determineAgent();
  const guidanceMode = parsedArguments.flags["--guidance"] ?? isAgent;
  return printDeploymentStatus(
    client,
    deployment,
    deployStamp,
    noWait,
    guidanceMode
  );
}
function handleCreateDeployError(error, localConfig) {
  if (error instanceof InvalidDomain) {
    output_manager_default.error(`The domain ${error.meta.domain} is not valid`);
    return 1;
  }
  if (error instanceof DomainVerificationFailed) {
    output_manager_default.error(
      `The domain used as a suffix ${import_chalk.default.underline(
        error.meta.domain
      )} is not verified and can't be used as custom suffix.`
    );
    return 1;
  }
  if (error instanceof DomainPermissionDenied) {
    output_manager_default.error(
      `You don't have permissions to access the domain used as a suffix ${import_chalk.default.underline(
        error.meta.domain
      )}.`
    );
    return 1;
  }
  if (error instanceof SchemaValidationFailed) {
    const niceError = getPrettyError(error.meta);
    const fileName = localConfig[import_client3.fileNameSymbol] || "vercel.json";
    niceError.message = `Invalid ${fileName} - ${niceError.message}`;
    output_manager_default.prettyError(niceError);
    return 1;
  }
  if (error instanceof TooManyRequests) {
    output_manager_default.error(
      `Too many requests detected for ${error.meta.api} API. Try again in ${(0, import_ms.default)(
        error.meta.retryAfterMs,
        {
          long: true
        }
      )}.`
    );
    return 1;
  }
  if (error instanceof DomainNotVerified) {
    output_manager_default.error(
      `The domain used as an alias ${import_chalk.default.underline(
        error.meta.domain
      )} is not verified yet. Please verify it.`
    );
    return 1;
  }
  if (error instanceof BuildsRateLimited) {
    output_manager_default.error(error.message);
    const cta = getErrorCta(error.meta);
    output_manager_default.note(
      cta ? `${cta.label}: ${link_default(cta.url)}` : "Upgrade your plan to increase your builds limit."
    );
    return 1;
  }
  if (error instanceof DeploymentNotFound || error instanceof NotDomainOwner || error instanceof DeploymentsRateLimited || error instanceof AliasDomainConfigured || error instanceof MissingBuildScript || error instanceof ConflictingFilePath || error instanceof ConflictingPathSegment || error instanceof ConflictingConfigFiles || error instanceof DeprecatedNowJson) {
    output_manager_default.error(error.message);
    return 1;
  }
  return error;
}
function toDeploymentFramework(framework) {
  return {
    name: framework.name,
    slug: framework.slug
  };
}
function resolveDeploymentFrameworkPreset({
  localFramework,
  projectFramework
}) {
  const frameworkSlug = typeof localFramework === "undefined" ? projectFramework : localFramework;
  const frameworkPreset = import_frameworks.frameworkList.find(
    (framework) => framework.slug === frameworkSlug
  );
  const otherPreset = import_frameworks.frameworkList.find((framework) => framework.slug === null);
  return frameworkPreset ? toDeploymentFramework(frameworkPreset) : otherPreset ? toDeploymentFramework(otherPreset) : { name: "Other", slug: null };
}
function printDeploymentDryRun(client, summary, framework, asJson) {
  const directories = getDirectoryDistribution(summary.files);
  const largestFiles = [...summary.files].sort((a, b) => b.size - a.size || a.path.localeCompare(b.path)).slice(0, 10);
  if (asJson) {
    client.stdout.write(
      `${JSON.stringify(
        {
          framework,
          basePath: summary.basePath,
          fileCount: summary.fileCount,
          totalSize: summary.totalSize,
          ignoredCount: summary.ignoredCount,
          ignored: summary.ignored,
          directories,
          largestFiles,
          files: summary.files
        },
        null,
        2
      )}
`
    );
    return;
  }
  const lines = [
    `${import_chalk.default.bold("Deployment Dry Run")}
`,
    `${import_chalk.default.bold("Detected Framework Preset")}: ${framework.name}${framework.slug ? ` (${framework.slug})` : ""}`,
    `Included: ${summary.fileCount} ${pluralize(
      "file",
      summary.fileCount
    )}, ${formatBytes(summary.totalSize)}`,
    `Ignored: ${summary.ignoredCount} ${pluralize(
      "path",
      summary.ignoredCount
    )}
`
  ];
  if (directories.length > 0) {
    lines.push(
      table(
        [
          ["Path", "Files", "Size"],
          ...directories.map((item) => [
            item.path,
            String(item.fileCount),
            formatBytes(item.size)
          ])
        ],
        { align: ["l", "r", "r"], hsep: 4 }
      ),
      ""
    );
  }
  if (largestFiles.length > 0) {
    lines.push(
      import_chalk.default.bold("Largest Files"),
      table(
        largestFiles.map((file) => [file.path, formatBytes(file.size)]),
        { align: ["l", "r"], hsep: 4 }
      ),
      ""
    );
  }
  output_manager_default.print(`${lines.join("\n")}
`);
}
function getDirectoryDistribution(files) {
  const directories = /* @__PURE__ */ new Map();
  for (const file of files) {
    const [segment] = file.path.split("/");
    const key = file.path.includes("/") ? segment : file.path;
    const current = directories.get(key) ?? {
      path: key,
      fileCount: 0,
      size: 0
    };
    current.fileCount += 1;
    current.size += file.size;
    directories.set(key, current);
  }
  return Array.from(directories.values()).sort(
    (a, b) => b.size - a.size || a.path.localeCompare(b.path)
  );
}
function formatBytes(size) {
  return import_bytes.default.format(size, { decimalPlaces: 1 });
}
function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}
var addProcessEnv = async (log, env) => {
  let val;
  for (const key of Object.keys(env)) {
    if (typeof env[key] !== "undefined") {
      continue;
    }
    val = process.env[key];
    if (typeof val === "string") {
      log(
        `Reading ${import_chalk.default.bold(
          `"${import_chalk.default.bold(key)}"`
        )} from your env (as no value was specified)`
      );
      env[key] = val.replace(/^@/, "\\@");
    } else {
      throw new Error(
        `No value specified for env variable ${import_chalk.default.bold(
          `"${import_chalk.default.bold(key)}"`
        )} and it was not found in your env. If you meant to specify an environment to deploy to, use ${param("--target")}`
      );
    }
  }
};
async function handleContinueDeployment({
  client,
  deploymentId,
  cwd,
  deployStamp,
  noWait,
  org,
  vercelOutputDir,
  archive
}) {
  const { debug, error } = output_manager_default;
  debug(`Continuing deployment: ${deploymentId}`);
  if (!vercelOutputDir) {
    error("Could not determine vercel output directory");
    return 1;
  }
  const token = client.authConfig.token;
  if (!token) {
    error("Missing authentication token");
    return 1;
  }
  output_manager_default.spinner(`Continuing deployment\u2026`, 0);
  try {
    let finalDeployment = null;
    for await (const event of (0, import_client3.continueDeployment)({
      apiUrl: client.apiUrl,
      debug: output_manager_default.isDebugEnabled(),
      deploymentId,
      archive,
      path: cwd,
      teamId: org.type === "team" ? org.id : void 0,
      token,
      vercelOutputDir
    })) {
      debug(`Event: ${event.type}`);
      if (event.type === "hashes-calculated") {
        const hashCount = Object.keys(event.payload).length;
        debug(`Calculated ${hashCount} hashes`);
      }
      if (event.type === "file-count") {
        const { total, missing } = event.payload;
        output_manager_default.spinner(
          `Uploading ${missing.length} of ${total.size} files\u2026`,
          0
        );
      }
      if (event.type === "file-uploaded") {
        debug(`Uploaded: ${event.payload.file.names.join(" ")}`);
      }
      if (event.type === "all-files-uploaded") {
        output_manager_default.spinner("Continuing deployment\u2026", 0);
      }
      if (event.type === "created") {
        finalDeployment = event.payload;
        output_manager_default.stopSpinner();
        if (finalDeployment.inspectorUrl) {
          printAlignedLabel(
            "Inspect",
            import_chalk.default.cyan(finalDeployment.inspectorUrl)
          );
        }
        const isProdDeployment = finalDeployment.target === "production";
        const previewUrl = `https://${finalDeployment.url}`;
        printAlignedLabel(
          isProdDeployment ? "Production" : "Preview",
          import_chalk.default.cyan(previewUrl),
          isProdDeployment && noWait ? { gutter: "\u25B2" } : {}
        );
        if (noWait) {
          return printDeploymentStatus(
            client,
            finalDeployment,
            deployStamp,
            noWait,
            false
          );
        }
        output_manager_default.spinner("Building\u2026", 0);
      }
      if (event.type === "building") {
        output_manager_default.spinner("Building\u2026", 0);
      }
      if (event.type === "ready") {
        finalDeployment = event.payload;
        output_manager_default.stopSpinner();
      }
      if (event.type === "alias-assigned") {
        finalDeployment = event.payload;
        output_manager_default.stopSpinner();
        if (finalDeployment.target === "production" && finalDeployment.alias && finalDeployment.alias.length > 0) {
          const primaryDomain = finalDeployment.alias[0];
          const prodUrl = `https://${primaryDomain}`;
          printAlignedLabel("Aliased", import_chalk.default.cyan(prodUrl), { gutter: "\u25B2" });
        }
      }
      if (event.type === "checks-v2-failed") {
        output_manager_default.stopSpinner();
        return handleFailedCheckRuns(client, event.payload, false);
      }
      if (event.type === "error") {
        output_manager_default.stopSpinner();
        const payload = event.payload;
        error(payload.message || "An error occurred during deployment");
        return 1;
      }
    }
    if (!finalDeployment) {
      error("Deployment failed: no deployment returned");
      return 1;
    }
    return printDeploymentStatus(
      client,
      finalDeployment,
      deployStamp,
      noWait,
      false
    );
  } catch (err) {
    output_manager_default.stopSpinner();
    if ((0, import_error_utils.isError)(err)) {
      debug(`Error: ${err}
${err.stack}`);
      error(err.message);
    } else {
      error("An unexpected error occurred");
    }
    return 1;
  }
}
function getDeploymentOutputJson(deployment, apiUrl, error) {
  return {
    id: deployment.id,
    url: `https://${deployment.url}`,
    inspectorUrl: deployment.inspectorUrl ?? null,
    readyState: deployment.readyState,
    target: deployment.target ?? null,
    deploymentApiUrl: `${apiUrl}/v13/deployments/${deployment.id}`,
    ...error ? { error } : {}
  };
}
function shouldReconcileFinalDeployment(deployment) {
  if (!deployment) {
    return false;
  }
  if (deployment.readyState !== "READY") {
    return true;
  }
  if (deployment.aliasError || !deployment.aliasAssigned) {
    return true;
  }
  if (deployment.checksConclusion === "failed" || deployment.checks?.["deployment-alias"]?.state === "failed") {
    return true;
  }
  return false;
}
async function handleFailedCheckRuns(client, deployment, asJson) {
  const { runs } = await getDeploymentCheckRuns(client, deployment.id);
  const failedRuns = (runs ?? []).filter((run) => run.conclusion === "failed");
  const counters = /* @__PURE__ */ new Map();
  (runs ?? []).forEach((r) => {
    counters.set(r.conclusion, (counters.get(r.conclusion) ?? 0) + 1);
  });
  const counterList = Array.from(counters).map(([name, no]) => `${no} ${name}`).join(", ");
  const message = `Running Checks: ${counterList}`;
  const getCheckRunUrl = (run) => {
    if (run.externalUrl)
      return run.externalUrl;
    if (run.detailsUrl)
      return run.detailsUrl;
    return deployment.inspectorUrl ? `${deployment.inspectorUrl}?checkRunLog=${encodeURIComponent(run.id)}` : null;
  };
  if (asJson) {
    output_manager_default.stopSpinner();
    const deploymentJson = getDeploymentOutputJson(deployment, client.apiUrl, {
      name: "CHECKS_FAILED",
      message
    });
    let payload;
    if (client.nonInteractive) {
      const failedCheckRunsWithLogs = await Promise.all(
        failedRuns.map(async (run) => {
          let logs = [];
          try {
            logs = await getDeploymentCheckRunLogs(
              client,
              deployment.id,
              run.id
            );
          } catch {
          }
          return {
            id: run.id,
            name: run.name,
            conclusion: run.conclusion,
            source: run.source,
            url: getCheckRunUrl(run),
            logs
          };
        })
      );
      payload = {
        status: AGENT_STATUS.ERROR,
        reason: "checks_failed",
        message,
        deployment: deploymentJson,
        failedCheckRuns: failedCheckRunsWithLogs,
        next: [
          {
            command: getCommandNameWithGlobalFlags("deploy", client.argv),
            when: "retry deploy after fixing check failures"
          }
        ]
      };
    } else {
      payload = deploymentJson;
    }
    client.stdout.write(`${JSON.stringify(payload, null, 2)}
`);
  } else {
    output_manager_default.error(message);
    for (const run of failedRuns) {
      const dashboardUrl = getCheckRunUrl(run);
      const label = dashboardUrl ? output_manager_default.link(run.name, dashboardUrl) : run.name;
      output_manager_default.print(`  ${import_chalk.default.red("\u2717")} ${label}
`);
    }
  }
  return 1;
}
export {
  deploy_default as default
};
