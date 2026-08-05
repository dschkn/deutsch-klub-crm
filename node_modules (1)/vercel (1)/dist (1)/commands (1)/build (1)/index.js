import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  OUTPUT_DIR,
  getStaticServiceSchedules,
  importBuilders,
  isLambda,
  staticFiles,
  writeBuildResult
} from "../../chunks/chunk-2XTV2FM7.js";
import {
  pullCommandLogic
} from "../../chunks/chunk-A5QK4X3Z.js";
import {
  require_semver
} from "../../chunks/chunk-IB5L4LKZ.js";
import {
  pickOverrides,
  readProjectSettings
} from "../../chunks/chunk-6CRRXESK.js";
import "../../chunks/chunk-24FCBXI4.js";
import "../../chunks/chunk-NJUPUGOE.js";
import {
  stamp_default
} from "../../chunks/chunk-64IF634X.js";
import "../../chunks/chunk-VXYGCOKL.js";
import {
  ensureLink
} from "../../chunks/chunk-EJV2KFOF.js";
import {
  printProjectNotFoundError
} from "../../chunks/chunk-OKWMOW2F.js";
import {
  AGENT_REASON,
  AGENT_STATUS
} from "../../chunks/chunk-QH7WYDEP.js";
import "../../chunks/chunk-AA3E7OLF.js";
import {
  buildCommand
} from "../../chunks/chunk-IIUE7CDZ.js";
import "../../chunks/chunk-OCEM4YAQ.js";
import {
  help
} from "../../chunks/chunk-QY63UKTP.js";
import "../../chunks/chunk-QEEGXNFK.js";
import {
  DEFAULT_VERCEL_CONFIG_FILENAME,
  VERCEL_DIR,
  compileVercelConfig,
  findSourceVercelConfigFile,
  getLinkedProject,
  getProjectLink,
  parseTarget,
  pullEnvRecords,
  readJSONFile,
  require_ajv,
  require_dist,
  require_dist2,
  require_dist3,
  require_frameworks,
  require_lib,
  require_main,
  require_minimatch,
  resolveProjectCwd,
  ua_default,
  validateConfig
} from "../../chunks/chunk-XHC5YRFY.js";
import {
  outputAgentError
} from "../../chunks/chunk-2QBF3ZL3.js";
import {
  TelemetryClient
} from "../../chunks/chunk-ECCWJHC6.js";
import {
  getFlagsSpecification,
  getGlobalFlagsOnlyFromArgs,
  parseArguments,
  printError,
  toEnumerableError
} from "../../chunks/chunk-EHTPDXTS.js";
import {
  CantParseJSONFile,
  cmd,
  getCommandName,
  getCommandNamePlain,
  packageName,
  require_lib as require_lib2
} from "../../chunks/chunk-P6AK7SVK.js";
import {
  pkg_default
} from "../../chunks/chunk-P4QNYOFB.js";
import "../../chunks/chunk-2RVK3DDN.js";
import {
  emoji,
  output_manager_default,
  prependEmoji
} from "../../chunks/chunk-OX7KI3LF.js";
import "../../chunks/chunk-GGP5R3FU.js";
import {
  require_source
} from "../../chunks/chunk-S7KYDPEM.js";
import {
  __toESM
} from "../../chunks/chunk-TZ2YI2VH.js";

// src/commands/build/index.ts
var import_chalk = __toESM(require_source(), 1);
var import_dotenv = __toESM(require_main(), 1);
var import_fs_extra3 = __toESM(require_lib(), 1);
var import_minimatch2 = __toESM(require_minimatch(), 1);
var import_semver = __toESM(require_semver(), 1);
var import_client = __toESM(require_dist(), 1);
var import_frameworks3 = __toESM(require_frameworks(), 1);
var import_fs_detectors3 = __toESM(require_dist3(), 1);
var import_routing_utils2 = __toESM(require_dist2(), 1);
import { dirname as dirname2, join as join5, normalize, relative as relative3, resolve, sep } from "path";
import { readdirSync, statSync } from "fs";
import {
  download,
  FileFsRef,
  getDiscontinuedNodeVersions,
  getInstalledPackageVersion,
  getServiceUrlEnvVars,
  getExperimentalServiceUrlEnvVars,
  normalizePath,
  NowBuildError as NowBuildError2,
  runNpmInstall,
  runCustomInstallCommand,
  resetCustomInstallCommandSet,
  Span,
  validateNpmrc,
  glob,
  isExperimentalService as isExperimentalService2,
  isExperimentalServiceV2,
  getInternalServiceCronPath,
  getInternalServiceFunctionPath,
  getServiceQueueTopicConfigs,
  isBackendBuilder,
  isQueueBackedService,
  isScheduleTriggeredService,
  sanitizeConsumerName
} from "@vercel/build-utils";

// src/util/build/corepack.ts
var import_fs_extra = __toESM(require_lib(), 1);
import { delimiter, join } from "path";
import { spawnAsync } from "@vercel/build-utils";
async function initCorepack({
  repoRootPath
}) {
  if (process.env.ENABLE_EXPERIMENTAL_COREPACK !== "1") {
    return null;
  }
  const pkg = await readJSONFile(
    join(repoRootPath, "package.json")
  );
  if (pkg instanceof CantParseJSONFile) {
    output_manager_default.warn(
      "Warning: Could not enable corepack because package.json is invalid JSON",
      pkg.meta.parseErrorLocation
    );
  } else if (!pkg?.packageManager) {
    output_manager_default.warn(
      'Warning: Could not enable corepack because package.json is missing "packageManager" property'
    );
  } else {
    output_manager_default.log(
      `Detected ENABLE_EXPERIMENTAL_COREPACK=1 and "${pkg.packageManager}" in package.json`
    );
    const corepackRootDir = join(repoRootPath, VERCEL_DIR, "cache", "corepack");
    const corepackHomeDir = join(corepackRootDir, "home");
    const corepackShimDir = join(corepackRootDir, "shim");
    await import_fs_extra.default.mkdirp(corepackHomeDir);
    await import_fs_extra.default.mkdirp(corepackShimDir);
    process.env.COREPACK_HOME = corepackHomeDir;
    process.env.PATH = `${corepackShimDir}${delimiter}${process.env.PATH}`;
    const pkgManagerName = pkg.packageManager.split("@")[0];
    await spawnAsync(
      "corepack",
      ["enable", pkgManagerName, "--install-directory", corepackShimDir],
      {
        prettyCommand: `corepack enable ${pkgManagerName}`
      }
    );
    return corepackShimDir;
  }
  return null;
}
function cleanupCorepack(corepackShimDir) {
  if (process.env.COREPACK_HOME) {
    delete process.env.COREPACK_HOME;
  }
  if (process.env.PATH) {
    process.env.PATH = process.env.PATH.replace(
      `${corepackShimDir}${delimiter}`,
      ""
    );
  }
}

// src/util/build/monorepo.ts
var import_fs_detectors = __toESM(require_dist3(), 1);
var import_title = __toESM(require_lib2(), 1);
import { relative, basename } from "path";
import { debug } from "@vercel/build-utils";
async function setMonorepoDefaultSettings(cwd, workPath, projectSettings) {
  const localFileSystem = new import_fs_detectors.LocalFileSystemDetector(cwd);
  const projectName = basename(workPath);
  const relativeToRoot = relative(workPath, cwd);
  const setCommand = (command, value) => {
    if (projectSettings[command]) {
      debug(
        `Skipping auto-assignment of ${command} as it is already set via project settings or configuration overrides.`
      );
    } else {
      projectSettings[command] = value;
    }
  };
  try {
    const result = await (0, import_fs_detectors.getMonorepoDefaultSettings)(
      projectName,
      relative(cwd, workPath),
      relativeToRoot,
      localFileSystem
    );
    if (result === null) {
      return;
    }
    projectSettings.monorepoManager = result.monorepoManager;
    const { monorepoManager, ...commands } = result;
    output_manager_default.log(
      `Detected ${(0, import_title.default)(monorepoManager)}. Adjusting default settings...`
    );
    if (commands.buildCommand) {
      setCommand("buildCommand", commands.buildCommand);
    }
    if (commands.installCommand) {
      setCommand("installCommand", commands.installCommand);
    }
    if (commands.commandForIgnoringBuildStep) {
      setCommand(
        "commandForIgnoringBuildStep",
        commands.commandForIgnoringBuildStep
      );
    }
  } catch (error) {
    if (error instanceof import_fs_detectors.MissingBuildPipeline || error instanceof import_fs_detectors.MissingBuildTarget) {
      output_manager_default.warn(`${error.message} Skipping automatic setting assignment.`);
      return;
    }
    throw error;
  }
}

// src/util/build/framework-detection.ts
var import_fs_detectors2 = __toESM(require_dist3(), 1);
var import_frameworks = __toESM(require_frameworks(), 1);
import { debug as builderDebug } from "@vercel/build-utils";
function logDebug(message) {
  output_manager_default.debug(message);
  builderDebug(message);
}
function isFrameworkDetectionEnabled() {
  const raw = process.env.VERCEL_FRAMEWORK_DETECTION;
  const enabled = raw === "1";
  logDebug(
    `Framework detection: VERCEL_FRAMEWORK_DETECTION=${raw === void 0 ? "<unset>" : JSON.stringify(raw)} -> ${enabled ? "enabled" : "disabled"}`
  );
  return enabled;
}
function isFirstDeployment() {
  const raw = process.env.VERCEL_FIRST_DEPLOYMENT;
  const result = raw === "1";
  logDebug(
    `isFirstDeployment: VERCEL_FIRST_DEPLOYMENT=${raw === void 0 ? "<unset>" : JSON.stringify(raw)} -> ${result}`
  );
  return result;
}
async function detectFirstDeploymentFramework(options) {
  const { workPath, projectSettings } = options;
  if (!isFrameworkDetectionEnabled()) {
    return { status: "skipped" };
  }
  logDebug(
    `First deployment: evaluating framework detection (workPath="${workPath}", configuredFramework=${projectSettings.framework ? `"${projectSettings.framework}"` : "<none>"})`
  );
  if (!isFirstDeployment()) {
    logDebug(
      "First deployment: skipping framework detection because this is not a first deployment"
    );
    return { status: "skipped" };
  }
  if (projectSettings.framework) {
    logDebug(
      `First deployment: skipping framework detection because a framework is already configured ("${projectSettings.framework}")`
    );
    return { status: "skipped" };
  }
  logDebug(
    `First deployment: no framework configured; detecting from source at "${workPath}"`
  );
  const detected = await (0, import_fs_detectors2.detectFrameworkRecord)({
    fs: new import_fs_detectors2.LocalFileSystemDetector(workPath),
    frameworkList: import_frameworks.frameworkList
  });
  if (!detected || !detected.slug) {
    logDebug("First deployment: no framework detected from source code");
    return { status: "not-detected" };
  }
  const { slug } = detected;
  projectSettings.framework = slug;
  logDebug(
    `First deployment: detected framework "${slug}"${detected.detectedVersion ? ` (version ${detected.detectedVersion})` : ""}; applied to project settings for this build`
  );
  return {
    status: "detected",
    slug,
    ...detected.detectedVersion && { version: detected.detectedVersion }
  };
}
async function detectAllFrameworks(workPath) {
  logDebug(`Framework cross-check: detecting frameworks at "${workPath}"`);
  const frameworks = await (0, import_fs_detectors2.detectFrameworks)({
    fs: new import_fs_detectors2.LocalFileSystemDetector(workPath),
    frameworkList: import_frameworks.frameworkList
  });
  const slugs = frameworks.map((f) => f.slug).filter((slug) => Boolean(slug));
  logDebug(`Framework cross-check: detected [${slugs.join(", ") || "<none>"}]`);
  return slugs;
}
function isHighConfidenceDetection(slug) {
  const record = import_frameworks.frameworkList.find((f) => f.slug === slug);
  return record?.detectionConfidence !== "weak";
}
function warnIfFrameworkMismatch(options) {
  const {
    configuredFramework,
    detectedFrameworks,
    usedBuilders = [],
    usedFrameworks = []
  } = options;
  if (detectedFrameworks.length === 0) {
    logDebug(
      "Framework cross-check: nothing detected from source; skipping validation"
    );
    return "none-detected";
  }
  const confidentFrameworks = detectedFrameworks.filter(
    isHighConfidenceDetection
  );
  if (configuredFramework) {
    if (detectedFrameworks.includes(configuredFramework)) {
      logDebug(
        `Framework cross-check: configured framework "${configuredFramework}" matches detected frameworks; no mismatch`
      );
      return "match";
    }
    if (confidentFrameworks.length === 0) {
      logDebug(
        `Framework cross-check: configured framework "${configuredFramework}" not among detected [${detectedFrameworks.join(
          ", "
        )}], but all detections are low-confidence; skipping warning`
      );
      return "low-confidence";
    }
    logDebug(
      `Framework cross-check: configured framework "${configuredFramework}" not among detected [${confidentFrameworks.join(
        ", "
      )}]; warning`
    );
    output_manager_default.warn(
      `Your project is configured to use the "${configuredFramework}" framework, but the source code looks like it's for: ${confidentFrameworks.join(
        ", "
      )}. This may be a misconfiguration.`,
      null,
      "https://vercel.com/docs/project-configuration",
      "Learn More"
    );
    return "configured-mismatch";
  }
  const buildUsedDetectedFramework = detectedFrameworks.some((slug) => {
    if (usedFrameworks.includes(slug)) {
      return true;
    }
    const record = import_frameworks.frameworkList.find((f) => f.slug === slug);
    const expectedBuilder = record?.useRuntime?.use;
    if (!expectedBuilder) {
      return false;
    }
    return usedBuilders.some(
      (use) => use === expectedBuilder || use.startsWith(`${expectedBuilder}@`)
    );
  });
  if (buildUsedDetectedFramework) {
    logDebug(
      `Framework cross-check: no framework configured, but the build used one of the detected frameworks [${detectedFrameworks.join(
        ", "
      )}]; no mismatch`
    );
    return "match";
  }
  const warnableFrameworks = confidentFrameworks.filter((slug) => {
    const record = import_frameworks.frameworkList.find((f) => f.slug === slug);
    return Boolean(record?.useRuntime?.use);
  });
  if (warnableFrameworks.length === 0) {
    logDebug(
      `Framework cross-check: no framework configured and detections [${detectedFrameworks.join(
        ", "
      )}] are low-confidence or have no dedicated runtime builder; skipping warning`
    );
    return "low-confidence";
  }
  logDebug(
    `Framework cross-check: no framework configured and the build did not use any of the detected frameworks [${warnableFrameworks.join(
      ", "
    )}] (used builders: [${usedBuilders.join(", ") || "<none>"}]); warning`
  );
  output_manager_default.warn(
    `The source code looks like it's for: ${warnableFrameworks.join(
      ", "
    )}, but no framework is configured for this project and the build did not use ${warnableFrameworks.length === 1 ? "its builder" : "their builders"}. Set the framework in your Project Settings if this is unexpected.`,
    null,
    "https://vercel.com/docs/project-configuration",
    "Learn More"
  );
  return "unused-mismatch";
}

// src/util/build/validate-build-output.ts
var import_fs_extra2 = __toESM(require_lib(), 1);
import { join as join2 } from "path";
import { debug as builderDebug2 } from "@vercel/build-utils";
function logDebug2(message) {
  output_manager_default.debug(message);
  builderDebug2(message);
}
async function validateBuildOutput(outputDir) {
  const problems = [];
  logDebug2(`Validating build output at "${outputDir}"`);
  try {
    const configPath = join2(outputDir, "config.json");
    const configExists = await import_fs_extra2.default.pathExists(configPath);
    if (!configExists) {
      problems.push({
        severity: "error",
        message: "Build output is missing config.json."
      });
    } else {
      let config;
      try {
        config = await import_fs_extra2.default.readJSON(configPath);
      } catch (err) {
        problems.push({
          severity: "error",
          message: `Build output config.json is not valid JSON: ${err instanceof Error ? err.message : String(err)}.`
        });
      }
      if (config && config.version !== 3) {
        problems.push({
          severity: "warning",
          message: `Build output config.json has unexpected version "${config.version}" (expected 3).`
        });
      }
    }
    const [hasFunctions, hasStatic] = await Promise.all([
      import_fs_extra2.default.pathExists(join2(outputDir, "functions")),
      import_fs_extra2.default.pathExists(join2(outputDir, "static"))
    ]);
    if (!hasFunctions && !hasStatic) {
      problems.push({
        severity: "warning",
        message: 'Build output contains no "functions" or "static" directory; the build may not have produced any deployable output.'
      });
    }
    logDebug2(
      `Build output validation found ${problems.length} problem(s)` + (problems.length ? `: ${problems.map((p) => `${p.severity}: ${p.message}`).join("; ")}` : "")
    );
    return problems;
  } catch (err) {
    return [
      {
        severity: "error",
        message: `Unexpected error while validating build output: ${err instanceof Error ? err.message : String(err)}.`
      }
    ];
  }
}
function reportBuildOutputProblems(problems) {
  for (const problem of problems) {
    if (problem.severity === "error") {
      output_manager_default.error(problem.message);
    } else {
      output_manager_default.warn(problem.message);
    }
  }
}

// src/util/build/scrub-argv.ts
function scrubArgv(argv) {
  const clonedArgv = [...argv];
  const tokenRE = /^(-[A-Za-z]*[bet]|--(?:build-env|env|token))(=.*)?$/;
  for (let i = 0, len = clonedArgv.length; i < len; i++) {
    const m = clonedArgv[i].match(tokenRE);
    if (m?.[2]) {
      clonedArgv[i] = `${m[1]}=REDACTED`;
    } else if (m && i + 1 < len) {
      clonedArgv[++i] = "REDACTED";
    }
  }
  return clonedArgv;
}

// src/util/build/service-route-ownership.ts
var import_routing_utils = __toESM(require_dist2(), 1);
function isWebServiceWithPrefix(service) {
  return service.type === "web" && typeof service.routePrefix === "string";
}
function getWebRoutePrefixes(services) {
  const unique = /* @__PURE__ */ new Set();
  for (const service of services) {
    if (!isWebServiceWithPrefix(service))
      continue;
    unique.add((0, import_routing_utils.normalizeRoutePrefix)(service.routePrefix));
  }
  return Array.from(unique);
}
function scopeRoutesToServiceOwnership({
  routes,
  owner,
  allServices
}) {
  if (!isWebServiceWithPrefix(owner)) {
    return routes;
  }
  const allWebPrefixes = getWebRoutePrefixes(allServices);
  const ownershipGuard = (0, import_routing_utils.getOwnershipGuard)(owner.routePrefix, allWebPrefixes);
  if (!ownershipGuard) {
    return routes;
  }
  return routes.map((route) => {
    if ("handle" in route || typeof route.src !== "string") {
      return route;
    }
    return {
      ...route,
      src: (0, import_routing_utils.scopeRouteSourceToOwnership)(route.src, ownershipGuard)
    };
  });
}

// src/util/build/sort-builders.ts
var import_frameworks2 = __toESM(require_frameworks(), 1);
function sortBuilders(builds) {
  const frontendRuntimeSet = new Set(
    import_frameworks2.frameworkList.map((f) => f.useRuntime?.use || "@vercel/static-build")
  );
  frontendRuntimeSet.delete("@vercel/python");
  frontendRuntimeSet.delete("@vercel/ruby");
  frontendRuntimeSet.delete("@vercel/rust");
  const toNumber = (build) => build.use === "@vercel/python" || build.use === "@vercel/ruby" || build.use === "@vercel/rust" ? 1 : frontendRuntimeSet.has(build.use) ? 0 : 2;
  return builds.sort((build1, build2) => {
    return toNumber(build1) - toNumber(build2);
  });
}

// src/util/telemetry/commands/build/index.ts
var BuildTelemetryClient = class extends TelemetryClient {
  trackCliOptionOutput(path) {
    if (path) {
      this.trackCliOption({
        option: "output",
        value: this.redactedValue
      });
    }
  }
  trackCliOptionTarget(option) {
    if (option) {
      this.trackCliOption({
        option: "target",
        value: this.redactedTargetName(option)
      });
    }
  }
  trackCliFlagProd(flag) {
    if (flag) {
      this.trackCliFlag("prod");
    }
  }
  trackCliFlagYes(flag) {
    if (flag) {
      this.trackCliFlag("yes");
    }
  }
  trackCliFlagStandalone(flag) {
    if (flag) {
      this.trackCliFlag("standalone");
    }
  }
  trackCliOptionId(id) {
    if (id) {
      this.trackCliOption({
        option: "id",
        value: this.redactedValue
      });
    }
  }
};

// src/util/validate-cron-secret.ts
import { NowBuildError } from "@vercel/build-utils";
function validateCronSecret(cronSecret) {
  if (!cronSecret) {
    return null;
  }
  if (cronSecret !== cronSecret.trim()) {
    return new NowBuildError({
      code: "INVALID_CRON_SECRET",
      message: "The `CRON_SECRET` environment variable contains leading or trailing whitespace, which is not allowed in HTTP header values.",
      link: "https://vercel.link/securing-cron-jobs",
      action: "Learn More"
    });
  }
  const invalidChars = [];
  for (let i = 0; i < cronSecret.length; i++) {
    const code = cronSecret.charCodeAt(i);
    const isValidChar = code === 9 || // HTAB
    code >= 32 && code <= 126;
    if (!isValidChar) {
      invalidChars.push({
        char: cronSecret[i],
        index: i,
        code
      });
    }
  }
  if (invalidChars.length > 0) {
    const descriptions = invalidChars.slice(0, 3).map(({ code, index }) => {
      if (code < 32) {
        return `control character (0x${code.toString(16).padStart(2, "0")}) at position ${index}`;
      } else if (code === 127) {
        return `DEL character at position ${index}`;
      } else {
        return `non-ASCII character (0x${code.toString(16).padStart(2, "0")}) at position ${index}`;
      }
    });
    const moreCount = invalidChars.length - 3;
    const moreText = moreCount > 0 ? `, and ${moreCount} more` : "";
    return new NowBuildError({
      code: "INVALID_CRON_SECRET",
      message: `The \`CRON_SECRET\` environment variable contains characters that are not valid in HTTP headers: ${descriptions.join(", ")}${moreText}. Only visible ASCII characters (letters, digits, symbols), spaces, and tabs are allowed.`,
      link: "https://vercel.link/securing-cron-jobs",
      action: "Learn More"
    });
  }
  return null;
}

// src/util/validate-package-manifest.ts
var import_ajv = __toESM(require_ajv(), 1);
import { packageManifestSchema } from "@vercel/build-utils";
var ajv = new import_ajv.default();
var validate = ajv.compile(packageManifestSchema);
function validatePackageManifest(data) {
  if (validate(data)) {
    return null;
  }
  const errors = validate.errors ?? [];
  return errors.map((e) => `${e.dataPath || "(root)"} ${e.message}`).join("; ");
}

// src/util/flags/build-embedding.ts
import { isPackageInstalled } from "@vercel/build-utils";
function isFlagsEmbedOption(input) {
  return input === "force-on" || input === "force-off";
}
var SDK_KEY_REGEX = /^vf_(?:server|client)_/;
function envHasSdkKey() {
  for (const value of Object.values(process.env)) {
    if (typeof value === "string" && SDK_KEY_REGEX.test(value)) {
      return true;
    }
  }
}
async function shouldEmbedFlagsDefinitions(cwd) {
  if (process.env.VERCEL_FLAGS_DISABLE_DEFINITION_EMBEDDING === "1") {
    return false;
  }
  if (isFlagsEmbedOption(process.env.VERCEL_FLAGS_EMBED_DEFINITIONS)) {
    return process.env.VERCEL_FLAGS_EMBED_DEFINITIONS === "force-on";
  }
  if (envHasSdkKey()) {
    return true;
  }
  const hasVercelFlags = await isPackageInstalled("@flags-sdk/vercel", cwd);
  const hasFlagsCore = await isPackageInstalled("@vercel/flags-core", cwd);
  if (hasVercelFlags || hasFlagsCore) {
    return true;
  }
  return false;
}

// src/util/build/repo-root.ts
import { existsSync, readFileSync } from "fs";
import { dirname, join as join3, parse, relative as relative2 } from "path";

// ../../node_modules/.pnpm/js-yaml@4.1.0/node_modules/js-yaml/dist/js-yaml.mjs
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence))
    return sequence;
  else if (isNothing(sequence))
    return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }
  return result;
}
function isNegativeZero(number) {
  return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
}
var isNothing_1 = isNothing;
var isObject_1 = isObject;
var toArray_1 = toArray;
var repeat_1 = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1 = extend;
var common = {
  isNothing: isNothing_1,
  isObject: isObject_1,
  toArray: toArray_1,
  repeat: repeat_1,
  isNegativeZero: isNegativeZero_1,
  extend: extend_1
};
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark)
    return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$1(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;
YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$1;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
    // relative position
  };
}
function padStart(string, max) {
  return common.repeat(" ", max - string.length) + string;
}
function makeSnippet(mark, options) {
  options = Object.create(options || null);
  if (!mark.buffer)
    return null;
  if (!options.maxLength)
    options.maxLength = 79;
  if (typeof options.indent !== "number")
    options.indent = 1;
  if (typeof options.linesBefore !== "number")
    options.linesBefore = 3;
  if (typeof options.linesAfter !== "number")
    options.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0)
    foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0)
      break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length)
      break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$1(tag, options) {
  options = options || {};
  Object.keys(options).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options;
  this.tag = tag;
  this.kind = options["kind"] || null;
  this.resolve = options["resolve"] || function() {
    return true;
  };
  this.construct = options["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options["instanceOf"] || null;
  this.predicate = options["predicate"] || null;
  this.represent = options["represent"] || null;
  this.representName = options["representName"] || null;
  this.defaultStyle = options["defaultStyle"] || null;
  this.multi = options["multi"] || false;
  this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$1;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof type) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit)
      implicit = implicit.concat(definition.implicit);
    if (definition.explicit)
      explicit = explicit.concat(definition.explicit);
  } else {
    throw new exception("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type$1.loadKind && type$1.loadKind !== "scalar") {
      throw new exception("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type$1.multi) {
      throw new exception("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var str = new type("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var seq = new type("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var map = new type("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});
function resolveYamlNull(data) {
  if (data === null)
    return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new type("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
function resolveYamlBoolean(data) {
  if (data === null)
    return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool = new type("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null)
    return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max)
    return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max)
      return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (ch !== "0" && ch !== "1")
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isHexCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_")
    return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_")
      continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_")
    return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-")
      sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0")
    return 0;
  if (ch === "0") {
    if (value[1] === "b")
      return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x")
      return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o")
      return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
}
var int = new type("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null)
    return false;
  if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
}
var float = new type("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});
var core = json;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null)
    return false;
  if (YAML_DATE_REGEXP.exec(data) !== null)
    return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
    return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null)
    match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null)
    throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-")
      delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta)
    date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new type("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new type("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null)
    return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64)
      continue;
    if (code < 0)
      return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new type("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null)
    return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]")
      return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey)
          pairHasKey = true;
        else
          return false;
      }
    }
    if (!pairHasKey)
      return false;
    if (objectKeys.indexOf(pairKey) === -1)
      objectKeys.push(pairKey);
    else
      return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new type("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null)
    return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]")
      return false;
    keys = Object.keys(pair);
    if (keys.length !== 1)
      return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null)
    return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new type("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null)
    return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null)
        return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
var i;
function State$1(input, options) {
  this.input = input;
  this.filename = options["filename"] || null;
  this.schema = options["schema"] || _default;
  this.onWarning = options["onWarning"] || null;
  this.legacy = options["legacy"] || false;
  this.json = options["json"] || false;
  this.listener = options["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    // omit trailing \0
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = snippet(mark);
  return new exception(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    if (keyNode === "__proto__") {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common.repeat("\n", emptyLines);
      }
    } else {
      state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33)
    return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38)
    return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42)
    return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch))
        break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0)
      readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options) {
  input = String(input);
  options = options || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
    options = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load$1(input, options) {
  var documents = loadDocuments(input, options);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception("expected a single document in the stream, but found more");
}
var loadAll_1 = loadAll$1;
var load_1 = load$1;
var loader = {
  loadAll: loadAll_1,
  load: load_1
};
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null)
    return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string, handle, length;
  string = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new exception("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string.length) + string;
}
var QUOTING_TYPE_SINGLE = 1;
var QUOTING_TYPE_DOUBLE = 2;
function State(options) {
  this.schema = options["schema"] || _default;
  this.indent = Math.max(1, options["indent"] || 2);
  this.noArrayIndent = options["noArrayIndent"] || false;
  this.skipInvalid = options["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
  this.sortKeys = options["sortKeys"] || false;
  this.lineWidth = options["lineWidth"] || 80;
  this.noRefs = options["noRefs"] || false;
  this.noCompatMode = options["noCompatMode"] || false;
  this.condenseFlow = options["condenseFlow"] || false;
  this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options["forceQuotes"] || false;
  this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
  while (position < length) {
    next = string.indexOf("\n", position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n")
      result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    (inblock ? (
      // c = flow-in
      cIsNsCharOrWhitespace
    ) : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar
  );
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}
var STYLE_PLAIN = 1;
var STYLE_SINGLE = 2;
var STYLE_LITERAL = 3;
var STYLE_FOLDED = 4;
var STYLE_DOUBLE = 5;
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
          i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = function() {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string2) {
      return testImplicitResolving(state, string2);
    }
    switch (chooseScalarStyle(
      string,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
  var clip = string[string.length - 1] === "\n";
  var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string) {
  return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
function foldString(string, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string[0] === "\n" || string[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ")
    return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 65536)
        result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "")
        _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "")
      pairBuffer += ", ";
    if (state.condenseFlow)
      pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024)
      pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new exception("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new exception("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid)
        return false;
      throw new exception("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump$1(input, options) {
  options = options || {};
  var state = new State(options);
  if (!state.noRefs)
    getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true))
    return state.dump + "\n";
  return "";
}
var dump_1 = dump$1;
var dumper = {
  dump: dump_1
};
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
var Type = type;
var Schema = schema;
var FAILSAFE_SCHEMA = failsafe;
var JSON_SCHEMA = json;
var CORE_SCHEMA = core;
var DEFAULT_SCHEMA = _default;
var load = loader.load;
var loadAll = loader.loadAll;
var dump = dumper.dump;
var YAMLException = exception;
var types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
};
var safeLoad = renamed("safeLoad", "load");
var safeLoadAll = renamed("safeLoadAll", "loadAll");
var safeDump = renamed("safeDump", "dump");
var jsYaml = {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
  safeLoad,
  safeLoadAll,
  safeDump
};
var js_yaml_default = jsYaml;

// src/util/build/repo-root.ts
var import_minimatch = __toESM(require_minimatch(), 1);
function findWorkspaceRootCandidates(startDir) {
  const { root } = parse(startDir);
  const candidates = [];
  let dir = startDir;
  for (let i = 0; i < 64; i++) {
    const type2 = workspaceTypeOf(dir);
    if (type2) {
      candidates.unshift({ dir, type: type2 });
    }
    if (dir === root)
      break;
    const parent = dirname(dir);
    if (parent === dir)
      break;
    dir = parent;
  }
  return candidates;
}
function workspaceTypeOf(dir) {
  if (existsSync(join3(dir, "pnpm-workspace.yaml"))) {
    return "pnpm";
  }
  const pkgPath = join3(dir, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const { workspaces } = pkg;
      if (Array.isArray(workspaces) && workspaces.length > 0 || workspaces && typeof workspaces === "object" && Array.isArray(workspaces.packages) && workspaces.packages.length > 0) {
        return "npm";
      }
    } catch {
    }
  }
  return null;
}
function readWorkspacePatterns(candidate) {
  try {
    if (candidate.type === "pnpm") {
      const doc = js_yaml_default.load(
        readFileSync(join3(candidate.dir, "pnpm-workspace.yaml"), "utf8")
      );
      const packages2 = doc?.packages;
      return Array.isArray(packages2) ? packages2.filter((p) => typeof p === "string") : null;
    }
    const pkg = JSON.parse(
      readFileSync(join3(candidate.dir, "package.json"), "utf8")
    );
    const { workspaces } = pkg;
    const packages = Array.isArray(workspaces) ? workspaces : workspaces?.packages;
    return Array.isArray(packages) ? packages.filter((p) => typeof p === "string") : null;
  } catch {
    return null;
  }
}
function workspaceClaims(candidate, memberDir) {
  const rel = normalizeRelative(relative2(candidate.dir, memberDir));
  if (rel === "") {
    return false;
  }
  const patterns = readWorkspacePatterns(candidate);
  if (!patterns || patterns.length === 0) {
    return false;
  }
  const positives = [];
  const negatives = [];
  for (const pattern of patterns) {
    if (pattern.startsWith("!")) {
      negatives.push(normalizeRelative(pattern.slice(1)));
    } else {
      positives.push(normalizeRelative(pattern));
    }
  }
  const matches = (pattern) => (0, import_minimatch.default)(rel, pattern, { dot: false });
  if (!positives.some(matches) || negatives.some(matches)) {
    return false;
  }
  return existsSync(join3(memberDir, "package.json"));
}
function resolvePerDirectoryLinkRoot(anchorDir, rootDirectorySetting) {
  let repoRoot = anchorDir;
  for (const candidate of findWorkspaceRootCandidates(anchorDir)) {
    if (workspaceClaims(candidate, anchorDir)) {
      repoRoot = candidate.dir;
      break;
    }
  }
  const linkLocation = normalizeRelative(relative2(repoRoot, anchorDir));
  if (linkLocation === "") {
    return { repoRoot, resolvedRootDirectory: "" };
  }
  const setting = normalizeRelative(rootDirectorySetting ?? "");
  if (setting === "") {
    return { repoRoot, resolvedRootDirectory: linkLocation };
  }
  if (existsSync(join3(anchorDir, setting))) {
    return {
      repoRoot,
      resolvedRootDirectory: normalizeRelative(
        relative2(repoRoot, join3(anchorDir, setting))
      )
    };
  }
  return {
    repoRoot,
    resolvedRootDirectory: linkLocation,
    advisory: `Ignoring "rootDirectory" setting "${setting}" for the project linked in "${anchorDir}": "${join3(anchorDir, setting)}" does not exist, so the build will use the linked directory "${linkLocation}" instead. Remove the "rootDirectory" setting, or configure it at the repository root.`
  };
}
function normalizeRelative(p) {
  const normalized = p.replace(/\\/g, "/").replace(/^\.\//, "").replace(/^\/+/, "").replace(/\/+$/, "");
  return normalized === "." ? "" : normalized;
}

// src/commands/build/manifest.ts
import { join as join4 } from "path";
import {
  FileBlob,
  downloadFile,
  isExperimentalService
} from "@vercel/build-utils";
async function writeManifests(packageManifests, diagnostics, ops, outputDir) {
  if (packageManifests.length === 0)
    return;
  const projectManifest = {};
  const deployManifestBuilds = {};
  for (const {
    workspace,
    buildConfig,
    manifest,
    service,
    builderUse
  } of packageManifests) {
    const key = `${builderUse}:${workspace}`;
    projectManifest[key] = {
      ...manifest,
      workspace,
      builder: builderUse,
      framework: service?.framework ?? buildConfig.framework,
      serviceName: service?.name,
      serviceType: service && isExperimentalService(service) ? service.type : void 0,
      routePrefix: service && isExperimentalService(service) ? service.routePrefix : void 0
    };
    deployManifestBuilds[key] = {
      ...manifest,
      root: workspace,
      builder: builderUse
    };
  }
  if (Object.keys(projectManifest).length === 0)
    return;
  const projectManifestBlob = new FileBlob({
    data: JSON.stringify(projectManifest)
  });
  diagnostics["project-manifest.json"] = projectManifestBlob;
  ops.push(
    downloadFile(
      projectManifestBlob,
      join4(outputDir, "diagnostics", "project-manifest.json")
    ).then(
      () => void 0,
      (err) => err
    )
  );
  const deployManifestBlob = new FileBlob({
    data: JSON.stringify({
      manifestVersion: "2.0",
      builds: deployManifestBuilds
    })
  });
  diagnostics["deploy-manifest.json"] = deployManifestBlob;
  ops.push(
    downloadFile(
      deployManifestBlob,
      join4(outputDir, "diagnostics", "deploy-manifest.json")
    ).then(
      () => void 0,
      (err) => err
    )
  );
}

// src/commands/build/index.ts
function buildCommandWithGlobalFlags(baseSubcommand, argv) {
  const globalFlags = getGlobalFlagsOnlyFromArgs(argv.slice(2));
  const full = globalFlags.length ? `${baseSubcommand} ${globalFlags.join(" ")}` : baseSubcommand;
  return getCommandNamePlain(full);
}
var SERVICE_BUILD_IMMUTABLE_ENV_VARS = [
  "VERCEL_IMMUTABLE_STATIC_FILES_ENABLED"
];
function hasNonEmptyObject(value) {
  return value != null && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0;
}
function unsetServiceBuildImmutableEnvVars(restoreEnv) {
  for (const key of SERVICE_BUILD_IMMUTABLE_ENV_VARS) {
    if (!restoreEnv.has(key)) {
      restoreEnv.set(key, process.env[key]);
    }
    delete process.env[key];
  }
}
function getGeneratedServiceAlreadyBuiltWarning(service) {
  const framework = service.framework ?? "unknown";
  const entrypoint = service.entrypoint ?? service.builder.src ?? "unknown";
  return `Detected already-built service "${service.name}" from lazily generated \`.vercel/output/config.json\` (framework: ${framework}, entrypoint: ${entrypoint}). It will not be treated as a service because its build output already exists at the top level. Configure it in \`vercel.json\` as a \`services\` entry to remove this warning.`;
}
async function main(client) {
  const telemetryClient = new BuildTelemetryClient({
    opts: {
      store: client.telemetryEventStore
    }
  });
  const rootSpan = client.rootSpan?.child("vc") ?? new Span({ name: "vc" });
  let { cwd } = client;
  cwd = await resolveProjectCwd(cwd);
  if (process.env.__VERCEL_BUILD_RUNNING) {
    output_manager_default.error(
      `${cmd(
        `${packageName} build`
      )} must not recursively invoke itself. Check the Build Command in the Project Settings or the ${cmd(
        "build"
      )} script in ${cmd("package.json")}`
    );
    output_manager_default.error(
      `Learn More: https://vercel.link/recursive-invocation-of-commands`
    );
    return 1;
  } else {
    process.env.__VERCEL_BUILD_RUNNING = "1";
  }
  let parsedArgs = null;
  const flagsSpecification = getFlagsSpecification(buildCommand.options);
  try {
    parsedArgs = parseArguments(client.argv.slice(2), flagsSpecification);
    telemetryClient.trackCliOptionOutput(parsedArgs.flags["--output"]);
    telemetryClient.trackCliOptionTarget(parsedArgs.flags["--target"]);
    telemetryClient.trackCliFlagProd(parsedArgs.flags["--prod"]);
    telemetryClient.trackCliFlagYes(parsedArgs.flags["--yes"]);
    telemetryClient.trackCliFlagStandalone(parsedArgs.flags["--standalone"]);
    telemetryClient.trackCliOptionId(parsedArgs.flags["--id"]);
    telemetryClient.trackCliOptionProject(parsedArgs.flags["--project"]);
  } catch (error) {
    printError(error);
    return 1;
  }
  if (parsedArgs.flags["--help"]) {
    telemetryClient.trackCliFlagHelp("build");
    output_manager_default.print(help(buildCommand, { columns: client.stderr.columns }));
    return 2;
  }
  const target = parseTarget({
    flagName: "target",
    flags: parsedArgs.flags
  }) || "preview";
  const yes = Boolean(parsedArgs.flags["--yes"]);
  const hasDeprecatedEnvVar = process.env.VERCEL_EXPERIMENTAL_STANDALONE_BUILD === "1";
  if (hasDeprecatedEnvVar) {
    output_manager_default.warn(
      "The VERCEL_EXPERIMENTAL_STANDALONE_BUILD environment variable is deprecated. Please use the --standalone flag instead."
    );
  }
  const standalone = Boolean(
    parsedArgs.flags["--standalone"] || hasDeprecatedEnvVar
  );
  try {
    await validateNpmrc(cwd);
  } catch (err) {
    output_manager_default.prettyError(err);
    return 1;
  }
  const projectNameOrId = parsedArgs.flags["--project"];
  let link = await rootSpan.child("vc.getProjectLink").trace(() => getProjectLink(client, cwd, projectNameOrId, true));
  if (projectNameOrId && !link) {
    const linkedFromApi = await getLinkedProject(
      client,
      cwd,
      projectNameOrId,
      true
    );
    if (linkedFromApi.status === "linked") {
      link = {
        projectId: linkedFromApi.project.id,
        orgId: linkedFromApi.org.id,
        repoRoot: linkedFromApi.repoRoot
      };
    } else if (linkedFromApi.status === "error") {
      return linkedFromApi.exitCode;
    } else {
      await printProjectNotFoundError(client, projectNameOrId, "build");
      return 1;
    }
  }
  const invokedCwd = cwd;
  const hasRepoLevelLink = Boolean(link?.repoRoot);
  let projectRootDirectory = link?.projectRootDirectory ?? "";
  if (link?.repoRoot) {
    cwd = client.cwd = link.repoRoot;
  }
  const vercelDir = join5(cwd, projectRootDirectory, VERCEL_DIR);
  let project = await rootSpan.child("vc.readProjectSettings").trace(() => readProjectSettings(vercelDir));
  const isTTY = process.stdin.isTTY;
  while (!project?.settings) {
    let confirmed = yes;
    if (!confirmed) {
      if (client.nonInteractive) {
        outputAgentError(
          client,
          {
            status: AGENT_STATUS.ERROR,
            reason: AGENT_REASON.PROJECT_SETTINGS_REQUIRED,
            message: "No project settings found locally. Run pull to retrieve them, or re-run with --yes to pull automatically.",
            next: [
              {
                command: buildCommandWithGlobalFlags(
                  `pull --yes --environment ${target}`,
                  client.argv
                ),
                when: "retrieve project settings"
              },
              {
                command: buildCommandWithGlobalFlags(
                  "build --yes",
                  client.argv
                ),
                when: "re-run build after pull"
              }
            ]
          },
          1
        );
        return 1;
      }
      if (!isTTY) {
        output_manager_default.print(
          `No Project Settings found locally. Run ${getCommandName(
            "pull --yes"
          )} to retrieve them. In non-interactive mode, set VERCEL_TOKEN for authentication.`
        );
        return 1;
      }
      if (!link) {
        const ensured = await ensureLink("build", client, cwd, {
          projectName: projectNameOrId,
          failIfNotFound: !!projectNameOrId,
          pullEnv: false
        });
        if (typeof ensured === "number") {
          return ensured;
        }
        link = await getProjectLink(client, cwd, projectNameOrId, true);
      }
      confirmed = await client.input.confirm(
        `No Project Settings found locally. Run ${getCommandName(
          "pull"
        )} for retrieving them?`,
        true
      );
    }
    if (!confirmed) {
      if (!client.nonInteractive)
        output_manager_default.print(`Canceled. No Project Settings retrieved.
`);
      return 0;
    }
    const { argv: originalArgv } = client;
    client.cwd = join5(cwd, projectRootDirectory);
    client.setArgv([
      ...originalArgv.slice(0, 2),
      "pull",
      `--environment`,
      target
    ]);
    const result = await pullCommandLogic(
      client,
      client.cwd,
      Boolean(parsedArgs.flags["--yes"]),
      target,
      parsedArgs.flags,
      projectNameOrId
    );
    if (result !== 0) {
      return result;
    }
    client.cwd = cwd;
    client.setArgv(originalArgv);
    project = await readProjectSettings(vercelDir);
  }
  if (!link) {
    link = await getProjectLink(client, cwd, projectNameOrId, true);
  }
  if (!hasRepoLevelLink && link && project?.settings) {
    const resolved = resolvePerDirectoryLinkRoot(
      invokedCwd,
      project.settings.rootDirectory
    );
    if (resolved.advisory) {
      output_manager_default.warn(resolved.advisory);
    }
    if (resolved.resolvedRootDirectory !== "") {
      projectRootDirectory = resolved.resolvedRootDirectory;
      project.settings.rootDirectory = resolved.resolvedRootDirectory;
      cwd = client.cwd = resolved.repoRoot;
    }
  }
  const defaultOutputDir = join5(cwd, projectRootDirectory, OUTPUT_DIR);
  const outputDir = parsedArgs.flags["--output"] ? resolve(parsedArgs.flags["--output"]) : defaultOutputDir;
  client.traceDiagnosticsPath = join5(
    outputDir,
    "diagnostics",
    "cli_traces.json"
  );
  await Promise.all([
    import_fs_extra3.default.remove(outputDir),
    // Also delete `.vercel/output`, in case the script is targeting Build Output API directly
    outputDir !== defaultOutputDir ? import_fs_extra3.default.remove(defaultOutputDir) : void 0
  ]);
  const buildsJson = {
    "//": "This file was generated by the `vercel build` command. It is not part of the Build Output API.",
    target,
    argv: scrubArgv(process.argv),
    cliVersion: pkg_default.version
  };
  const deploymentId = parsedArgs.flags["--id"];
  if (!process.env.VERCEL_BUILD_IMAGE && !deploymentId && !client.nonInteractive) {
    output_manager_default.warn(
      "Build not running on Vercel. System environment variables will not be available."
    );
  }
  const envToUnset = /* @__PURE__ */ new Set(["VERCEL", "NOW_BUILDER"]);
  try {
    const loadEnvSpan = rootSpan.child("vc.loadEnv");
    try {
      if (deploymentId) {
        if (link?.orgId?.startsWith("team_")) {
          client.config.currentTeam = link.orgId;
        }
        output_manager_default.debug(
          `Fetching environment variables for deployment ${deploymentId}`
        );
        const { buildEnv } = await fetchDeploymentBuildEnv(
          client,
          deploymentId
        );
        for (const [key, value] of Object.entries(buildEnv)) {
          envToUnset.add(key);
          process.env[key] = value;
        }
        output_manager_default.debug(
          `Loaded ${Object.keys(buildEnv).length} environment variables from deployment ${deploymentId}`
        );
      } else {
        const envPath = join5(
          cwd,
          projectRootDirectory,
          VERCEL_DIR,
          `.env.${target}.local`
        );
        const dotenvResult = import_dotenv.default.config({
          path: envPath,
          debug: output_manager_default.isDebugEnabled()
        });
        if (dotenvResult.error) {
          output_manager_default.debug(
            `Failed loading environment variables: ${dotenvResult.error}`
          );
        } else if (dotenvResult.parsed) {
          for (const key of Object.keys(dotenvResult.parsed)) {
            envToUnset.add(key);
          }
          output_manager_default.debug(`Loaded environment variables from "${envPath}"`);
        }
      }
    } finally {
      loadEnvSpan.stop();
    }
    if (project.settings.analyticsId) {
      envToUnset.add("VERCEL_ANALYTICS_ID");
      process.env.VERCEL_ANALYTICS_ID = project.settings.analyticsId;
    }
    process.env.VERCEL = "1";
    process.env.NOW_BUILDER = "1";
    try {
      await rootSpan.child("vc.doBuild").trace(
        (span) => doBuild(client, project, buildsJson, cwd, outputDir, span, standalone)
      );
    } finally {
      await rootSpan.stop();
    }
    if (client.nonInteractive) {
      const relOutputDir = relative3(cwd, outputDir);
      client.stdout.write(
        `${JSON.stringify(
          {
            status: AGENT_STATUS.OK,
            outputDir,
            outputDirRelative: relOutputDir.startsWith("..") ? outputDir : relOutputDir,
            target,
            message: "Build completed successfully.",
            next: [
              {
                command: buildCommandWithGlobalFlags("deploy", client.argv),
                when: "Deploy the build output"
              }
            ]
          },
          null,
          2
        )}
`
      );
    }
    return 0;
  } catch (err) {
    if (client.nonInteractive) {
      client.stdout.write(
        `${JSON.stringify(
          {
            status: AGENT_STATUS.ERROR,
            reason: "build_failed",
            message: err?.message ?? String(err),
            next: [
              {
                command: buildCommandWithGlobalFlags("pull --yes", client.argv),
                when: "Ensure project settings are present"
              },
              {
                command: buildCommandWithGlobalFlags(
                  "build --yes",
                  client.argv
                ),
                when: "re-run build"
              }
            ]
          },
          null,
          2
        )}
`
      );
    }
    output_manager_default.prettyError(err);
    buildsJson.error = toEnumerableError(err);
    const buildsJsonPath = join5(outputDir, "builds.json");
    const configJsonPath = join5(outputDir, "config.json");
    await import_fs_extra3.default.outputJSON(buildsJsonPath, buildsJson, {
      spaces: 2
    });
    await import_fs_extra3.default.writeJSON(configJsonPath, { version: 3 }, { spaces: 2 });
    return 1;
  } finally {
    for (const key of envToUnset) {
      delete process.env[key];
    }
    delete process.env.VERCEL_INSTALL_COMPLETED;
    resetCustomInstallCommandSet();
  }
}
async function doBuild(client, project, buildsJson, cwd, outputDir, span, standalone = false) {
  const { localConfigPath } = client;
  const VALID_DEPLOYMENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
  const workPath = join5(cwd, project.settings.rootDirectory || ".");
  const repoRootPath = cwd;
  const sourceConfigFile = await findSourceVercelConfigFile(workPath);
  let corepackShimDir;
  if (sourceConfigFile) {
    corepackShimDir = await initCorepack({ repoRootPath });
    const installDepsSpan = span.child("vc.installDeps");
    try {
      const installCommand = project.settings.installCommand;
      if (typeof installCommand === "string") {
        if (installCommand.trim()) {
          output_manager_default.log(`Running install command before config compilation...`);
          await runCustomInstallCommand({
            destPath: workPath,
            installCommand,
            spawnOpts: { env: process.env },
            projectCreatedAt: project.settings.createdAt
          });
        } else {
          output_manager_default.debug("Skipping empty install command");
        }
      } else {
        output_manager_default.log(`Installing dependencies before config compilation...`);
        await runNpmInstall(
          workPath,
          [],
          { env: process.env },
          void 0,
          project.settings.createdAt
        );
      }
    } finally {
      installDepsSpan.stop();
    }
    process.env.VERCEL_INSTALL_COMPLETED = "1";
  }
  const compileResult = await span.child("vc.compileVercelConfig").trace(() => compileVercelConfig(workPath));
  const vercelConfigPath = localConfigPath || compileResult.configPath || join5(workPath, "vercel.json");
  const [pkg, vercelConfig, hasInstrumentation] = await Promise.all([
    readJSONFile(join5(workPath, "package.json")),
    readJSONFile(vercelConfigPath),
    (0, import_fs_detectors3.detectInstrumentation)(new import_fs_detectors3.LocalFileSystemDetector(workPath))
  ]);
  if (pkg instanceof CantParseJSONFile)
    throw pkg;
  if (vercelConfig instanceof CantParseJSONFile)
    throw vercelConfig;
  if (hasInstrumentation) {
    output_manager_default.debug(
      "OpenTelemetry instrumentation detected. Automatic fetch instrumentation will be disabled."
    );
    process.env.VERCEL_TRACING_DISABLE_AUTOMATIC_FETCH_INSTRUMENTATION = "1";
  }
  if (vercelConfig) {
    vercelConfig[import_client.fileNameSymbol] = compileResult.wasCompiled ? compileResult.sourceFile || DEFAULT_VERCEL_CONFIG_FILENAME : "vercel.json";
  }
  const localConfig = vercelConfig || {};
  const validateError = validateConfig(localConfig);
  if (validateError) {
    throw validateError;
  }
  if (localConfig.crons && localConfig.crons.length > 0) {
    const cronSecretError = validateCronSecret(process.env.CRON_SECRET);
    if (cronSecretError) {
      throw cronSecretError;
    }
  }
  const projectSettings = {
    ...project.settings,
    ...pickOverrides(localConfig)
  };
  buildsJson.detectedFramework = await span.child("vc.detectFirstDeploymentFramework", {
    enabled: String(isFrameworkDetectionEnabled()),
    firstDeployment: String(process.env.VERCEL_FIRST_DEPLOYMENT === "1"),
    configuredFramework: projectSettings.framework ?? void 0
  }).trace(async (s) => {
    const result = await detectFirstDeploymentFramework({
      workPath,
      projectSettings
    });
    s.setAttributes({
      detectionStatus: result.status,
      detectedFramework: result.slug,
      detectedFrameworkVersion: result.version
    });
    return result;
  });
  if (process.env.VERCEL_BUILD_MONOREPO_SUPPORT === "1" && pkg?.scripts?.["vercel-build"] === void 0 && projectSettings.rootDirectory !== null && projectSettings.rootDirectory !== ".") {
    await setMonorepoDefaultSettings(cwd, workPath, projectSettings);
  }
  if (await shouldEmbedFlagsDefinitions(cwd)) {
    const { prepareFlagsDefinitions } = await import("@vercel/prepare-flags-definitions");
    await prepareFlagsDefinitions({
      cwd,
      env: process.env,
      userAgentSuffix: ua_default,
      output: output_manager_default
    });
  }
  const files = (await staticFiles(workPath, {})).map(
    (f) => normalizePath(relative3(workPath, f))
  );
  const detectedFrameworksPromise = span.child("vc.detectAllFrameworks", {
    enabled: String(isFrameworkDetectionEnabled())
  }).trace(async (s) => {
    if (!isFrameworkDetectionEnabled()) {
      return [];
    }
    try {
      const slugs = await detectAllFrameworks(workPath);
      s.setAttributes({
        detectedFrameworks: slugs.join(",") || void 0,
        detectedFrameworkCount: String(slugs.length)
      });
      return slugs;
    } catch (err) {
      output_manager_default.debug(`Framework cross-check detection failed: ${err}`);
      s.setAttributes({
        error: err instanceof Error ? err.message : String(err)
      });
      return [];
    }
  });
  const routesResult = (0, import_routing_utils2.getTransformedRoutes)(localConfig);
  if (routesResult.error) {
    throw routesResult.error;
  }
  if (localConfig.builds && localConfig.functions) {
    throw new NowBuildError2({
      code: "bad_request",
      message: "The `functions` property cannot be used in conjunction with the `builds` property. Please remove one of them.",
      link: "https://vercel.link/functions-and-builds"
    });
  }
  let builds = localConfig.builds || [];
  let zeroConfigRoutes = [];
  let zeroConfigFallbackRoutes = [];
  let detectedServices;
  let detectedResolvedServices;
  let servicesToRecord;
  const hasExperimentalServicesV1ConfiguredInVercelConfig = hasNonEmptyObject(
    localConfig.experimentalServices
  );
  const hasExperimentalServicesV2ConfiguredInVercelConfig = hasNonEmptyObject(
    localConfig.services ?? localConfig.experimentalServicesV2
  );
  const configuredExperimentalServicesV2 = hasExperimentalServicesV2ConfiguredInVercelConfig && (localConfig.services ?? localConfig.experimentalServicesV2) ? localConfig.services ?? localConfig.experimentalServicesV2 : void 0;
  let nestExperimentalServicesV2Output = hasExperimentalServicesV2ConfiguredInVercelConfig;
  let detectedExperimentalServicesV1Config;
  let detectedExperimentalServicesV2Config = configuredExperimentalServicesV2;
  let detectedExperimentalServicesV2RootRoutes;
  let isZeroConfig = false;
  if (builds.length > 0) {
    output_manager_default.warn(
      "Due to `builds` existing in your configuration file, the Build and Development Settings defined in your Project Settings will not apply. Learn More: https://vercel.link/unused-build-settings"
    );
    builds = builds.flatMap((b) => expandBuild(files, b));
  } else {
    isZeroConfig = true;
    const detectedBuilders = await span.child("vc.detectBuilders").trace(
      () => (0, import_fs_detectors3.detectBuilders)(files, pkg, {
        ...localConfig,
        services: void 0,
        experimentalServicesV2: configuredExperimentalServicesV2,
        projectSettings,
        ignoreBuildScript: true,
        featHandleMiss: true,
        workPath
      })
    );
    if (detectedBuilders.errors && detectedBuilders.errors.length > 0) {
      throw detectedBuilders.errors[0];
    }
    for (const w of detectedBuilders.warnings) {
      output_manager_default.warn(w.message, null, w.link, w.action || "Learn More");
    }
    if (detectedBuilders.builders) {
      builds = detectedBuilders.builders;
    } else {
      builds = [{ src: "**", use: "@vercel/static" }];
    }
    detectedResolvedServices = detectedBuilders.services;
    servicesToRecord = detectedResolvedServices;
    detectedServices = detectedBuilders.services?.filter(isExperimentalService2);
    const autoDetectedV2Config = detectedBuilders.experimentalServicesV2;
    if (!hasExperimentalServicesV2ConfiguredInVercelConfig && autoDetectedV2Config) {
      nestExperimentalServicesV2Output = true;
      detectedExperimentalServicesV2Config = autoDetectedV2Config;
    }
    if (detectedBuilders.useImplicitEnvInjection && detectedServices && detectedServices.length > 0) {
      const serviceUrlEnvVars = getExperimentalServiceUrlEnvVars({
        services: detectedServices,
        frameworkList: import_frameworks3.frameworkList,
        currentEnv: process.env,
        deploymentUrl: process.env.VERCEL_URL
      });
      for (const [key, value] of Object.entries(serviceUrlEnvVars)) {
        process.env[key] = value;
        output_manager_default.debug(`Injected service URL env var: ${key}=${value}`);
      }
    }
    const serviceRewrites = detectedBuilders.serviceRewrites;
    const serviceRewriteRoutes = serviceRewrites && serviceRewrites.length > 0 ? (0, import_routing_utils2.convertRewrites)(serviceRewrites) : null;
    zeroConfigRoutes.push(...detectedBuilders.redirectRoutes || []);
    const detectedHostRewriteRoutes = detectedBuilders.hostRewriteRoutes;
    zeroConfigRoutes = (0, import_routing_utils2.appendRoutesToPhase)({
      routes: zeroConfigRoutes,
      newRoutes: detectedHostRewriteRoutes ?? null,
      phase: null
    });
    const detectedServiceRewriteRoutes = nestExperimentalServicesV2Output ? [] : detectedBuilders.rewriteRoutes;
    zeroConfigRoutes.push(
      ...(0, import_routing_utils2.appendRoutesToPhase)({
        routes: [],
        newRoutes: [
          ...detectedServiceRewriteRoutes || [],
          ...serviceRewriteRoutes || []
        ],
        phase: "filesystem"
      })
    );
    zeroConfigRoutes = (0, import_routing_utils2.appendRoutesToPhase)({
      routes: zeroConfigRoutes,
      newRoutes: detectedBuilders.errorRoutes,
      phase: "error"
    });
    if (!nestExperimentalServicesV2Output) {
      zeroConfigRoutes.push(...detectedBuilders.defaultRoutes || []);
      zeroConfigFallbackRoutes = detectedBuilders.fallbackRoutes || [];
    }
  }
  const builderSpecs = new Set(builds.map((b) => b.use));
  let buildersWithPkgs = await span.child("vc.importBuilders").trace(() => importBuilders(builderSpecs, cwd, span));
  const filesMap = {};
  for (const path of files) {
    const fsPath = join5(workPath, path);
    const { mode } = await import_fs_extra3.default.stat(fsPath);
    filesMap[path] = new FileFsRef({ mode, fsPath });
  }
  const buildStamp = stamp_default();
  await import_fs_extra3.default.mkdirp(outputDir);
  const ops = [];
  const buildsJsonBuilds = /* @__PURE__ */ new Map();
  const ensureBuildersImported = async (buildsToImport) => {
    const missingBuilderSpecs = new Set(
      buildsToImport.map((build) => build.use).filter((builderSpec) => !buildersWithPkgs.has(builderSpec))
    );
    if (missingBuilderSpecs.size === 0)
      return;
    const importedBuilders = await span.child("vc.importBuilders").trace(() => importBuilders(missingBuilderSpecs, cwd, span));
    buildersWithPkgs = new Map([
      ...buildersWithPkgs.entries(),
      ...importedBuilders.entries()
    ]);
  };
  const addBuildsToBuildJson = async (buildsToAdd) => {
    await ensureBuildersImported(buildsToAdd);
    for (const build of buildsToAdd) {
      if (buildsJsonBuilds.has(build))
        continue;
      const builderWithPkg = buildersWithPkgs.get(build.use);
      if (!builderWithPkg) {
        throw new Error(`Failed to load Builder "${build.use}"`);
      }
      const { builder, pkg: builderPkg } = builderWithPkg;
      buildsJsonBuilds.set(build, {
        require: builderPkg.name,
        requirePath: builderWithPkg.path,
        apiVersion: builder.version,
        ...build
      });
    }
    buildsJson.builds = Array.from(buildsJsonBuilds.values());
    await writeBuildJson(buildsJson, outputDir);
  };
  const meta = {
    skipDownload: true,
    cliVersion: pkg_default.version
  };
  const executedBuilds = [];
  const buildResults = /* @__PURE__ */ new Map();
  const overrides = [];
  if (!corepackShimDir) {
    corepackShimDir = await initCorepack({ repoRootPath });
  }
  const diagnostics = {};
  const packageManifests = [];
  const getHasDetectedServices = () => detectedResolvedServices !== void 0 && detectedResolvedServices.length > 0;
  const getHasQueueServices = () => detectedServices?.some(isQueueBackedService);
  const synthesizedServiceCrons = [];
  const serviceByBuilder = /* @__PURE__ */ new Map();
  const serviceFileOverrides = /* @__PURE__ */ new Map();
  if (getHasDetectedServices()) {
    for (const service of detectedResolvedServices) {
      serviceByBuilder.set(service.builder, service);
    }
  }
  const preDeployEntries = [];
  const runBuilders = async (buildsToRun) => {
    await addBuildsToBuildJson(buildsToRun);
    for (const build of sortBuilders(buildsToRun)) {
      if (typeof build.src !== "string")
        continue;
      const builderWithPkg = buildersWithPkgs.get(build.use);
      if (!builderWithPkg) {
        throw new Error(`Failed to load Builder "${build.use}"`);
      }
      try {
        const { builder, pkg: builderPkg } = builderWithPkg;
        const service = getHasDetectedServices() ? serviceByBuilder.get(build) : void 0;
        const legacyExperimentalService = service && isExperimentalService2(service) ? service : void 0;
        const serviceWorkspace = service ? isExperimentalService2(service) ? service.workspace : service.root : void 0;
        const stripServiceRoutePrefix = !!legacyExperimentalService?.routePrefix && legacyExperimentalService.routePrefix !== "/";
        let buildWorkPath = workPath;
        let buildEntrypoint = build.src;
        let buildFiles = filesMap;
        if (service && serviceWorkspace && serviceWorkspace !== ".") {
          const wsPrefix = serviceWorkspace + "/";
          buildWorkPath = join5(workPath, serviceWorkspace);
          buildEntrypoint = build.src.startsWith(wsPrefix) ? build.src.slice(wsPrefix.length) : build.src;
          buildFiles = {};
          for (const [filePath, file] of Object.entries(filesMap)) {
            if (filePath.startsWith(wsPrefix)) {
              buildFiles[filePath.slice(wsPrefix.length)] = file;
            }
          }
          output_manager_default.debug(
            `Service "${service.name}": workspace-rooted build at "${buildWorkPath}", entrypoint "${buildEntrypoint}" (original: "${build.src}")`
          );
        }
        const settingsForEnv = service ? {
          buildCommand: service.buildCommand ?? void 0,
          installCommand: service.installCommand ?? void 0,
          outputDirectory: projectSettings.outputDirectory ?? void 0,
          nodeVersion: projectSettings.nodeVersion ?? void 0
        } : projectSettings;
        for (const key of [
          "buildCommand",
          "installCommand",
          "outputDirectory",
          "nodeVersion"
        ]) {
          const value = settingsForEnv[key];
          const envKey = `VERCEL_PROJECT_SETTINGS_` + key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase();
          if (typeof value === "string") {
            process.env[envKey] = value;
            output_manager_default.debug(`Setting env ${envKey} to "${value}"`);
          } else {
            delete process.env[envKey];
          }
        }
        const isFrontendBuilder = build.config && "framework" in build.config;
        const builderFramework = build.config?.framework ?? projectSettings.framework;
        let buildConfig;
        if (isZeroConfig) {
          if (service) {
            buildConfig = {
              ...build.config,
              ...getHasQueueServices() ? { hasWorkerServices: true } : void 0,
              // `service.functions` isn't on `build.config`, so builders that
              // read `config.functions` (e.g. Next.js) would otherwise miss it;
              // `serviceName` scopes the derived v2beta consumer.
              ...isExperimentalServiceV2(service) && service.functions ? { functions: service.functions, serviceName: service.name } : void 0,
              // Override project-level settings with service-specific ones.
              // The project-level framework is "services" which must NOT be
              // propagated to individual builders.
              projectSettings: {
                ...projectSettings,
                framework: service.framework ?? null,
                buildCommand: service.buildCommand ?? null,
                installCommand: service.installCommand ?? null
              },
              installCommand: service.installCommand ?? void 0,
              buildCommand: service.buildCommand ?? void 0,
              preDeployCommand: legacyExperimentalService?.preDeployCommand ?? void 0,
              framework: builderFramework,
              nodeVersion: projectSettings.nodeVersion,
              bunVersion: localConfig.bunVersion ?? void 0
            };
          } else {
            buildConfig = {
              outputDirectory: projectSettings.outputDirectory ?? void 0,
              ...build.config,
              projectSettings,
              installCommand: projectSettings.installCommand ?? void 0,
              devCommand: projectSettings.devCommand ?? void 0,
              buildCommand: projectSettings.buildCommand ?? void 0,
              framework: projectSettings.framework,
              nodeVersion: projectSettings.nodeVersion,
              bunVersion: localConfig.bunVersion ?? void 0
            };
          }
        } else {
          buildConfig = {
            ...build.config || {},
            bunVersion: localConfig.bunVersion ?? void 0
          };
        }
        const builderSpan = span.child("vc.builder", {
          "builder.name": builderPkg.name,
          "builder.version": builderPkg.version,
          "builder.dynamicallyInstalled": String(
            builderWithPkg.dynamicallyInstalled
          )
        });
        const serviceRoutePrefix = build.config?.routePrefix;
        const serviceConfigWorkspace = build.config?.workspace;
        const preDeployCmd = legacyExperimentalService?.preDeployCommand?.trim();
        const preDeployEntry = preDeployCmd && service ? { service: service.name } : void 0;
        if (preDeployEntry) {
          preDeployEntries.push(preDeployEntry);
        }
        const buildOptions = {
          files: buildFiles,
          entrypoint: buildEntrypoint,
          workPath: buildWorkPath,
          repoRootPath,
          config: buildConfig,
          meta,
          span: builderSpan,
          ...preDeployCmd ? {
            registerPreDeploy: (callback) => {
              preDeployEntry.callback = callback;
            }
          } : void 0,
          ...service ? {
            service: {
              name: service.name,
              ...legacyExperimentalService ? {
                type: legacyExperimentalService.type,
                trigger: legacyExperimentalService.trigger
              } : void 0,
              routePrefix: typeof serviceRoutePrefix === "string" ? serviceRoutePrefix : void 0,
              workspace: typeof serviceConfigWorkspace === "string" ? serviceConfigWorkspace : serviceWorkspace,
              ...legacyExperimentalService ? { schedule: legacyExperimentalService.schedule } : void 0
            }
          } : void 0
        };
        output_manager_default.debug(
          `Building entrypoint "${build.src}" with "${builderPkg.name}"`
        );
        const restoreEnv = /* @__PURE__ */ new Map();
        if (detectedServices && legacyExperimentalService?.env) {
          const perServiceEnv = getServiceUrlEnvVars({
            requestedEnv: legacyExperimentalService.env,
            consumerService: legacyExperimentalService,
            services: detectedServices,
            frameworkList: import_frameworks3.frameworkList,
            currentEnv: process.env,
            deploymentUrl: process.env.VERCEL_URL
          });
          for (const [key, value] of Object.entries(perServiceEnv)) {
            if (key in process.env)
              continue;
            restoreEnv.set(key, process.env[key]);
            process.env[key] = value;
            output_manager_default.debug(`Injected service URL env var: ${key}=${value}`);
          }
        }
        if (service) {
          unsetServiceBuildImmutableEnvVars(restoreEnv);
        }
        let buildResult;
        let rawBuildResult;
        try {
          rawBuildResult = await builderSpan.trace(async () => builder.build(buildOptions));
          if (builder.version === -1) {
            const vx = rawBuildResult;
            buildResult = vx.result;
          } else {
            buildResult = rawBuildResult;
          }
          if (!getHasDetectedServices() && buildConfig.zeroConfig && isFrontendBuilder && "output" in buildResult && !buildResult.routes) {
            const framework2 = import_frameworks3.frameworkList.find(
              (f) => f.slug === buildConfig.framework
            );
            if (framework2) {
              const defaultRoutes = await getFrameworkRoutes(
                framework2,
                buildWorkPath
              );
              buildResult.routes = defaultRoutes;
            }
          }
        } finally {
          for (const [key, prior] of restoreEnv) {
            if (prior === void 0) {
              delete process.env[key];
            } else {
              process.env[key] = prior;
            }
          }
          try {
            const builderDiagnostics = await builderSpan.child("vc.builder.diagnostics").trace(async () => {
              return await builder.diagnostics?.(buildOptions);
            });
            if (builderDiagnostics) {
              const prefix = service && serviceWorkspace && serviceWorkspace !== "." ? serviceWorkspace + "/" + builderPkg.name + "/" : "";
              for (const [key, value] of Object.entries(builderDiagnostics)) {
                const fullKey = prefix + key;
                if (key.endsWith("package-manifest.json")) {
                  try {
                    let data;
                    if (value.type === "FileBlob") {
                      data = value.data.toString();
                    } else {
                      data = await streamToString(value.toStream());
                    }
                    const packageManifest = JSON.parse(data);
                    const validationError = validatePackageManifest(packageManifest);
                    if (validationError) {
                      output_manager_default.warn(
                        `Invalid package-manifest.json from ${fullKey}: ${validationError}`
                      );
                    } else {
                      const workspace = service && serviceWorkspace && serviceWorkspace !== "." ? serviceWorkspace : ".";
                      packageManifests.push({
                        workspace,
                        key: fullKey,
                        buildConfig,
                        manifest: packageManifest,
                        service,
                        builderUse: builderPkg.name
                      });
                    }
                  } catch (e) {
                    output_manager_default.debug(
                      `Failed to parse ${fullKey}: ${e instanceof Error ? e.message : String(e)}`
                    );
                  }
                } else {
                  diagnostics[fullKey] = value;
                }
              }
            }
          } catch (error) {
            output_manager_default.error("Collecting diagnostics failed");
            output_manager_default.debug(error);
          }
        }
        if (buildResult && "output" in buildResult && "runtime" in buildResult.output && "type" in buildResult.output && buildResult.output.type === "Lambda") {
          const lambdaRuntime = buildResult.output.runtime;
          if (getDiscontinuedNodeVersions().some((o) => o.runtime === lambdaRuntime)) {
            throw new NowBuildError2({
              code: "NODEJS_DISCONTINUED_VERSION",
              message: `The Runtime "${build.use}" is using "${lambdaRuntime}", which is discontinued. Please upgrade your Runtime to a more recent version or consult the author for more details.`,
              link: "https://vercel.link/function-runtimes"
            });
          }
        }
        if ("output" in buildResult && buildResult.output && (isBackendBuilder(build) || build.use === "@vercel/python")) {
          const routesJsonPath = join5(buildWorkPath, ".vercel", "routes.json");
          if ((0, import_fs_extra3.existsSync)(routesJsonPath)) {
            try {
              const routesJson = await readJSONFile(routesJsonPath);
              if (routesJson && typeof routesJson === "object" && "routes" in routesJson && Array.isArray(routesJson.routes)) {
                const indexLambda = "index" in buildResult.output ? buildResult.output["index"] : void 0;
                const convertedRoutes = [];
                const convertedOutputs = indexLambda ? { index: indexLambda } : {};
                for (const route of routesJson.routes) {
                  if (typeof route.source !== "string") {
                    continue;
                  }
                  const { src } = (0, import_routing_utils2.sourceToRegex)(route.source);
                  const newRoute = {
                    src,
                    dest: route.source
                  };
                  if (route.methods) {
                    newRoute.methods = route.methods;
                  }
                  if (route.source === "/") {
                    continue;
                  }
                  if (indexLambda) {
                    convertedOutputs[route.source] = indexLambda;
                  }
                  convertedRoutes.push(newRoute);
                }
                buildResult.routes = [
                  { handle: "filesystem" },
                  ...convertedRoutes,
                  { src: "/(.*)", dest: "/" }
                ];
                if (indexLambda) {
                  buildResult.output = convertedOutputs;
                }
              }
            } catch (error) {
              output_manager_default.error(`Failed to read routes.json: ${error}`);
            }
          }
        }
        if (getHasDetectedServices() && service && legacyExperimentalService && "routes" in buildResult && Array.isArray(buildResult.routes) && detectedServices) {
          buildResult.routes = scopeRoutesToServiceOwnership({
            routes: buildResult.routes,
            owner: legacyExperimentalService,
            allServices: detectedServices
          });
        }
        if (legacyExperimentalService && isQueueBackedService(legacyExperimentalService) && "output" in buildResult) {
          attachQueueServiceTrigger(
            buildResult.output,
            legacyExperimentalService
          );
        }
        if (legacyExperimentalService && isScheduleTriggeredService(legacyExperimentalService) && !("crons" in buildResult && buildResult.crons?.length)) {
          const staticSchedules = getStaticServiceSchedules(
            legacyExperimentalService.schedule
          );
          if (typeof legacyExperimentalService.runtime === "string" && staticSchedules.length > 0) {
            const cronEntrypoint = legacyExperimentalService.entrypoint || legacyExperimentalService.builder.src || "index";
            for (const schedule of staticSchedules) {
              synthesizedServiceCrons.push({
                path: getInternalServiceCronPath(
                  legacyExperimentalService.name,
                  cronEntrypoint,
                  legacyExperimentalService.handlerFunction || "cron"
                ),
                schedule
              });
            }
          } else {
            throw new NowBuildError2({
              code: "CRON_SERVICE_NO_CRONS",
              message: `Scheduled service "${legacyExperimentalService.name}" did not produce any cron entries. The builder "${builderPkg.name}" may not support scheduled services.`
            });
          }
        }
        let mergedBuildResult = buildResult;
        if ("buildOutputPath" in buildResult) {
          const buildOutputConfigPath = join5(
            buildResult.buildOutputPath,
            "config.json"
          );
          const buildOutputConfig = await readJSONFile(
            buildOutputConfigPath
          );
          if (buildOutputConfig instanceof CantParseJSONFile) {
            throw buildOutputConfig;
          }
          if (buildOutputConfig) {
            if (!hasExperimentalServicesV1ConfiguredInVercelConfig && !hasExperimentalServicesV2ConfiguredInVercelConfig) {
              const outputConfigPath = join5(outputDir, "config.json");
              const outputConfig = await readJSONFile(outputConfigPath);
              if (outputConfig instanceof CantParseJSONFile) {
                throw outputConfig;
              }
              let shouldMergeGeneratedOutputRoutes = false;
              if (hasNonEmptyObject(outputConfig?.experimentalServices) && !hasNonEmptyObject(buildOutputConfig.experimentalServices)) {
                buildOutputConfig.experimentalServices = outputConfig.experimentalServices;
                shouldMergeGeneratedOutputRoutes = true;
              }
              if (hasNonEmptyObject(outputConfig?.experimentalServicesV2) && !hasNonEmptyObject(buildOutputConfig.experimentalServicesV2)) {
                buildOutputConfig.experimentalServicesV2 = outputConfig.experimentalServicesV2;
                shouldMergeGeneratedOutputRoutes = true;
              }
              if (hasGeneratedServicesConfig(outputConfig) && !hasGeneratedServicesConfig(buildOutputConfig)) {
                buildOutputConfig.services = outputConfig.services;
                shouldMergeGeneratedOutputRoutes = true;
              }
              if (shouldMergeGeneratedOutputRoutes && Array.isArray(outputConfig?.routes)) {
                buildOutputConfig.routes = prependMissingBuildOutputRoutes(
                  outputConfig.routes,
                  buildOutputConfig.routes
                );
              }
              if (hasNonEmptyObject(buildOutputConfig.experimentalServices) || hasNonEmptyObject(buildOutputConfig.experimentalServicesV2) || hasGeneratedServicesConfig(buildOutputConfig)) {
                await import_fs_extra3.default.writeJSON(buildOutputConfigPath, buildOutputConfig, {
                  spaces: 2
                });
              }
            }
            if (getHasDetectedServices() && service && legacyExperimentalService && Array.isArray(buildOutputConfig.routes) && detectedServices) {
              buildOutputConfig.routes = scopeRoutesToServiceOwnership({
                routes: buildOutputConfig.routes,
                owner: legacyExperimentalService,
                allServices: detectedServices
              });
            }
            mergedBuildResult = buildOutputConfig;
          }
        }
        buildResults.set(build, mergedBuildResult);
        executedBuilds.push(build);
        let buildOutputLength = 0;
        if ("output" in buildResult) {
          buildOutputLength = Array.isArray(buildResult.output) ? buildResult.output.length : 1;
        }
        const writeBuildResultPromise = builderSpan.child("vc.builder.writeBuildResult", {
          buildOutputLength: String(buildOutputLength)
        }).trace(
          () => writeBuildResult({
            repoRootPath,
            outputDir,
            buildResult: rawBuildResult,
            build,
            builder,
            builderPkg,
            vercelConfig: localConfig,
            standalone,
            workPath: buildWorkPath,
            service,
            nestServiceOutput: nestExperimentalServicesV2Output,
            stripServiceRoutePrefix
          })
        );
        if (service && nestExperimentalServicesV2Output) {
          const override = await writeBuildResultPromise;
          if (override)
            serviceFileOverrides.set(build, override);
        } else {
          ops.push(
            writeBuildResultPromise.then(
              (override) => {
                if (override)
                  overrides.push(override);
              },
              (err) => err
            )
          );
        }
      } catch (err) {
        const buildJsonBuild = buildsJsonBuilds.get(build);
        if (buildJsonBuild) {
          buildJsonBuild.error = toEnumerableError(err);
        }
        throw err;
      } finally {
        ops.push(
          download(diagnostics, join5(outputDir, "diagnostics")).then(
            () => void 0,
            (err) => err
          )
        );
      }
    }
  };
  const flushOps = async () => {
    const errors = await Promise.all(ops.splice(0));
    for (const error of errors) {
      if (error) {
        throw error;
      }
    }
  };
  const normalizeBuilderSrc = (src) => typeof src === "string" ? normalizePath(src).replace(/^\.\//, "") : void 0;
  const getBuilderIdentity = (build) => {
    const normalizedSrc = normalizeBuilderSrc(build.src);
    return normalizedSrc ? `${build.use}:${normalizedSrc}` : void 0;
  };
  const getAlreadyExecutedBuild = (candidate) => {
    const candidateIdentity = getBuilderIdentity(candidate);
    if (!candidateIdentity)
      return void 0;
    return executedBuilds.find(
      (build) => getBuilderIdentity(build) === candidateIdentity
    );
  };
  const appendExperimentalServicesV1Routes = (services) => {
    const serviceRoutes = (0, import_fs_detectors3.generateServicesRoutes)(services);
    zeroConfigRoutes = (0, import_routing_utils2.appendRoutesToPhase)({
      routes: zeroConfigRoutes,
      newRoutes: serviceRoutes.hostRewrites.length ? serviceRoutes.hostRewrites : null,
      phase: null
    });
    const serviceRewriteRoutes = nestExperimentalServicesV2Output ? [] : [
      ...serviceRoutes.rewrites,
      ...serviceRoutes.workers,
      ...serviceRoutes.crons
    ];
    zeroConfigRoutes.push(
      ...(0, import_routing_utils2.appendRoutesToPhase)({
        routes: [],
        newRoutes: serviceRewriteRoutes,
        phase: "filesystem"
      })
    );
    if (!nestExperimentalServicesV2Output) {
      zeroConfigRoutes.push(...serviceRoutes.defaults);
      zeroConfigFallbackRoutes.push(...serviceRoutes.fallbacks);
    }
  };
  await runBuilders(builds);
  await flushOps();
  if (!hasExperimentalServicesV1ConfiguredInVercelConfig && !hasExperimentalServicesV2ConfiguredInVercelConfig) {
    const generatedConfigPath = join5(outputDir, "config.json");
    const generatedConfig = await readJSONFile(generatedConfigPath);
    if (generatedConfig instanceof CantParseJSONFile) {
      throw generatedConfig;
    }
    const defaultGeneratedOutputDir = join5(workPath, OUTPUT_DIR);
    const generatedConfigs = [generatedConfig];
    if (resolve(outputDir) !== resolve(defaultGeneratedOutputDir)) {
      const defaultGeneratedConfig = await readJSONFile(
        join5(defaultGeneratedOutputDir, "config.json")
      );
      if (defaultGeneratedConfig instanceof CantParseJSONFile) {
        throw defaultGeneratedConfig;
      }
      generatedConfigs.push(defaultGeneratedConfig);
    }
    const generatedServicesConfig = getGeneratedServicesConfig([
      ...generatedConfigs,
      ...buildResults.values()
    ]);
    const generatedExperimentalServicesV1Config = getGeneratedExperimentalServicesV1Config([
      ...generatedConfigs,
      ...buildResults.values()
    ]);
    if (generatedServicesConfig || generatedExperimentalServicesV1Config) {
      if (generatedServicesConfig) {
        nestExperimentalServicesV2Output = true;
      }
      detectedExperimentalServicesV1Config = generatedExperimentalServicesV1Config;
      detectedExperimentalServicesV2Config = generatedServicesConfig;
      detectedExperimentalServicesV2RootRoutes = generatedServicesConfig ? generatedConfigs.find(
        (config2) => (hasGeneratedServicesConfig(config2) || hasNonEmptyObject(config2?.experimentalServicesV2)) && Array.isArray(config2?.routes)
      )?.routes : void 0;
      const generatedBuilders = await span.child("vc.detectGeneratedServices").trace(
        () => (0, import_fs_detectors3.detectBuilders)(files, pkg, {
          ...localConfig,
          ...generatedServicesConfig ? {
            services: generatedServicesConfig,
            experimentalServicesV2: void 0
          } : {
            experimentalServicesV2: void 0,
            experimentalServices: generatedExperimentalServicesV1Config
          },
          projectSettings,
          ignoreBuildScript: true,
          featHandleMiss: true,
          workPath
        })
      );
      if (generatedBuilders.errors && generatedBuilders.errors.length > 0) {
        throw generatedBuilders.errors[0];
      }
      for (const w of generatedBuilders.warnings) {
        output_manager_default.warn(w.message, null, w.link, w.action || "Learn More");
      }
      detectedResolvedServices = generatedBuilders.services;
      if (!detectedResolvedServices || detectedResolvedServices.length === 0) {
        detectedResolvedServices = void 0;
        detectedServices = void 0;
      } else {
        detectedServices = detectedResolvedServices.filter(
          isExperimentalService2
        );
        if (detectedServices.length > 0) {
          appendExperimentalServicesV1Routes(detectedServices);
        }
      }
      if (detectedServices && detectedServices.length > 0 && generatedBuilders.useImplicitEnvInjection) {
        const serviceUrlEnvVars = getExperimentalServiceUrlEnvVars({
          services: detectedServices,
          frameworkList: import_frameworks3.frameworkList,
          currentEnv: process.env,
          deploymentUrl: process.env.VERCEL_URL
        });
        for (const [key, value] of Object.entries(serviceUrlEnvVars)) {
          process.env[key] = value;
          output_manager_default.debug(`Injected service URL env var: ${key}=${value}`);
        }
      }
      const buildsToRun = [];
      const seenBuildsToRun = /* @__PURE__ */ new Set();
      const recordedServices = [];
      for (const service of detectedResolvedServices || []) {
        const alreadyExecutedBuild = getAlreadyExecutedBuild(service.builder);
        if (alreadyExecutedBuild) {
          if (generatedServicesConfig) {
            output_manager_default.warn(getGeneratedServiceAlreadyBuiltWarning(service));
            continue;
          }
          serviceByBuilder.set(alreadyExecutedBuild, service);
          recordedServices.push(service);
          continue;
        }
        const serviceBuilderIdentity = getBuilderIdentity(service.builder);
        if (serviceBuilderIdentity && !seenBuildsToRun.has(serviceBuilderIdentity)) {
          serviceByBuilder.set(service.builder, service);
          seenBuildsToRun.add(serviceBuilderIdentity);
          buildsToRun.push(service.builder);
        }
        recordedServices.push(service);
      }
      servicesToRecord = recordedServices.length > 0 ? recordedServices : void 0;
      if (buildsToRun.length > 0) {
        await runBuilders(buildsToRun);
      }
    }
  }
  for (const entry of preDeployEntries) {
    if (entry.callback) {
      await entry.callback();
    } else {
      output_manager_default.warn(
        `Service "${entry.service}" has a preDeployCommand but its builder does not support it. The command was not executed.`
      );
    }
  }
  await writeManifests(packageManifests, diagnostics, ops, outputDir);
  if (corepackShimDir) {
    cleanupCorepack(corepackShimDir);
  }
  const collectSpan = span.child("vc.finalizeBuildOutput");
  await flushOps();
  let needBuildsJsonOverride = false;
  const speedInsightsVersion = await getInstalledPackageVersion(
    "@vercel/speed-insights"
  );
  if (speedInsightsVersion) {
    buildsJson.features = {
      ...buildsJson.features ?? {},
      speedInsightsVersion
    };
    needBuildsJsonOverride = true;
  }
  const webAnalyticsVersion = await getInstalledPackageVersion("@vercel/analytics");
  if (webAnalyticsVersion) {
    buildsJson.features = {
      ...buildsJson.features ?? {},
      webAnalyticsVersion
    };
    needBuildsJsonOverride = true;
  }
  if (needBuildsJsonOverride) {
    await writeBuildJson(buildsJson, outputDir);
  }
  const configPath = join5(outputDir, "config.json");
  const existingConfig = await readJSONFile(configPath);
  if (existingConfig instanceof CantParseJSONFile) {
    throw existingConfig;
  }
  if (existingConfig) {
    if ("deploymentId" in existingConfig && typeof existingConfig.deploymentId === "string") {
      const deploymentId = existingConfig.deploymentId;
      if (deploymentId.length > 32) {
        throw new NowBuildError2({
          code: "INVALID_DEPLOYMENT_ID",
          message: `The deploymentId "${deploymentId}" must be 32 characters or less. Please choose a shorter deploymentId in your config.`,
          link: "https://vercel.com/docs/skew-protection#custom-skew-protection-deployment-id"
        });
      }
      if (!VALID_DEPLOYMENT_ID_PATTERN.test(deploymentId)) {
        throw new NowBuildError2({
          code: "INVALID_DEPLOYMENT_ID",
          message: `The deploymentId "${deploymentId}" contains invalid characters. Only alphanumeric characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_) are allowed.`,
          link: "https://vercel.com/docs/skew-protection#custom-skew-protection-deployment-id"
        });
      }
    }
    if (existingConfig.overrides && !nestExperimentalServicesV2Output) {
      overrides.push(existingConfig.overrides);
    }
  }
  const topLevelBuildResults = nestExperimentalServicesV2Output ? new Map(
    Array.from(buildResults.entries()).filter(
      ([build]) => !serviceByBuilder.has(build)
    )
  ) : buildResults;
  const builderRoutes = Array.from(
    topLevelBuildResults.entries()
  ).filter((b) => "routes" in b[1] && Array.isArray(b[1].routes)).map((b) => {
    const build = b[0];
    const buildResult = b[1];
    let entrypoint = build.src;
    if (getHasDetectedServices() && typeof build.src === "string") {
      const service = serviceByBuilder.get(build);
      if (service && isExperimentalService2(service) && service.type === "web" && typeof service.routePrefix === "string") {
        entrypoint = getServicesMergeEntrypoint(service, build.src);
      }
    }
    return {
      use: build.use,
      entrypoint,
      routes: buildResult.routes
    };
  });
  if (zeroConfigRoutes.length) {
    builderRoutes.unshift({
      use: "@vercel/zero-config-routes",
      entrypoint: "/",
      routes: zeroConfigRoutes
    });
  }
  let mergedRoutes = (0, import_routing_utils2.mergeRoutes)({
    userRoutes: routesResult.routes,
    builds: builderRoutes
  });
  if (zeroConfigFallbackRoutes.length) {
    mergedRoutes = (0, import_routing_utils2.appendRoutesToPhase)({
      routes: mergedRoutes,
      newRoutes: zeroConfigFallbackRoutes,
      phase: "filesystem"
    });
  }
  const mergedImages = mergeImages(
    localConfig.images,
    topLevelBuildResults.values()
  );
  const mergedCrons = mergeCrons(
    [...localConfig.crons || [], ...synthesizedServiceCrons],
    topLevelBuildResults.values()
  );
  const mergedWildcard = mergeWildcard(topLevelBuildResults.values());
  const mergedDeploymentId = await mergeDeploymentId(
    existingConfig?.deploymentId,
    topLevelBuildResults.values(),
    workPath
  );
  if (mergedDeploymentId) {
    if (mergedDeploymentId.length > 32) {
      throw new NowBuildError2({
        code: "INVALID_DEPLOYMENT_ID",
        message: `The deploymentId "${mergedDeploymentId}" must be 32 characters or less. Please choose a shorter deploymentId in your config.`,
        link: "https://vercel.com/docs/skew-protection#custom-skew-protection-deployment-id"
      });
    }
    if (!VALID_DEPLOYMENT_ID_PATTERN.test(mergedDeploymentId)) {
      throw new NowBuildError2({
        code: "INVALID_DEPLOYMENT_ID",
        message: `The deploymentId "${mergedDeploymentId}" contains invalid characters. Only alphanumeric characters (a-z, A-Z, 0-9), hyphens (-), and underscores (_) are allowed.`,
        link: "https://vercel.com/docs/skew-protection#custom-skew-protection-deployment-id"
      });
    }
  }
  const topLevelBuildResultOverrides = Array.from(topLevelBuildResults.values()).map((result) => "overrides" in result ? result.overrides : void 0).filter((value) => Boolean(value));
  const mergedOverrides = overrides.length > 0 || topLevelBuildResultOverrides.length > 0 ? Object.assign({}, ...overrides, ...topLevelBuildResultOverrides) : void 0;
  const framework = topLevelBuildResults.size > 0 ? await getFramework(workPath, topLevelBuildResults) : void 0;
  const explicitRootRoutes = appendBuildOutputRouteTables(
    routesResult.routes,
    detectedExperimentalServicesV2RootRoutes ?? existingConfig?.routes
  );
  const mergedRoutesWithGeneratedServicesV2Routes = nestExperimentalServicesV2Output ? appendBuildOutputRouteTables(
    mergedRoutes,
    detectedExperimentalServicesV2RootRoutes ?? existingConfig?.routes
  ) : mergedRoutes;
  const config = {
    version: 3,
    routes: mergedRoutesWithGeneratedServicesV2Routes ?? explicitRootRoutes,
    images: mergedImages,
    wildcard: mergedWildcard,
    overrides: mergedOverrides,
    framework,
    crons: mergedCrons,
    ...detectedExperimentalServicesV1Config && Object.keys(detectedExperimentalServicesV1Config).length > 0 && {
      experimentalServices: detectedExperimentalServicesV1Config
    },
    ...detectedExperimentalServicesV2Config && Object.keys(detectedExperimentalServicesV2Config).length > 0 && {
      experimentalServicesV2: detectedExperimentalServicesV2Config
    },
    ...!detectedExperimentalServicesV1Config && servicesToRecord && servicesToRecord.length > 0 && {
      services: servicesToRecord
    },
    ...mergedDeploymentId && { deploymentId: mergedDeploymentId }
  };
  await import_fs_extra3.default.writeJSON(join5(outputDir, "config.json"), config, { spaces: 2 });
  if (nestExperimentalServicesV2Output) {
    await writeServiceConfigs(
      outputDir,
      buildResults,
      serviceByBuilder,
      serviceFileOverrides,
      detectedExperimentalServicesV2Config
    );
  }
  await writeFlagsJSON(buildResults.values(), outputDir);
  await span.child("vc.frameworkCrossCheck").trace(async (s) => {
    const detectedFrameworks = await detectedFrameworksPromise;
    const executedBuilders = Array.from(buildResults.keys());
    const usedBuilders = executedBuilders.map((b) => b.use).filter((use) => Boolean(use));
    const mismatchResult = warnIfFrameworkMismatch({
      configuredFramework: projectSettings.framework,
      detectedFrameworks,
      usedBuilders,
      usedFrameworks: executedBuilders.map((b) => b.config?.framework)
    });
    s.setAttributes({
      result: mismatchResult,
      configuredFramework: projectSettings.framework ?? void 0,
      detectedFrameworks: detectedFrameworks.join(",") || void 0,
      usedBuilders: usedBuilders.join(",") || void 0
    });
  });
  await span.child("vc.validateBuildOutput").trace(async (s) => {
    const outputProblems = await validateBuildOutput(outputDir);
    s.setAttributes({
      problemCount: String(outputProblems.length),
      problems: outputProblems.map((p) => `${p.severity}: ${p.message}`).join("; ") || void 0
    });
    reportBuildOutputProblems(outputProblems);
  });
  collectSpan.stop();
  const relOutputDir = relative3(cwd, outputDir);
  if (!client.nonInteractive) {
    output_manager_default.print(
      `${prependEmoji(
        `Build Completed in ${import_chalk.default.bold(
          relOutputDir.startsWith("..") ? outputDir : relOutputDir
        )} ${import_chalk.default.gray(buildStamp())}`,
        emoji("success")
      )}
`
    );
  }
  if (process.env.VERCEL_ANALYZE_BUILD_OUTPUT === "1") {
    await analyzeVcConfigFiles(cwd, outputDir);
  }
}
function getFunctionUrlPath(vcConfigPath, outputDir) {
  const funcPath = normalizePath(relative3(outputDir, vcConfigPath)).replace(/^functions\//, "").replace(/\/\.vc-config\.json$/, "").replace(/\.func$/, "");
  return "/" + funcPath.split("/").filter((part) => part && part !== "index").join("/");
}
var LAMBDA_SIZE_LIMIT_MB = 250;
var CLOSE_TO_LIMIT_MB = LAMBDA_SIZE_LIMIT_MB - 5;
function printFileSizeBreakdown(files) {
  const dependencies = /* @__PURE__ */ new Map();
  for (const [bundlePath, sizeMB] of files.entries()) {
    const depKey = bundlePath.split("/").slice(0, 3).join("/");
    dependencies.set(depKey, (dependencies.get(depKey) || 0) + sizeMB);
  }
  const sortedDeps = Array.from(dependencies.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  if (sortedDeps.length > 0) {
    output_manager_default.print(import_chalk.default.yellow("Large dependencies:\n"));
    for (const [dep, size] of sortedDeps) {
      if (size >= 0.5) {
        output_manager_default.print(
          `    ${import_chalk.default.gray("\u2022")} ${dep}: ${import_chalk.default.bold(size.toFixed(2))} MB
`
        );
      }
    }
    output_manager_default.print("\n");
  }
}
async function analyzeVcConfigFiles(cwd, outputDir) {
  const filesObject = await glob("**/.vc-config.json", {
    cwd: outputDir
  });
  const vcConfigFiles = Object.keys(filesObject).filter((relativePath) => !relativePath.includes(".rsc.func")).map((relativePath) => join5(outputDir, relativePath));
  if (vcConfigFiles.length === 0) {
    output_manager_default.print("No functions to analyze.\n");
    return;
  }
  output_manager_default.print(
    `
Analyzing ${vcConfigFiles.length} function${vcConfigFiles.length === 1 ? "" : "s"}...
`
  );
  const results = await Promise.all(
    vcConfigFiles.map((file) => analyzeSingleFunction(file, cwd, outputDir))
  );
  const validResults = results.filter(
    (r) => r !== null
  );
  const sortedResults = validResults.sort((a, b) => b.size - a.size);
  output_manager_default.print(import_chalk.default.bold(`
Serverless function size info:
`));
  let numExceeded = 0;
  for (const result of sortedResults) {
    const exceeded = result.size >= LAMBDA_SIZE_LIMIT_MB;
    const close = result.size >= CLOSE_TO_LIMIT_MB && !exceeded;
    if (exceeded) {
      numExceeded++;
      output_manager_default.print(
        import_chalk.default.yellow(
          `
\u26A0\uFE0F  Max serverless function size of ${LAMBDA_SIZE_LIMIT_MB} MB uncompressed reached
`
        )
      );
    } else if (close) {
      output_manager_default.print(
        import_chalk.default.yellow(
          `
\u26A0\uFE0F  Max serverless function size of ${LAMBDA_SIZE_LIMIT_MB} MB uncompressed almost reached
`
        )
      );
    }
    output_manager_default.print(
      `${import_chalk.default.cyan("Function :")} ${import_chalk.default.cyan.bold(result.path)}
${import_chalk.default.cyan("Size     :")} ${import_chalk.default.cyan.bold(result.size.toFixed(2))} MB
`
    );
    printFileSizeBreakdown(result.files);
  }
  if (numExceeded > 0) {
    throw new NowBuildError2({
      code: "NOW_SANDBOX_WORKER_MAX_LAMBDA_SIZE",
      message: `${numExceeded} function${numExceeded === 1 ? "" : "s"} exceeded the uncompressed maximum size of ${LAMBDA_SIZE_LIMIT_MB} MB.`,
      link: "https://vercel.link/serverless-function-size",
      action: "Learn More"
    });
  }
}
async function analyzeSingleFunction(file, cwd, outputDir) {
  try {
    const content = await import_fs_extra3.default.readFile(file, "utf8");
    const parsed = JSON.parse(content);
    const funcDir = dirname2(file);
    const funcDirStats = getDirectorySizeInMB(funcDir);
    const filePathMap = parsed.filePathMap && typeof parsed.filePathMap === "object" ? Object.entries(parsed.filePathMap).filter(
      (entry) => typeof entry[1] === "string"
    ).map(([bundlePath, sourcePath]) => ({
      bundlePath,
      sourcePath: join5(cwd, sourcePath)
    })) : [];
    const fsRefStats = getTotalFileSizeInMB(filePathMap);
    const totalSize = funcDirStats.size + fsRefStats.size;
    const allFiles = new Map([...funcDirStats.files, ...fsRefStats.files]);
    const functionUrlPath = getFunctionUrlPath(file, outputDir);
    return {
      path: functionUrlPath,
      size: totalSize,
      files: allFiles
    };
  } catch (error) {
    output_manager_default.warn(`Failed to analyze ${file}: ${error}`);
    return null;
  }
}
function getTotalFileSizeInMB(files) {
  let size = 0;
  const filesSizeMap = /* @__PURE__ */ new Map();
  for (const { bundlePath, sourcePath } of files) {
    try {
      const stats = statSync(sourcePath);
      if (stats.isFile()) {
        const fileSizeMB = stats.size / (1024 * 1024);
        size += fileSizeMB;
        filesSizeMap.set(bundlePath, fileSizeMB);
      }
    } catch {
    }
  }
  return { size, files: filesSizeMap };
}
function getDirectorySizeInMB(dir) {
  let size = 0;
  const filesSizeMap = /* @__PURE__ */ new Map();
  try {
    const entries = readdirSync(dir, { recursive: true });
    for (const entry of entries) {
      const entryPath = typeof entry === "string" ? entry : entry.toString();
      const fullPath = join5(dir, entryPath);
      try {
        const stats = statSync(fullPath);
        if (stats.isFile()) {
          const fileSizeMB = stats.size / (1024 * 1024);
          size += fileSizeMB;
          filesSizeMap.set(normalizePath(entryPath), fileSizeMB);
        }
      } catch {
      }
    }
  } catch {
  }
  return { size, files: filesSizeMap };
}
async function getFramework(cwd, buildResults) {
  const detectedFramework = await (0, import_fs_detectors3.detectFrameworkRecord)({
    fs: new import_fs_detectors3.LocalFileSystemDetector(cwd),
    frameworkList: import_frameworks3.frameworkList
  });
  if (!detectedFramework) {
    return;
  }
  if (detectedFramework.useRuntime) {
    for (const [build, buildResult] of buildResults.entries()) {
      if ("framework" in buildResult && build.use === detectedFramework.useRuntime.use) {
        return buildResult.framework ? {
          slug: buildResult.framework.slug,
          version: buildResult.framework.version
        } : void 0;
      }
    }
  }
  if (detectedFramework.slug) {
    if (detectedFramework.detectedVersion && import_semver.default.valid(detectedFramework.detectedVersion)) {
      return {
        slug: detectedFramework.slug,
        version: detectedFramework.detectedVersion
      };
    }
    const frameworkVersion = (0, import_fs_detectors3.detectFrameworkVersion)(detectedFramework);
    if (frameworkVersion) {
      return {
        slug: detectedFramework.slug,
        version: frameworkVersion
      };
    }
  }
}
function expandBuild(files, build) {
  if (!build.use) {
    throw new NowBuildError2({
      code: `invalid_build_specification`,
      message: "Field `use` is missing in build specification",
      link: "https://vercel.com/docs/concepts/projects/project-configuration#builds",
      action: "View Documentation"
    });
  }
  let src = normalize(build.src || "**").split(sep).join("/");
  if (src === "." || src === "./") {
    throw new NowBuildError2({
      code: `invalid_build_specification`,
      message: "A build `src` path resolves to an empty string",
      link: "https://vercel.com/docs/concepts/projects/project-configuration#builds",
      action: "View Documentation"
    });
  }
  if (src[0] === "/") {
    src = src.substring(1);
  }
  const matches = files.filter(
    (name) => name === src || (0, import_minimatch2.default)(name, src, { dot: true })
  );
  return matches.map((m) => {
    return {
      ...build,
      src: m
    };
  });
}
function mergeImages(images, buildResults) {
  for (const result of buildResults) {
    if ("images" in result && result.images) {
      images = Object.assign({}, images, result.images);
    }
  }
  return images;
}
function mergeCrons(crons = [], buildResults) {
  for (const result of buildResults) {
    if ("crons" in result && result.crons) {
      crons = crons.concat(result.crons);
    }
  }
  return crons;
}
function mergeWildcard(buildResults) {
  let wildcard = void 0;
  for (const result of buildResults) {
    if ("wildcard" in result && result.wildcard) {
      if (!wildcard)
        wildcard = [];
      wildcard.push(...result.wildcard);
    }
  }
  return wildcard;
}
function appendBuildOutputRouteTables(...routeTables) {
  let routes = [];
  for (const routeTable of routeTables) {
    if (!Array.isArray(routeTable) || routeTable.length === 0)
      continue;
    let phase = null;
    let phaseRoutes = [];
    const flushPhase = () => {
      if (phaseRoutes.length === 0)
        return;
      routes = (0, import_routing_utils2.appendRoutesToPhase)({
        routes,
        newRoutes: phaseRoutes,
        phase
      });
      phaseRoutes = [];
    };
    for (const route of routeTable) {
      if ((0, import_routing_utils2.isHandler)(route)) {
        flushPhase();
        phase = route.handle;
      } else {
        phaseRoutes.push(route);
      }
    }
    flushPhase();
  }
  return routes.length > 0 ? routes : void 0;
}
function prependMissingBuildOutputRoutes(routesToPrepend, existingRoutes) {
  if (!Array.isArray(routesToPrepend) || routesToPrepend.length === 0) {
    return existingRoutes;
  }
  const existingRouteKeys = new Set(
    (existingRoutes ?? []).map((route) => JSON.stringify(route))
  );
  const missingRoutes = routesToPrepend.filter(
    (route) => !existingRouteKeys.has(JSON.stringify(route))
  );
  return appendBuildOutputRouteTables(missingRoutes, existingRoutes);
}
async function writeServiceConfigs(outputDir, buildResults, serviceByBuilder, serviceFileOverrides, experimentalServicesV2) {
  const serviceResults = /* @__PURE__ */ new Map();
  const serviceOverrides = /* @__PURE__ */ new Map();
  for (const [build, buildResult] of buildResults) {
    const service = serviceByBuilder.get(build);
    if (!service)
      continue;
    const results = serviceResults.get(service.name) || [];
    results.push(buildResult);
    serviceResults.set(service.name, results);
    const fileOverrides = serviceFileOverrides.get(build);
    if (fileOverrides) {
      const overrides = serviceOverrides.get(service.name) || [];
      overrides.push(fileOverrides);
      serviceOverrides.set(service.name, overrides);
    }
  }
  await Promise.all(
    Array.from(serviceResults.entries()).map(async ([serviceName, results]) => {
      const configPath = join5(
        outputDir,
        "services",
        serviceName,
        "config.json"
      );
      const existingConfig = await readJSONFile(configPath);
      if (existingConfig instanceof CantParseJSONFile) {
        throw existingConfig;
      }
      const routes = results.flatMap(
        (result) => "routes" in result && Array.isArray(result.routes) ? result.routes : []
      );
      const configuredRoutes = experimentalServicesV2?.[serviceName] ? getExperimentalServicesV2Routes(experimentalServicesV2[serviceName]) : [];
      const overrides = [
        ...results.map((result) => "overrides" in result ? result.overrides : void 0).filter(
          (value) => Boolean(value)
        ),
        ...serviceOverrides.get(serviceName) || []
      ];
      const framework = results.find(
        (result) => "framework" in result && Boolean(result.framework)
      )?.framework;
      const mergedRoutes = appendBuildOutputRouteTables(
        configuredRoutes,
        routes,
        existingConfig?.routes
      );
      const config = {
        ...existingConfig,
        version: 3,
        routes: mergedRoutes,
        images: mergeImages(existingConfig?.images, results),
        wildcard: mergeWildcard(results) || existingConfig?.wildcard,
        overrides: overrides.length > 0 ? Object.assign({}, existingConfig?.overrides, ...overrides) : existingConfig?.overrides,
        framework: framework || existingConfig?.framework,
        crons: mergeCrons(existingConfig?.crons, results),
        services: void 0,
        experimentalServices: void 0,
        experimentalServicesV2: void 0
      };
      await import_fs_extra3.default.writeJSON(configPath, config, { spaces: 2 });
    })
  );
}
function getExperimentalServicesV2Routes(serviceConfig) {
  const routesResult = (0, import_routing_utils2.getTransformedRoutes)({
    routes: serviceConfig.routes,
    cleanUrls: serviceConfig.cleanUrls,
    trailingSlash: serviceConfig.trailingSlash,
    headers: serviceConfig.headers,
    redirects: serviceConfig.redirects,
    rewrites: serviceConfig.rewrites
  });
  if (routesResult.error) {
    throw routesResult.error;
  }
  return routesResult.routes ?? [];
}
function getGeneratedExperimentalServicesV1Config(buildResults) {
  for (const result of buildResults) {
    if (result && "experimentalServices" in result && hasNonEmptyObject(result.experimentalServices)) {
      return result.experimentalServices;
    }
  }
  return void 0;
}
function hasGeneratedServicesConfig(result) {
  return result != null && "services" in result && hasNonEmptyObject(result.services);
}
function getGeneratedServicesConfig(buildResults) {
  for (const result of buildResults) {
    if (hasGeneratedServicesConfig(result)) {
      return result.services;
    }
    if (result && "experimentalServicesV2" in result && hasNonEmptyObject(result.experimentalServicesV2)) {
      return result.experimentalServicesV2;
    }
  }
  return void 0;
}
async function mergeDeploymentId(existingDeploymentId, buildResults, workPath) {
  if (existingDeploymentId) {
    return existingDeploymentId;
  }
  for (const result of buildResults) {
    if ("deploymentId" in result && result.deploymentId) {
      return result.deploymentId;
    }
  }
  try {
    const routesManifestPath = join5(workPath, ".next", "routes-manifest.json");
    if (await import_fs_extra3.default.pathExists(routesManifestPath)) {
      const routesManifest = await readJSONFile(
        routesManifestPath
      );
      if (routesManifest && !(routesManifest instanceof CantParseJSONFile)) {
        if (routesManifest.deploymentId) {
          return routesManifest.deploymentId;
        }
      }
    }
  } catch {
  }
  return void 0;
}
async function writeFlagsJSON(buildResults, outputDir) {
  const flagsFilePath = join5(outputDir, "flags.json");
  let hasFlags = true;
  const flags = await import_fs_extra3.default.readJSON(flagsFilePath).catch((error) => {
    if (error.code === "ENOENT") {
      hasFlags = false;
      return { definitions: {} };
    }
    throw error;
  });
  for (const result of buildResults) {
    if (!("flags" in result) || !result.flags || !result.flags.definitions)
      continue;
    for (const [key, definition] of Object.entries(result.flags.definitions)) {
      if (result.flags.definitions[key]) {
        output_manager_default.warn(
          `The flag "${key}" was found multiple times. Only its first occurrence will be considered.`
        );
        continue;
      }
      hasFlags = true;
      flags.definitions[key] = definition;
    }
  }
  if (hasFlags) {
    await import_fs_extra3.default.writeJSON(flagsFilePath, flags, { spaces: 2 });
  }
}
async function writeBuildJson(buildsJson, outputDir) {
  await import_fs_extra3.default.writeJSON(join5(outputDir, "builds.json"), buildsJson, { spaces: 2 });
}
async function getFrameworkRoutes(framework, dirPrefix) {
  let routes = [];
  if (typeof framework.defaultRoutes === "function") {
    routes = await framework.defaultRoutes(dirPrefix);
  } else if (Array.isArray(framework.defaultRoutes)) {
    routes = framework.defaultRoutes;
  }
  return routes;
}
function normalizeServiceRoutePrefix(routePrefix) {
  let prefix = routePrefix.startsWith("/") ? routePrefix : `/${routePrefix}`;
  if (prefix !== "/" && prefix.endsWith("/")) {
    prefix = prefix.slice(0, -1);
  }
  return prefix;
}
function getServicesMergeEntrypoint(service, buildSrc) {
  const routePrefix = typeof service.routePrefix === "string" ? service.routePrefix : "/";
  const normalized = normalizeServiceRoutePrefix(routePrefix);
  const sortKey = String(1e4 - normalized.length).padStart(5, "0");
  return `svc:${sortKey}:${normalized}:${service.name}:${buildSrc}`;
}
function attachQueueServiceTrigger(buildOutput, service) {
  const topics = getServiceQueueTopicConfigs(service);
  const consumer = sanitizeConsumerName(
    getInternalServiceFunctionPath(service.name)
  );
  if (service.builder.use !== "@vercel/python" && topics.length > 1) {
    throw new Error(
      `Worker service "${service.name}" has ${topics.length} topics, but multiple topics are only supported for Python workers.`
    );
  }
  for (const topicConfig of topics) {
    const trigger = {
      type: "queue/v2beta",
      topic: topicConfig.topic,
      consumer
    };
    if (topicConfig.retryAfterSeconds !== void 0) {
      trigger.retryAfterSeconds = topicConfig.retryAfterSeconds;
    }
    if (topicConfig.initialDelaySeconds !== void 0) {
      trigger.initialDelaySeconds = topicConfig.initialDelaySeconds;
    }
    if (isLambda(buildOutput)) {
      appendQueueTrigger(buildOutput, trigger);
    } else {
      for (const output of Object.values(buildOutput)) {
        if (isLambda(output)) {
          appendQueueTrigger(output, trigger);
        }
      }
    }
  }
}
function appendQueueTrigger(lambda, trigger) {
  const existingTriggers = Array.isArray(lambda.experimentalTriggers) ? lambda.experimentalTriggers : [];
  const alreadyConfigured = existingTriggers.some(
    (existing) => existing.type === trigger.type && existing.topic === trigger.topic && existing.consumer === trigger.consumer
  );
  if (!alreadyConfigured) {
    lambda.experimentalTriggers = [...existingTriggers, trigger];
  }
}
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    chunks.push(Uint8Array.from(buffer));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
var INTEGRATIONS_POLL_INTERVAL_MS = 5e3;
var INTEGRATIONS_POLL_TIMEOUT_MS = 3 * 60 * 1e3;
async function fetchDeploymentBuildEnv(client, deploymentId) {
  const deadline = Date.now() + INTEGRATIONS_POLL_TIMEOUT_MS;
  let isPolling = false;
  while (Date.now() < deadline) {
    try {
      return await pullEnvRecords(client, deploymentId, "vercel-cli:pull");
    } catch (err) {
      if (err && typeof err === "object" && "integrationsStatus" in err && err.integrationsStatus === "pending") {
        if (!isPolling) {
          output_manager_default.spinner(
            "Waiting for deployment integrations to finish provisioning..."
          );
          isPolling = true;
        }
        await new Promise(
          (resolve2) => setTimeout(resolve2, INTEGRATIONS_POLL_INTERVAL_MS)
        );
        continue;
      }
      throw err;
    }
  }
  throw new Error(
    "Timed out waiting for deployment integrations to complete provisioning."
  );
}
export {
  main as default
};
/*! Bundled license information:

js-yaml/dist/js-yaml.mjs:
  (*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT *)
*/
