import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  outputError
} from "./chunk-BUZRVER7.js";
import {
  validateJsonOutput
} from "./chunk-XPKWKPWA.js";
import {
  AGENT_REASON
} from "./chunk-QH7WYDEP.js";
import {
  getScope
} from "./chunk-OCEM4YAQ.js";
import {
  getLinkedProject,
  getProjectByNameOrId
} from "./chunk-XHC5YRFY.js";
import {
  buildCommandWithGlobalFlags,
  outputAgentError
} from "./chunk-2QBF3ZL3.js";
import {
  ProjectNotFound,
  isAPIError,
  packageName
} from "./chunk-P6AK7SVK.js";
import {
  output_manager_default
} from "./chunk-OX7KI3LF.js";

// src/commands/vcr/utils/resolve-vcr-scope.ts
function emitVcrScopeError(client, jsonOutput, code, message, agent) {
  outputAgentError(
    client,
    {
      status: "error",
      reason: agent.reason,
      message,
      hint: agent.hint,
      next: agent.next
    },
    1
  );
  return outputError(client, jsonOutput, code, message);
}
async function resolveVcrScope(client, opts) {
  if (opts.project) {
    const { team } = await getScope(client);
    if (!team) {
      const msg = "No team context found. Run `vercel switch` to select a team, or use `vercel link` in a project directory.";
      return emitVcrScopeError(client, opts.jsonOutput, "NO_TEAM", msg, {
        reason: AGENT_REASON.MISSING_SCOPE,
        hint: "Select a team scope before using --project with vcr.",
        next: [
          {
            command: buildCommandWithGlobalFlags(client.argv, "whoami"),
            when: "See current user and team"
          },
          {
            command: buildCommandWithGlobalFlags(client.argv, "teams switch"),
            when: "Switch to a team that owns the project"
          }
        ]
      });
    }
    let projectResult;
    try {
      projectResult = await getProjectByNameOrId(client, opts.project, team.id);
    } catch (err) {
      if (isAPIError(err)) {
        const msg = err.serverMessage || (err.status === 403 ? `You do not have permission to access project "${opts.project}" in team "${team.slug}".` : `API error (${err.status}).`);
        const reason = err.status === 401 ? "not_authorized" : err.status === 403 ? "forbidden" : AGENT_REASON.API_ERROR;
        return emitVcrScopeError(
          client,
          opts.jsonOutput,
          err.code || "API_ERROR",
          msg,
          {
            reason,
            next: [
              {
                command: buildCommandWithGlobalFlags(
                  client.argv,
                  "vcr ls --project <name_or_id>"
                ),
                when: "Retry with a project you can access (replace <name_or_id>)"
              }
            ]
          }
        );
      }
      throw err;
    }
    if (projectResult instanceof ProjectNotFound) {
      const msg = `Project "${opts.project}" was not found in team "${team.slug}".`;
      return emitVcrScopeError(
        client,
        opts.jsonOutput,
        "PROJECT_NOT_FOUND",
        msg,
        {
          reason: AGENT_REASON.NOT_FOUND,
          next: [
            {
              command: buildCommandWithGlobalFlags(client.argv, "project ls"),
              when: "List projects in the current team to pick a name"
            }
          ]
        }
      );
    }
    return {
      teamId: team.id,
      teamSlug: team.slug,
      projectId: projectResult.id,
      projectName: projectResult.name
    };
  }
  const linkedProject = await getLinkedProject(client);
  if (linkedProject.status === "error") {
    return linkedProject.exitCode;
  }
  if (linkedProject.status === "not_linked") {
    const msg = "No linked project found. Run `vercel link` to link a project, or pass --project <name>.";
    return emitVcrScopeError(client, opts.jsonOutput, "NOT_LINKED", msg, {
      reason: AGENT_REASON.NOT_LINKED,
      hint: "Agents should pass --project when no .vercel link exists in --cwd.",
      next: [
        {
          command: buildCommandWithGlobalFlags(client.argv, "link"),
          when: "Link this directory to a Vercel project"
        },
        {
          command: buildCommandWithGlobalFlags(
            client.argv,
            "vcr ls --project <name_or_id>"
          ),
          when: "List repositories for a project without linking (replace <name_or_id>)"
        }
      ]
    });
  }
  return {
    teamId: linkedProject.org.id,
    teamSlug: linkedProject.org.slug,
    projectId: linkedProject.project.id,
    projectName: linkedProject.project.name
  };
}

// src/commands/vcr/utils/validators.ts
function validateVcrJsonOutput(client, flags) {
  const fr = validateJsonOutput(flags);
  if (!fr.valid) {
    outputAgentError(
      client,
      {
        status: "error",
        reason: AGENT_REASON.INVALID_ARGUMENTS,
        message: fr.error
      },
      1
    );
    output_manager_default.error(fr.error);
    return 1;
  }
  return { jsonOutput: fr.jsonOutput };
}
function validateVcrChoice(client, flag, value, choices, jsonOutput) {
  if (value === void 0 || choices.includes(value)) {
    return void 0;
  }
  const message = `Invalid value for ${flag}: "${value}". Must be one of: ${choices.join(", ")}.`;
  outputAgentError(
    client,
    {
      status: "error",
      reason: AGENT_REASON.INVALID_ARGUMENTS,
      message
    },
    1
  );
  return outputError(client, jsonOutput, "INVALID_ARGUMENTS", message);
}
function requireVcrRepository(client, repository, jsonOutput, usage) {
  if (repository) {
    return void 0;
  }
  outputAgentError(
    client,
    {
      status: "error",
      reason: AGENT_REASON.MISSING_ARGUMENTS,
      message: `Missing repository. Example: ${packageName} ${usage}`,
      next: [
        {
          command: buildCommandWithGlobalFlags(client.argv, "vcr ls"),
          when: "List repositories to pick a name or id"
        }
      ]
    },
    1
  );
  return outputError(
    client,
    jsonOutput,
    "MISSING_ARGUMENTS",
    `Usage: \`vercel ${usage}\``
  );
}
function requireVcrRepositoryAndTag(client, repository, tag, jsonOutput, usage) {
  if (repository && tag) {
    return void 0;
  }
  outputAgentError(
    client,
    {
      status: "error",
      reason: AGENT_REASON.MISSING_ARGUMENTS,
      message: `Missing arguments. Example: ${packageName} ${usage}`,
      next: [
        {
          command: buildCommandWithGlobalFlags(
            client.argv,
            "vcr tag ls <repository>"
          ),
          when: "List tags to pick a tag (replace <repository>)"
        }
      ]
    },
    1
  );
  return outputError(
    client,
    jsonOutput,
    "MISSING_ARGUMENTS",
    `Usage: \`vercel ${usage}\``
  );
}
function requireVcrRepositoryAndImageId(client, repository, imageId, jsonOutput, usage) {
  if (repository && imageId) {
    return void 0;
  }
  outputAgentError(
    client,
    {
      status: "error",
      reason: AGENT_REASON.MISSING_ARGUMENTS,
      message: `Missing arguments. Example: ${packageName} ${usage}`,
      next: [
        {
          command: buildCommandWithGlobalFlags(
            client.argv,
            "vcr image ls <repository>"
          ),
          when: "List images to pick an image id (replace <repository>)"
        }
      ]
    },
    1
  );
  return outputError(
    client,
    jsonOutput,
    "MISSING_ARGUMENTS",
    `Usage: \`vercel ${usage}\``
  );
}

// src/commands/vcr/utils/errors.ts
var NOT_AUTHORIZED_MESSAGE = "You do not have access to the container registry in this scope. Ensure your role can manage the project, or pass --token and --scope.";
var NOT_AUTHORIZED_HINT = "Confirm team scope with whoami; use --scope <team-slug> if the repository lives under another team.";
var genericMessage = (err) => err.serverMessage || `API error (${err.status}).`;
var STATUS_INFO = {
  401: {
    reason: "not_authorized",
    message: () => NOT_AUTHORIZED_MESSAGE,
    hint: NOT_AUTHORIZED_HINT,
    suggestWhoami: true
  },
  403: {
    reason: "forbidden",
    message: () => NOT_AUTHORIZED_MESSAGE,
    hint: NOT_AUTHORIZED_HINT,
    suggestWhoami: true
  },
  404: { reason: AGENT_REASON.NOT_FOUND, message: genericMessage },
  409: { reason: "conflict", message: genericMessage },
  429: { reason: "rate_limited", message: genericMessage }
};
function resolveStatusInfo(err) {
  if (STATUS_INFO[err.status]) {
    return STATUS_INFO[err.status];
  }
  if (err.status >= 500) {
    return {
      reason: AGENT_REASON.API_ERROR,
      message: () => `The container registry endpoint failed (${err.status}). Re-run with --debug and share the x-vercel-id from the failed request.`
    };
  }
  return { reason: AGENT_REASON.API_ERROR, message: genericMessage };
}
function handleVcrApiError(client, err, jsonOutput, opts = {}) {
  const info = resolveStatusInfo(err);
  const message = info.message(err);
  const next = [];
  if (info.suggestWhoami) {
    next.push({
      command: buildCommandWithGlobalFlags(client.argv, "whoami"),
      when: "See current user and team"
    });
  }
  if (opts.retry) {
    next.push(opts.retry);
  }
  outputAgentError(
    client,
    {
      status: "error",
      reason: info.reason,
      message,
      ...info.hint ? { hint: info.hint } : {},
      ...next.length > 0 ? { next } : {}
    },
    1
  );
  return outputError(client, jsonOutput, err.code || "API_ERROR", message);
}
function emitVcrArgParseError(client, err, recoverTemplate) {
  const msg = err instanceof Error ? err.message : String(err);
  const projectFlagMissingArg = msg.includes("--project") && msg.includes("requires argument");
  outputAgentError(
    client,
    {
      status: "error",
      reason: AGENT_REASON.INVALID_ARGUMENTS,
      message: projectFlagMissingArg ? "`--project` requires a project name or id (for example `--project my-app`)." : msg,
      next: [
        {
          command: buildCommandWithGlobalFlags(client.argv, recoverTemplate),
          when: projectFlagMissingArg ? "Re-run with a project name or id (replace placeholder)" : "See valid usage"
        }
      ]
    },
    1
  );
}

export {
  resolveVcrScope,
  validateVcrJsonOutput,
  validateVcrChoice,
  requireVcrRepository,
  requireVcrRepositoryAndTag,
  requireVcrRepositoryAndImageId,
  handleVcrApiError,
  emitVcrArgParseError
};
