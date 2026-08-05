import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  AGENT_REASON,
  AGENT_STATUS
} from "./chunk-QH7WYDEP.js";
import {
  getLocalPathConfig,
  isPromptBackError,
  isPromptCanceledError
} from "./chunk-AA3E7OLF.js";
import {
  getScope
} from "./chunk-OCEM4YAQ.js";
import {
  table
} from "./chunk-QEEGXNFK.js";
import {
  Separator,
  VERCEL_DIR_PROJECT,
  VERCEL_DIR_README,
  checkExistsAndConnect,
  compileVercelConfig,
  createDetectEntrypoint,
  createProject,
  detectProjects,
  fetchProjectsForRepoUrl,
  findProjectsFromPath,
  findRepoRoot,
  findSourceVercelConfigFile,
  getLinkedProject,
  getProjectByNameOrId,
  getServicesConfigWriteBlocker,
  getVercelDirectory,
  humanizePath,
  isDirectory,
  linkFolderToProject,
  linkRepoProject,
  parseGitConfig,
  pluckRemoteUrls,
  printAlignedLabel,
  pull,
  readJSONFile,
  require_dist3 as require_dist,
  require_frameworks,
  require_lib,
  require_slugify,
  resolveGitRemote,
  selectAndParseRemoteUrl,
  selectOrg,
  writeServicesConfig
} from "./chunk-XHC5YRFY.js";
import {
  buildCommandWithGlobalFlags,
  outputAgentError,
  shouldEmitNonInteractiveCommandError
} from "./chunk-2QBF3ZL3.js";
import {
  printError
} from "./chunk-EHTPDXTS.js";
import {
  CantParseJSONFile,
  ProjectNotFound,
  isAPIError
} from "./chunk-P6AK7SVK.js";
import {
  output_manager_default
} from "./chunk-OX7KI3LF.js";
import {
  require_source
} from "./chunk-S7KYDPEM.js";
import {
  __toESM
} from "./chunk-TZ2YI2VH.js";

// src/util/validate-paths.ts
var import_fs_extra = __toESM(require_lib(), 1);
var import_chalk = __toESM(require_source(), 1);
import { homedir } from "os";
async function validateRootDirectory(cwd, path2, errorSuffix = "") {
  const pathStat = await (0, import_fs_extra.lstat)(path2).catch(() => null);
  const suffix = errorSuffix ? ` ${errorSuffix}` : "";
  if (!pathStat) {
    output_manager_default.error(
      `The provided path ${import_chalk.default.cyan(
        `\u201C${humanizePath(path2)}\u201D`
      )} does not exist.${suffix}`
    );
    return false;
  }
  if (!pathStat.isDirectory()) {
    output_manager_default.error(
      `The provided path ${import_chalk.default.cyan(
        `\u201C${humanizePath(path2)}\u201D`
      )} is a file, but expected a directory.${suffix}`
    );
    return false;
  }
  if (!path2.startsWith(cwd)) {
    output_manager_default.error(
      `The provided path ${import_chalk.default.cyan(
        `\u201C${humanizePath(path2)}\u201D`
      )} is outside of the project.${suffix}`
    );
    return false;
  }
  return true;
}
async function validatePaths(client, paths) {
  if (paths.length > 1) {
    output_manager_default.error(`Can't deploy more than one path.`);
    return { valid: false, exitCode: 1 };
  }
  const path2 = paths[0];
  const pathStat = await (0, import_fs_extra.lstat)(path2).catch(() => null);
  if (!pathStat) {
    output_manager_default.error(`Could not find ${import_chalk.default.cyan(`\u201C${humanizePath(path2)}\u201D`)}`);
    return { valid: false, exitCode: 1 };
  }
  if (!pathStat.isDirectory()) {
    output_manager_default.prettyError({
      message: "Support for single file deployments has been removed.",
      link: "https://vercel.link/no-single-file-deployments"
    });
    return { valid: false, exitCode: 1 };
  }
  if (path2 === homedir()) {
    const shouldDeployHomeDirectory = await client.input.confirm(
      `You are deploying your home directory. Do you want to continue?`,
      false
    );
    if (!shouldDeployHomeDirectory) {
      output_manager_default.print(`Canceled
`);
      return { valid: false, exitCode: 0 };
    }
  }
  return { valid: true, path: path2 };
}

// src/util/config/read-config.ts
async function readConfig(dir) {
  let pkgFilePath;
  try {
    const compileResult = await compileVercelConfig(dir);
    pkgFilePath = compileResult.configPath || getLocalPathConfig(dir);
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }
    throw err;
  }
  const result = await readJSONFile(pkgFilePath);
  if (result instanceof CantParseJSONFile) {
    return result;
  }
  if (result) {
    return result;
  }
  return null;
}

// src/util/projects/project-not-found-error.ts
async function printProjectNotFoundError(client, projectNameOrId, commandName) {
  let contextName;
  try {
    const scope = await getScope(client);
    contextName = scope.contextName;
  } catch (err) {
    output_manager_default.debug(`getScope failed during error reporting: ${err}`);
  }
  const scopeClause = contextName ? ` (${contextName})` : "";
  const headline = `Project "${projectNameOrId}" was not found in the current scope${scopeClause}.`;
  output_manager_default.error(
    `${headline}

If it lives in a different team or account:
  \u2022 Retry with \`--scope <team-slug|your-username>\`, or
  \u2022 Run \`vercel switch <team-slug|your-username>\` to change scope.

List accessible teams with \`vercel teams ls\`.`
  );
  if (!shouldEmitNonInteractiveCommandError(client)) {
    return;
  }
  const retryWithScope = buildCommandWithGlobalFlags(
    client.argv,
    `${commandName} --project ${projectNameOrId} --scope <team-slug>`
  );
  outputAgentError(
    client,
    {
      status: AGENT_STATUS.ERROR,
      reason: AGENT_REASON.PROJECT_NOT_FOUND,
      message: `${headline} If it lives in a different team or account, retry with --scope <team-slug|your-username> or run \`vercel switch <team-slug|your-username>\` to change scope.`,
      ...contextName ? { scope: contextName } : {},
      next: [
        { command: "vercel teams ls", when: "list accessible teams" },
        { command: retryWithScope, when: "retry with a specific team" },
        {
          command: "vercel switch <team-slug>",
          when: "change the default scope"
        }
      ]
    },
    1
  );
}

// src/util/input/display-services.ts
var import_frameworks = __toESM(require_frameworks(), 1);
import {
  getServiceQueueTopics,
  isExperimentalServiceV2,
  isQueueTriggeredService,
  isScheduleTriggeredService,
  isWorkflowTriggeredService
} from "@vercel/build-utils";
var chalk2 = require_source();
var frameworksBySlug = new Map(import_frameworks.frameworkList.map((f) => [f.slug, f]));
var frameworkColors = {
  // JavaScript/TypeScript frameworks
  nextjs: chalk2.white,
  vite: chalk2.magenta,
  nuxtjs: chalk2.green,
  remix: chalk2.cyan,
  astro: chalk2.magenta,
  gatsby: chalk2.magenta,
  svelte: chalk2.red,
  sveltekit: chalk2.red,
  solidstart: chalk2.blue,
  angular: chalk2.red,
  vue: chalk2.green,
  ember: chalk2.red,
  preact: chalk2.magenta,
  // Python frameworks
  fastapi: chalk2.green,
  flask: chalk2.cyan,
  // Node frameworks
  express: chalk2.yellow,
  nest: chalk2.red,
  hono: chalk2.yellowBright
};
var runtimeColors = {
  node: chalk2.green,
  python: chalk2.blue,
  go: chalk2.cyan,
  ruby: chalk2.red,
  rust: chalk2.yellowBright
};
function getFrameworkName(slug) {
  if (!slug)
    return void 0;
  return frameworksBySlug.get(slug)?.name;
}
function formatRoutePrefix(routePrefix) {
  if (routePrefix === "/") {
    return "/";
  }
  const normalized = routePrefix.startsWith("/") ? routePrefix : `/${routePrefix}`;
  return `${normalized}/*`;
}
var jobTriggerLabels = {
  queue: "Job/Queue",
  schedule: "Job/Schedule",
  workflow: "Job/Workflow"
};
function getServiceDescriptionInfo(service) {
  if (service.type === "worker" || service.type === "job" || service.type === "cron") {
    const typeLabel = service.type === "worker" ? "Worker" : jobTriggerLabels[service.trigger ?? ""] ?? "Job";
    const typeColorFn = service.type === "worker" ? chalk2.magenta : chalk2.cyan;
    if (service.runtime) {
      const runtimeName = service.runtime.charAt(0).toUpperCase() + service.runtime.slice(1);
      const runtimeColorFn = runtimeColors[service.runtime] || chalk2.yellow;
      const label = `${typeLabel}${chalk2.white("/")}${runtimeColorFn(runtimeName)}`;
      return { label, colorFn: typeColorFn };
    }
    return { label: typeLabel, colorFn: typeColorFn };
  }
  return getFrameworkRuntimeBuilderInfo(service);
}
function getFrameworkRuntimeBuilderInfo(service) {
  const frameworkName = getFrameworkName(service.framework);
  if (frameworkName && service.framework) {
    const colorFn = frameworkColors[service.framework] || chalk2.cyan;
    return { label: frameworkName, colorFn };
  } else if (service.runtime) {
    const normalizedRuntime = service.runtime.toLowerCase().replace(/@.*$/, "");
    const colorFn = runtimeColors[normalizedRuntime] || chalk2.yellow;
    return { label: service.runtime, colorFn };
  } else if (service.builder?.use) {
    return { label: service.builder.use, colorFn: chalk2.magenta };
  }
  return { label: "unknown", colorFn: chalk2.dim };
}
function getServiceTarget(service) {
  if (isScheduleTriggeredService(service)) {
    return `schedule: ${service.schedule ?? "none"}`;
  }
  if (isQueueTriggeredService(service)) {
    const topics = getServiceQueueTopics(service);
    return `topics: ${topics.join(", ")}`;
  }
  if (isWorkflowTriggeredService(service)) {
    return "workflow";
  }
  return service.routePrefix ? formatRoutePrefix(service.routePrefix) : "no route";
}
function displayDetectedServices(services) {
  output_manager_default.print(`Detected services:
`);
  const rows = services.some(isExperimentalServiceV2) ? buildServiceRowsV2(services.filter(isExperimentalServiceV2)) : buildServiceRowsV1(services);
  const tableOutput = table(rows, { align: ["l", "l", "l", "l"], hsep: 2 });
  output_manager_default.print(`${tableOutput}
`);
}
function buildServiceRowsV1(services) {
  const outputOrder = {
    web: 0,
    cron: 1,
    job: 1,
    worker: 2
  };
  const sorted = [...services].sort(
    (a, b) => (outputOrder[a.type] ?? 3) - (outputOrder[b.type] ?? 3)
  );
  return sorted.map((service) => {
    const descInfo = getServiceDescriptionInfo(service);
    const target = getServiceTarget(service);
    return [
      `\u2022 ${service.name}`,
      descInfo.colorFn(`[${descInfo.label}]`),
      chalk2.dim("\u2192"),
      target
    ];
  });
}
function buildServiceRowsV2(services) {
  return services.map((service) => {
    const descInfo = getFrameworkRuntimeBuilderInfo(service);
    return [`\u2022 ${service.name}`, descInfo.colorFn(`[${descInfo.label}]`)];
  });
}
function displayServicesConfigNote(configFileName = "vercel.json") {
  output_manager_default.print(
    `
${chalk2.dim(`Services are configured via ${configFileName}.`)}
`
  );
}
function displayServiceErrors(errors) {
  for (const error of errors) {
    output_manager_default.warn(error.message);
  }
}

// src/util/link/setup-and-link.ts
var import_fs_extra2 = __toESM(require_lib(), 1);
var import_fs_detectors2 = __toESM(require_dist(), 1);
import { join as join2, basename } from "path";
import { getPlatformEnv } from "@vercel/build-utils";

// src/util/input/input-project.ts
var import_chalk2 = __toESM(require_source(), 1);
var import_slugify = __toESM(require_slugify(), 1);
var SEARCH_ALL_PROJECTS = "search-all-projects";
var CREATE_NEW_PROJECT = "create-new-project";
var BACK_TO_PROJECT_SELECTION = Symbol("back-to-project-selection");
var BACK_TO_TEAM_SELECTION = Symbol("back-to-team-selection");
var NO_EXISTING_PROJECTS = Symbol("no-existing-projects");
async function inputProjectDecision(client, defaultDecision) {
  const createChoice = {
    name: "Create new project",
    value: "create"
  };
  const existingChoice = {
    name: "Link existing project",
    value: "existing"
  };
  return await client.input.select({
    message: "Project?",
    choices: defaultDecision === "existing" ? [existingChoice, createChoice] : [createChoice, existingChoice]
  });
}
function randomNameSuffix() {
  return Math.random().toString(36).slice(2, 6).padEnd(4, "0");
}
async function suggestNewProjectName(client, org, slugifiedName, knownTaken) {
  let taken = knownTaken;
  if (!taken) {
    try {
      const existing = await getProjectByNameOrId(
        client,
        slugifiedName,
        org.id
      );
      taken = !(existing instanceof ProjectNotFound);
    } catch {
      taken = false;
    }
  }
  return taken ? `${slugifiedName}-${randomNameSuffix()}` : slugifiedName;
}
function promptForProjectName(client, org, defaultName, message = "Name?") {
  return client.input.text({
    message,
    default: defaultName,
    validate: async (val) => {
      if (!val) {
        return "Project name cannot be empty";
      }
      const project = await getProjectByNameOrId(client, val, org.id);
      if (!(project instanceof ProjectNotFound)) {
        return "Project already exists";
      }
      return true;
    }
  });
}
async function promptForProjectNameWithBack(client, org, defaultName) {
  try {
    return await client.withPromptBackNavigation(
      () => promptForProjectName(
        client,
        org,
        defaultName,
        `Name? ${import_chalk2.default.dim("Press \u2191 to return to project options")}`
      )
    );
  } catch (error) {
    if (isPromptBackError(error)) {
      return BACK_TO_PROJECT_SELECTION;
    }
    throw error;
  }
}
async function searchExistingProjects(client, org, allowBack) {
  const firstPage = await client.fetch(`/v9/projects?limit=100`, { accountId: org.id });
  const projects = firstPage.projects;
  const hasMoreProjects = firstPage.pagination.next != null;
  if (projects.length === 0) {
    output_manager_default.log(
      `No existing projects found under ${import_chalk2.default.bold(org.slug)}. Creating new project.`
    );
    return NO_EXISTING_PROJECTS;
  }
  const pageSize = 15;
  const countHint = projects.length > pageSize ? ` ${import_chalk2.default.dim(
    `(${hasMoreProjects ? "100+" : projects.length} projects)`
  )}` : "";
  return await client.input.search({
    message: `Which project?${countHint}`,
    pageSize,
    source: async (term, { signal }) => {
      const searchTerm = term?.trim();
      let matchingProjects = projects;
      if (searchTerm) {
        if (hasMoreProjects) {
          matchingProjects = (await client.fetch(
            `/v9/projects?search=${encodeURIComponent(searchTerm)}&limit=20`,
            {
              accountId: org.id,
              signal
            }
          )).projects;
        } else {
          const normalizedSearchTerm = searchTerm.toLowerCase();
          matchingProjects = projects.filter(
            (project) => project.name.toLowerCase().includes(normalizedSearchTerm) || project.id === searchTerm
          );
        }
      }
      const choices = matchingProjects.slice().sort((a, b) => b.updatedAt - a.updatedAt).map((project) => ({
        name: project.name,
        value: project
      }));
      if (!allowBack) {
        return choices;
      }
      const backChoice = {
        name: "Back to project options",
        value: BACK_TO_PROJECT_SELECTION
      };
      if (choices.length === 0) {
        return [backChoice];
      }
      if (searchTerm) {
        return choices;
      }
      return [...choices, new Separator(), backChoice];
    }
  });
}
async function inputProject(client, org, detectedProjectName, autoConfirm = false, skipAutoDetect = false, showProjectSuggestions = false, allowTeamSelectionBack = false, repoMatches = []) {
  const slugifiedName = (0, import_slugify.default)(detectedProjectName);
  let detectedProject = null;
  if (!skipAutoDetect && repoMatches.length === 0) {
    output_manager_default.spinner("Searching for existing projects\u2026", 1e3);
    const [project, slugifiedProject] = await Promise.all([
      getProjectByNameOrId(client, detectedProjectName, org.id),
      slugifiedName !== detectedProjectName ? getProjectByNameOrId(client, slugifiedName, org.id) : null
    ]);
    detectedProject = !(project instanceof ProjectNotFound) ? project : !(slugifiedProject instanceof ProjectNotFound) ? slugifiedProject : null;
    if (detectedProject && !detectedProject.id) {
      throw new Error(`Detected linked project does not have "id".`);
    }
    output_manager_default.stopSpinner();
  }
  if (autoConfirm) {
    if (repoMatches.length === 1) {
      return repoMatches[0];
    }
    return detectedProject || detectedProjectName;
  }
  if (client.nonInteractive) {
    if (detectedProject) {
      return detectedProject;
    }
    const err = new Error("Confirmation required");
    err.code = "HEADLESS";
    throw err;
  }
  const slugifiedNameKnownFree = !skipAutoDetect && repoMatches.length === 0 && !detectedProject;
  let memoizedDefaultName;
  async function defaultNewProjectName() {
    if (memoizedDefaultName === void 0) {
      memoizedDefaultName = slugifiedNameKnownFree ? slugifiedName : await suggestNewProjectName(
        client,
        org,
        slugifiedName,
        detectedProject?.name === slugifiedName
      );
    }
    return memoizedDefaultName;
  }
  let shouldLinkProject;
  if (showProjectSuggestions && !skipAutoDetect) {
    for (; ; ) {
      const choices = [];
      if (repoMatches.length > 0) {
        choices.push(
          ...repoMatches.map((match) => ({
            name: `${match.project.name} ${import_chalk2.default.gray("(linked by git)")}`,
            value: match
          })),
          new Separator()
        );
      } else if (detectedProject) {
        choices.push(
          {
            name: `${detectedProject.name} ${import_chalk2.default.gray("(folder name)")}`,
            value: detectedProject
          },
          new Separator()
        );
      }
      choices.push(
        {
          name: "Search all projects",
          value: SEARCH_ALL_PROJECTS,
          description: "Browse or search every project in this team"
        },
        {
          name: "Create a new project",
          value: CREATE_NEW_PROJECT,
          description: `Create it under ${org.slug}`
        }
      );
      if (allowTeamSelectionBack) {
        choices.push({
          name: "Choose a different team",
          value: BACK_TO_TEAM_SELECTION,
          description: "Return to team selection"
        });
      }
      const selected = await client.input.select({
        message: "Which project?",
        choices
      });
      if (selected === BACK_TO_TEAM_SELECTION) {
        return BACK_TO_TEAM_SELECTION;
      }
      if (selected === CREATE_NEW_PROJECT) {
        const projectName = await promptForProjectNameWithBack(
          client,
          org,
          await defaultNewProjectName()
        );
        if (projectName === BACK_TO_PROJECT_SELECTION) {
          continue;
        }
        return projectName;
      }
      if (selected !== SEARCH_ALL_PROJECTS) {
        return selected;
      }
      const existingProject = await searchExistingProjects(client, org, true);
      if (existingProject === BACK_TO_PROJECT_SELECTION) {
        continue;
      }
      if (existingProject === NO_EXISTING_PROJECTS) {
        const projectName = await promptForProjectNameWithBack(
          client,
          org,
          slugifiedName
        );
        if (projectName === BACK_TO_PROJECT_SELECTION) {
          continue;
        }
        return projectName;
      }
      return existingProject;
    }
  } else if (!detectedProject) {
    const decision = await inputProjectDecision(
      client,
      skipAutoDetect ? "existing" : "create"
    );
    shouldLinkProject = decision === "existing";
  } else {
    output_manager_default.print(`  ${import_chalk2.default.bold("Found existing project")}
`);
    printAlignedLabel("Project", `${org.slug}/${detectedProject.name}`);
    if (await client.input.confirm(`Link directory to project?`, true)) {
      return detectedProject;
    }
    const decision = await inputProjectDecision(client, "existing");
    shouldLinkProject = decision === "existing";
  }
  if (shouldLinkProject) {
    const existingProject = await searchExistingProjects(client, org, false);
    if (existingProject !== NO_EXISTING_PROJECTS && existingProject !== BACK_TO_PROJECT_SELECTION) {
      return existingProject;
    }
  }
  return await promptForProjectName(client, org, await defaultNewProjectName());
}

// src/util/input/input-root-directory.ts
var import_chalk3 = __toESM(require_source(), 1);
import { normalizePath } from "@vercel/build-utils";
import path from "path";
async function inputRootDirectory(client, cwd, autoConfirm = false) {
  if (autoConfirm) {
    return null;
  }
  while (true) {
    const rootDirectory = await client.input.text({
      message: `Code directory?`,
      transformer: (input) => {
        return `${import_chalk3.default.dim(`./`)}${input}`;
      }
    });
    if (!rootDirectory) {
      return null;
    }
    const normal = path.normalize(rootDirectory);
    if (normal === "." || normal === "./") {
      return null;
    }
    const fullPath = path.join(cwd, normal);
    if (await validateRootDirectory(
      cwd,
      fullPath,
      "Please choose a different one."
    ) === false) {
      continue;
    }
    return normalizePath(normal);
  }
}

// src/util/input/edit-project-settings.ts
var import_chalk4 = __toESM(require_source(), 1);
var import_frameworks2 = __toESM(require_frameworks(), 1);

// src/util/is-setting-value.ts
function isSettingValue(setting) {
  return setting && typeof setting.value === "string";
}

// src/util/input/edit-project-settings.ts
var settingMap = {
  buildCommand: "Build Command",
  devCommand: "Development Command",
  commandForIgnoringBuildStep: "Ignore Command",
  installCommand: "Install Command",
  outputDirectory: "Output Directory",
  framework: "Framework"
};
var settingKeys = Object.keys(settingMap).sort();
async function editProjectSettings(client, projectSettings, framework, autoConfirm, localConfigurationOverrides, configFileName = "vercel.json") {
  const settings = Object.assign(
    {
      buildCommand: null,
      devCommand: null,
      framework: null,
      commandForIgnoringBuildStep: null,
      installCommand: null,
      outputDirectory: null
    },
    projectSettings
  );
  const hasLocalConfigurationOverrides = localConfigurationOverrides && Object.values(localConfigurationOverrides ?? {}).some(Boolean);
  if (hasLocalConfigurationOverrides) {
    for (const setting of settingKeys) {
      const localConfigValue = localConfigurationOverrides[setting];
      if (localConfigValue)
        settings[setting] = localConfigValue;
    }
    output_manager_default.print(`  Local settings detected in ${configFileName}:
`);
    for (const setting of settingKeys) {
      const override = localConfigurationOverrides[setting];
      if (override) {
        output_manager_default.print(
          `  ${import_chalk4.default.dim(
            `${import_chalk4.default.bold(`${settingMap[setting]}:`)} ${override}`
          )}
`
        );
      }
    }
    if (localConfigurationOverrides.framework) {
      const overrideFramework = import_frameworks2.frameworkList.find(
        (f) => f.slug === localConfigurationOverrides.framework
      );
      if (overrideFramework) {
        framework = overrideFramework;
        output_manager_default.print(
          `  Merging default Project Settings for ${framework.name}. Previously listed overrides are prioritized.
`
        );
      }
    }
  }
  if (!framework) {
    settings.framework = null;
    return settings;
  }
  output_manager_default.print("\n");
  if (!framework.slug) {
    output_manager_default.print(`  No framework detected. Default Project Settings:
`);
  } else {
    const buildCmd = framework.settings.buildCommand?.value ?? null;
    const outputSetting = framework.settings.outputDirectory;
    const outputDir = outputSetting ? isSettingValue(outputSetting) ? outputSetting.value : outputSetting.placeholder : null;
    const inline = [
      buildCmd ? `${settingMap.buildCommand}: ${buildCmd}` : null,
      outputDir ? `${settingMap.outputDirectory}: ${outputDir}` : null
    ].filter(Boolean);
    const detail = inline.length ? import_chalk4.default.dim(` (${inline.join(", ")})`) : "";
    output_manager_default.print(`  ${import_chalk4.default.bold("Detected")} ${framework.name}${detail}
`);
  }
  settings.framework = framework.slug;
  if (!framework.slug) {
    for (const setting of settingKeys) {
      if (setting === "framework" || setting === "commandForIgnoringBuildStep") {
        continue;
      }
      const defaultSetting = framework.settings[setting];
      const override = localConfigurationOverrides?.[setting];
      if (!override && defaultSetting) {
        output_manager_default.print(
          `  ${import_chalk4.default.dim(
            `${import_chalk4.default.bold(`${settingMap[setting]}:`)} ${isSettingValue(defaultSetting) ? defaultSetting.value : import_chalk4.default.italic(`${defaultSetting.placeholder}`)}`
          )}
`
        );
      }
    }
  }
  if (autoConfirm || !await client.input.confirm("Customize settings?", false)) {
    return settings;
  }
  const choices = settingKeys.reduce(
    (acc, setting) => {
      const skip = setting === "framework" || setting === "commandForIgnoringBuildStep" || setting === "installCommand" || localConfigurationOverrides?.[setting];
      if (skip)
        return acc;
      return [...acc, { name: settingMap[setting], value: setting }];
    },
    []
  );
  const settingFields = await client.input.checkbox({
    message: "Which settings would you like to overwrite (select multiple)?",
    choices
  });
  for (const setting of settingFields) {
    const field = settingMap[setting];
    settings[setting] = await client.input.text({
      message: `${import_chalk4.default.bold(field)}?`
    });
  }
  return settings;
}

// src/util/link/setup-and-link.ts
var import_frameworks3 = __toESM(require_frameworks(), 1);

// src/util/input/vercel-auth.ts
var import_chalk5 = __toESM(require_source(), 1);
var DEFAULT_VERCEL_AUTH_SETTING = "standard";
var OPTIONS = {
  message: `What setting do you want to use for Vercel Authentication?`,
  default: DEFAULT_VERCEL_AUTH_SETTING,
  choices: [
    {
      description: "Standard Protection (recommended)",
      name: "standard",
      value: "standard"
    },
    {
      description: "No Protection (all deployments will be public)",
      name: "none",
      value: "none"
    }
  ]
};
async function vercelAuth(client, {
  autoConfirm = false
}) {
  if (autoConfirm || await client.input.confirm(
    `Want to use the default Deployment Protection settings? ${import_chalk5.default.dim(`(Vercel Authentication: Standard Protection)`)}`,
    true
  )) {
    return DEFAULT_VERCEL_AUTH_SETTING;
  }
  const vercelAuth2 = await client.input.select(OPTIONS);
  return vercelAuth2;
}

// src/util/link/services-setup.ts
var import_fs_detectors = __toESM(require_dist(), 1);
import { normalizePath as normalizePath2 } from "@vercel/build-utils";
import { join, relative } from "path";
var SERVICES_DOCS_URL = "https://vercel.com/docs/services";
var INFERRED_SERVICES_PROMPT = "Multiple services were detected. How would you like to set up this project?";
async function getServicesSetupState(workPath) {
  const detectServicesResult = await (0, import_fs_detectors.detectServices)({
    fs: new import_fs_detectors.LocalFileSystemDetector(workPath),
    detectEntrypoint: createDetectEntrypoint(workPath)
  });
  const hasConfiguredServices = detectServicesResult.resolved?.source === "configured";
  const inferredServices = hasConfiguredServices ? null : detectServicesResult.inferred;
  const inferredServicesWriteBlocker = inferredServices ? await getServicesConfigWriteBlocker(workPath, inferredServices.config) : null;
  return {
    detectServicesResult,
    hasConfiguredServices,
    inferredServices,
    inferredServicesWriteBlocker
  };
}
function displayConfiguredServicesSetup(detectServicesResult, configFileName = "vercel.json") {
  const v1Services = detectServicesResult.services.filter(
    import_fs_detectors.isExperimentalService
  );
  if (v1Services.length > 0) {
    displayDetectedServices(v1Services);
  }
  if (detectServicesResult.errors.length > 0) {
    displayServiceErrors(detectServicesResult.errors);
  }
  displayServicesConfigNote(configFileName);
}
function formatDetectedServicesSummary(services) {
  if (services.length === 0) {
    return "";
  }
  if (services.length === 1) {
    return `"${services[0].name}"`;
  }
  if (services.length === 2) {
    return `"${services[0].name}" + "${services[1].name}"`;
  }
  const othersCount = services.length - 2;
  return `"${services[0].name}" + "${services[1].name}" + ${othersCount} ${othersCount === 1 ? "other" : "others"}`;
}
function toProjectRootDirectory(projectPath, selectedPath) {
  const rootDirectory = normalizePath2(relative(projectPath, selectedPath));
  return rootDirectory === "" ? null : rootDirectory;
}
async function promptForInferredServicesSetup({
  client,
  autoConfirm,
  nonInteractive,
  workPath,
  inferred,
  inferredWriteBlocker,
  allowChooseDifferentProjectDirectory = false
}) {
  if (!inferred) {
    return null;
  }
  if (inferredWriteBlocker) {
    output_manager_default.warn(
      `Multiple services were detected, but your existing project config uses \`${inferredWriteBlocker}\`. To deploy multiple services in one project, see ${output_manager_default.link("Services", SERVICES_DOCS_URL)}.`
    );
    return null;
  }
  displayDetectedServices(inferred.services);
  let choice = null;
  if (autoConfirm) {
    choice = { type: "services" };
  } else if (!nonInteractive) {
    const webServices = inferred.services.filter(
      (service) => (0, import_fs_detectors.isExperimentalService)(service) ? service.type === "web" : true
    );
    const choices = [
      {
        name: `Set up project with all detected services: ${formatDetectedServicesSummary(
          inferred.services
        )}`,
        value: "services"
      },
      ...webServices.map((service, index) => ({
        name: `Set up project with "${service.name}"`,
        value: `single-app:${index}`
      })),
      ...allowChooseDifferentProjectDirectory ? [
        {
          name: "Choose a different root directory",
          value: "project-directory"
        }
      ] : []
    ];
    const selected = await client.input.select({
      message: INFERRED_SERVICES_PROMPT,
      choices
    });
    if (selected === "services") {
      choice = { type: "services" };
    } else if (selected === "project-directory") {
      choice = { type: "project-directory" };
    } else if (typeof selected === "string" && selected.startsWith("single-app:")) {
      const index = Number.parseInt(selected.slice("single-app:".length), 10);
      const service = webServices[index];
      if (service) {
        const serviceRoot = (0, import_fs_detectors.isExperimentalServiceV2)(service) ? service.root : service.workspace;
        choice = {
          type: "single-app",
          selectedPath: serviceRoot === "." ? workPath : join(workPath, serviceRoot)
        };
      }
    }
  }
  if (choice?.type !== "services") {
    return choice;
  }
  const { configFileName } = await writeServicesConfig(
    workPath,
    inferred.config
  );
  output_manager_default.print(`  Added services configuration to ${configFileName}.
`);
  return { type: "services" };
}

// src/util/projects/search-project-across-teams.ts
var import_slugify2 = __toESM(require_slugify(), 1);
import { relative as relative2 } from "path";
async function searchProjectsByRepoRoot({
  client,
  cwd,
  gitProjectName,
  orgs,
  autoConfirm,
  nonInteractive
}) {
  const rootPath = await findRepoRoot(cwd);
  if (!rootPath) {
    return [];
  }
  let remote;
  try {
    remote = await resolveGitRemote(client, rootPath, {
      yes: autoConfirm || nonInteractive
    });
  } catch (error) {
    if (isPromptCanceledError(error)) {
      throw error;
    }
    output_manager_default.debug(`Failed to resolve Git remote for project search: ${error}`);
    return [];
  }
  if (!remote) {
    return [];
  }
  const relativePath = relative2(rootPath, cwd);
  const results = await Promise.all(
    orgs.map(async (org) => {
      try {
        const projects = await fetchProjectsForRepoUrl(
          client,
          remote.repoUrl,
          org.id
        );
        const repoProjectConfigs = projects.filter(
          (project) => !gitProjectName || project.id === gitProjectName || project.name === gitProjectName
        ).map((project) => ({
          id: project.id,
          name: project.name,
          directory: project.rootDirectory || ".",
          orgId: org.id
        }));
        const matchingProjects = findProjectsFromPath(
          repoProjectConfigs,
          relativePath
        );
        return matchingProjects.map((match) => {
          const project = projects.find((p) => p.id === match.id);
          if (!project) {
            return null;
          }
          return {
            project,
            org,
            reason: "repo-root",
            repo: {
              ...remote,
              directory: match.directory
            }
          };
        }).filter(Boolean);
      } catch (error) {
        if (isPromptCanceledError(error)) {
          throw error;
        }
        output_manager_default.debug(
          `Failed to search Git-linked projects under ${org.slug}: ${error}`
        );
        return [];
      }
    })
  );
  return results.flat();
}

// src/util/link/setup-and-link.ts
function isCrossTeamMatch(value) {
  return typeof value === "object" && value !== null && "project" in value && "org" in value && "reason" in value;
}
async function selectOrgForLink(client, autoConfirm, searchable = false, meta) {
  try {
    return await selectOrg(
      client,
      "Which team?",
      autoConfirm,
      searchable,
      meta
    );
  } catch (err) {
    if (isAPIError(err)) {
      if (err.code === "NOT_AUTHORIZED") {
        output_manager_default.prettyError(err);
        return { status: "error", exitCode: 1, reason: "NOT_AUTHORIZED" };
      }
      if (err.code === "TEAM_DELETED") {
        output_manager_default.prettyError(err);
        return { status: "error", exitCode: 1, reason: "TEAM_DELETED" };
      }
    }
    throw err;
  }
}
function isErrnoException(err) {
  return err instanceof Error && typeof err.code === "string";
}
async function hasWorkspaces(cwd) {
  try {
    const fs = new import_fs_detectors2.LocalFileSystemDetector(cwd);
    const workspaces = await (0, import_fs_detectors2.getWorkspaces)({ fs });
    return workspaces.length > 0;
  } catch (err) {
    if (isErrnoException(err) && err.code && ["ENOENT", "EACCES", "ENOTDIR"].includes(err.code)) {
      output_manager_default.debug(`getWorkspaces failed for ${cwd}: ${err}`);
      return false;
    }
    throw err;
  }
}
async function shouldPromptForRootDirectory(opts) {
  if (opts.servicesChoice?.type === "project-directory") {
    return true;
  }
  if (await hasWorkspaces(opts.path)) {
    return true;
  }
  try {
    const detected = await detectProjects(opts.path);
    const frameworksAtRoot = detected.get("") ?? [];
    return frameworksAtRoot.length === 0;
  } catch (err) {
    output_manager_default.debug(`detectProjects failed at root: ${err}`);
    return true;
  }
}
async function maybePullEnvAfterLink(client, path2, autoConfirm, pullEnv) {
  if (!pullEnv || !client.stdin.isTTY || client.nonInteractive) {
    return;
  }
  output_manager_default.print("\n");
  const pullEnvConfirmed = autoConfirm || await client.input.confirm(
    "Pull development environment variables into .env.local?",
    true
  );
  if (!pullEnvConfirmed) {
    return;
  }
  const originalCwd = client.cwd;
  try {
    client.cwd = path2;
    const args = autoConfirm ? ["--yes"] : [];
    const exitCode = await pull(client, args, "vercel-cli:link");
    if (exitCode !== 0) {
      output_manager_default.error(
        "Failed to pull environment variables. You can run `vc env pull` manually."
      );
    }
  } catch (_error) {
    output_manager_default.error(
      "Failed to pull environment variables. You can run `vc env pull` manually."
    );
  } finally {
    client.cwd = originalCwd;
  }
}
async function linkCrossTeamMatch({
  client,
  path: path2,
  match,
  successEmoji,
  autoConfirm,
  pullEnv
}) {
  client.config.currentTeam = match.org.type === "team" ? match.org.id : void 0;
  if (match.reason === "repo-root" && match.repo) {
    await linkRepoProject(client, path2, {
      project: match.project,
      orgId: match.org.id,
      orgSlug: match.org.slug,
      remoteName: match.repo.remoteName,
      successEmoji
    });
    await maybePullEnvAfterLink(client, path2, autoConfirm, pullEnv);
    return {
      status: "linked",
      org: match.org,
      project: match.project,
      repoRoot: match.repo.rootPath
    };
  }
  await linkFolderToProject(
    client,
    path2,
    { projectId: match.project.id, orgId: match.org.id },
    match.project.name,
    match.org.slug,
    successEmoji,
    autoConfirm,
    pullEnv
  );
  return { status: "linked", org: match.org, project: match.project };
}
async function setupAndLink(client, path2, {
  autoConfirm = false,
  forceDelete = false,
  link,
  selectedOrg,
  successEmoji = "link",
  projectName,
  nonInteractive = false,
  pullEnv = true,
  v0
}) {
  const { config } = client;
  const gitProjectName = projectName;
  projectName = projectName ?? basename(path2);
  if (!isDirectory(path2)) {
    output_manager_default.error(`Expected directory but found file: ${path2}`);
    return { status: "error", exitCode: 1, reason: "PATH_IS_FILE" };
  }
  if (!link) {
    link = await getLinkedProject(client, path2);
  }
  const isTTY = client.stdin.isTTY;
  let rootDirectory = null;
  let newProjectName;
  let org = selectedOrg;
  if (!forceDelete && link.status === "linked") {
    return link;
  }
  if (getPlatformEnv("ORG_ID") && getPlatformEnv("PROJECT_ID")) {
    const envLink = await getLinkedProject(client, path2);
    if (envLink.status === "error") {
      return envLink;
    }
    if (envLink.status === "linked") {
      config.currentTeam = envLink.org.type === "team" ? envLink.org.id : void 0;
      output_manager_default.print("\n");
      printAlignedLabel("Directory", humanizePath(path2));
      printAlignedLabel("Source", "VERCEL_ORG_ID and VERCEL_PROJECT_ID");
      output_manager_default.print("\n");
      printAlignedLabel(
        "Linked",
        `${envLink.org.slug}/${envLink.project.name}`,
        { gutter: "\u2713" }
      );
      return envLink;
    }
  }
  if (!isTTY && !autoConfirm && !nonInteractive) {
    return { status: "error", exitCode: 1, reason: "HEADLESS" };
  }
  if (!org && (nonInteractive || !isTTY)) {
    const resolved = await selectOrgForLink(client, autoConfirm);
    if ("status" in resolved) {
      return resolved;
    }
    org = resolved;
  }
  if (forceDelete) {
    const vercelDir = getVercelDirectory(path2);
    (0, import_fs_extra2.remove)(join2(vercelDir, VERCEL_DIR_README));
    (0, import_fs_extra2.remove)(join2(vercelDir, VERCEL_DIR_PROJECT));
  }
  output_manager_default.print("\n");
  printAlignedLabel("Directory", humanizePath(path2));
  output_manager_default.print("\n");
  const interactive = isTTY && !nonInteractive;
  const searchableTeamPicker = interactive;
  const showProjectSuggestions = interactive && !gitProjectName;
  let projectOrNewProjectName;
  let teamAutoSelected = false;
  for (; ; ) {
    if (!org) {
      const orgMeta = {};
      const resolved = await selectOrgForLink(
        client,
        autoConfirm,
        searchableTeamPicker,
        orgMeta
      );
      if ("status" in resolved) {
        return resolved;
      }
      org = resolved;
      teamAutoSelected = orgMeta.choiceCount === 1;
    }
    let repoMatches = [];
    if (showProjectSuggestions) {
      output_manager_default.spinner("Searching for existing projects\u2026", 1e3);
      try {
        repoMatches = await searchProjectsByRepoRoot({
          client,
          cwd: path2,
          gitProjectName,
          orgs: [org],
          autoConfirm,
          nonInteractive
        });
      } catch (err) {
        if (isPromptCanceledError(err)) {
          throw err;
        }
        output_manager_default.debug(`Git-linked project search failed: ${err}`);
      } finally {
        output_manager_default.stopSpinner();
      }
    }
    try {
      projectOrNewProjectName = await inputProject(
        client,
        org,
        projectName,
        autoConfirm,
        false,
        showProjectSuggestions,
        searchableTeamPicker && !selectedOrg && !teamAutoSelected,
        repoMatches
      );
    } catch (err) {
      if (err instanceof Error && err.code === "HEADLESS") {
        return { status: "error", exitCode: 1, reason: "HEADLESS" };
      }
      throw err;
    }
    if (projectOrNewProjectName === BACK_TO_TEAM_SELECTION) {
      org = void 0;
      continue;
    }
    break;
  }
  if (typeof projectOrNewProjectName === "string") {
    newProjectName = projectOrNewProjectName;
  } else if (isCrossTeamMatch(projectOrNewProjectName)) {
    return await linkCrossTeamMatch({
      client,
      path: path2,
      match: projectOrNewProjectName,
      successEmoji,
      autoConfirm,
      pullEnv
    });
  } else {
    const project = projectOrNewProjectName;
    await linkFolderToProject(
      client,
      path2,
      {
        projectId: project.id,
        orgId: org.id
      },
      project.name,
      org.slug,
      successEmoji,
      autoConfirm,
      pullEnv
    );
    return { status: "linked", org, project };
  }
  config.currentTeam = org.type === "team" ? org.id : void 0;
  const rootServicesSetup = await getServicesSetupState(path2);
  const configFileName = await findSourceVercelConfigFile(path2) ?? "vercel.json";
  try {
    let settings = {};
    let pathWithRootDirectory = path2;
    let rootInferredServicesChoice = null;
    if (!rootServicesSetup.hasConfiguredServices) {
      rootInferredServicesChoice = await promptForInferredServicesSetup({
        client,
        autoConfirm,
        nonInteractive,
        workPath: path2,
        inferred: rootServicesSetup.inferredServices,
        inferredWriteBlocker: rootServicesSetup.inferredServicesWriteBlocker,
        allowChooseDifferentProjectDirectory: true
      });
    }
    if (rootServicesSetup.hasConfiguredServices) {
      displayConfiguredServicesSetup(
        rootServicesSetup.detectServicesResult,
        configFileName
      );
      settings.framework = "services";
    } else if (rootInferredServicesChoice?.type === "services") {
      settings.framework = "services";
    } else {
      const skipSelectedRootInferredServicesPrompt = rootInferredServicesChoice?.type === "single-app";
      if (rootInferredServicesChoice?.type === "single-app") {
        rootDirectory = toProjectRootDirectory(
          path2,
          rootInferredServicesChoice.selectedPath
        );
      } else {
        const shouldPromptRoot = await shouldPromptForRootDirectory({
          path: path2,
          servicesChoice: rootInferredServicesChoice
        });
        if (shouldPromptRoot) {
          rootDirectory = await inputRootDirectory(client, path2, autoConfirm);
          if (rootDirectory && !await validateRootDirectory(path2, join2(path2, rootDirectory))) {
            return {
              status: "error",
              exitCode: 1,
              reason: "INVALID_ROOT_DIRECTORY"
            };
          }
        }
      }
      pathWithRootDirectory = rootDirectory ? join2(path2, rootDirectory) : path2;
      const selectedRootServicesSetup = pathWithRootDirectory === path2 ? null : await getServicesSetupState(pathWithRootDirectory);
      let selectedRootInferredServicesChoice = null;
      if (!skipSelectedRootInferredServicesPrompt) {
        selectedRootInferredServicesChoice = await promptForInferredServicesSetup({
          client,
          autoConfirm,
          nonInteractive,
          workPath: pathWithRootDirectory,
          inferred: selectedRootServicesSetup?.inferredServices ?? null,
          inferredWriteBlocker: selectedRootServicesSetup?.inferredServicesWriteBlocker ?? null
        });
      }
      if (selectedRootServicesSetup?.hasConfiguredServices) {
        displayConfiguredServicesSetup(
          selectedRootServicesSetup.detectServicesResult,
          configFileName
        );
        settings.framework = "services";
      } else if (selectedRootInferredServicesChoice?.type === "services") {
        settings.framework = "services";
      } else {
        if (selectedRootInferredServicesChoice?.type === "single-app") {
          rootDirectory = toProjectRootDirectory(
            path2,
            selectedRootInferredServicesChoice.selectedPath
          );
          pathWithRootDirectory = rootDirectory ? join2(path2, rootDirectory) : path2;
        }
        const localConfig = await readConfig(pathWithRootDirectory);
        if (localConfig instanceof CantParseJSONFile) {
          output_manager_default.prettyError(localConfig);
          return { status: "error", exitCode: 1 };
        }
        const isZeroConfig = !localConfig || !localConfig.builds || localConfig.builds.length === 0;
        if (isZeroConfig) {
          const localConfigurationOverrides = {
            buildCommand: localConfig?.buildCommand,
            devCommand: localConfig?.devCommand,
            framework: localConfig?.framework,
            commandForIgnoringBuildStep: localConfig?.ignoreCommand,
            installCommand: localConfig?.installCommand,
            outputDirectory: localConfig?.outputDirectory
          };
          const detectedProjectsForWorkspace = await detectProjects(
            pathWithRootDirectory
          );
          const detectedProjects = detectedProjectsForWorkspace.get("") || [];
          const framework = detectedProjects[0] ?? import_frameworks3.frameworkList.find((f) => f.slug === null);
          settings = await editProjectSettings(
            client,
            {},
            framework,
            autoConfirm,
            localConfigurationOverrides,
            configFileName
          );
        }
      }
    }
    let changeAdditionalSettings = false;
    if (!autoConfirm) {
      changeAdditionalSettings = await client.input.confirm(
        "Customize advanced settings?",
        false
      );
    }
    let vercelAuthSetting = DEFAULT_VERCEL_AUTH_SETTING;
    if (changeAdditionalSettings) {
      vercelAuthSetting = await vercelAuth(client, {
        autoConfirm
      });
    }
    if (rootDirectory) {
      settings.rootDirectory = rootDirectory;
    }
    const project = await createProject(client, {
      ...settings,
      name: newProjectName,
      vercelAuth: vercelAuthSetting,
      v0
    });
    await linkFolderToProject(
      client,
      path2,
      {
        projectId: project.id,
        orgId: org.id
      },
      project.name,
      org.slug,
      successEmoji,
      autoConfirm,
      false,
      // don't prompt to pull env for newly created projects
      "Created"
    );
    await connectGitRepository(client, path2, project, autoConfirm, org);
    return { status: "linked", org, project };
  } catch (err) {
    if (isPromptCanceledError(err)) {
      throw err;
    }
    if (isAPIError(err) && err.code === "too_many_projects") {
      output_manager_default.prettyError(err);
      return { status: "error", exitCode: 1, reason: "TOO_MANY_PROJECTS" };
    }
    if (err instanceof Error && err.code === "HEADLESS") {
      return { status: "error", exitCode: 1, reason: "HEADLESS" };
    }
    printError(err);
    return { status: "error", exitCode: 1 };
  }
}
async function connectGitRepository(client, path2, project, autoConfirm, org) {
  try {
    const gitConfig = await parseGitConfig(join2(path2, ".git/config"));
    if (!gitConfig) {
      return;
    }
    const remoteUrls = pluckRemoteUrls(gitConfig);
    if (!remoteUrls || Object.keys(remoteUrls).length === 0) {
      return;
    }
    output_manager_default.print("\n");
    const shouldConnect = autoConfirm || await client.input.confirm(`Connect detected Git repository?`, true);
    if (!shouldConnect) {
      return;
    }
    const repoInfo = await selectAndParseRemoteUrl(client, remoteUrls);
    if (!repoInfo) {
      return;
    }
    await checkExistsAndConnect({
      client,
      confirm: autoConfirm,
      gitProviderLink: project.link,
      org,
      gitOrg: repoInfo.org,
      project,
      // Type assertion since we only need the id
      provider: repoInfo.provider,
      repo: repoInfo.repo,
      repoPath: `${repoInfo.org}/${repoInfo.repo}`
    });
  } catch (error) {
    if (isPromptCanceledError(error)) {
      return;
    }
    output_manager_default.debug(`Failed to connect git repository: ${error}`);
  }
}

export {
  validateRootDirectory,
  validatePaths,
  readConfig,
  displayDetectedServices,
  setupAndLink,
  printProjectNotFoundError
};
