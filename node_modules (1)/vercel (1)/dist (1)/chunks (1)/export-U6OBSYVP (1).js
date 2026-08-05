import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  ensureProjectLink,
  getRoutes,
  parseSubcommandArgs,
  withGlobalFlags
} from "./chunk-VTA3KZUX.js";
import {
  exportSubcommand
} from "./chunk-QKR7GNAK.js";
import "./chunk-QH7WYDEP.js";
import "./chunk-XHC5YRFY.js";
import {
  outputAgentError
} from "./chunk-2QBF3ZL3.js";
import "./chunk-ECCWJHC6.js";
import "./chunk-EHTPDXTS.js";
import {
  getCommandName
} from "./chunk-P6AK7SVK.js";
import "./chunk-P4QNYOFB.js";
import "./chunk-2RVK3DDN.js";
import {
  output_manager_default
} from "./chunk-OX7KI3LF.js";
import "./chunk-GGP5R3FU.js";
import "./chunk-S7KYDPEM.js";
import "./chunk-TZ2YI2VH.js";

// src/commands/routes/export.ts
function cleanRoute(route) {
  const cleaned = {};
  for (const [key, value] of Object.entries(route)) {
    if (value === void 0)
      continue;
    if (key === "middlewarePath" || key === "middlewareRawSrc" || key === "middleware" || key === "check" || key === "important") {
      continue;
    }
    cleaned[key] = value;
  }
  return cleaned;
}
function routesToVercelJson(rules) {
  const enabledRoutes = rules.filter((r) => r.enabled !== false);
  const cleaned = enabledRoutes.map((r) => cleanRoute(r.route));
  const config = { routes: cleaned };
  return JSON.stringify(config, null, 2);
}
function routesToVercelTs(rules) {
  const enabledRoutes = rules.filter((r) => r.enabled !== false);
  const routeEntries = enabledRoutes.map((r) => {
    const cleaned = cleanRoute(r.route);
    const routeJson = JSON.stringify(cleaned, null, 2);
    const indented = routeJson.split("\n").map((line, i) => i === 0 ? line : `    ${line}`).join("\n");
    if (r.description) {
      const safeDesc = r.description.replace(/\n/g, " ");
      return `    // ${safeDesc}
    ${indented}`;
    }
    return `    ${indented}`;
  });
  const routesContent = routeEntries.length > 0 ? `
${routeEntries.join(",\n")},
  ` : "";
  return `import type { VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  routes: [${routesContent}],
};
`;
}
async function exportRoutes(client, argv) {
  const parsed = await parseSubcommandArgs(argv, exportSubcommand, client);
  if (typeof parsed === "number")
    return parsed;
  const link = await ensureProjectLink(client);
  if (typeof link === "number")
    return link;
  const { project, org } = link;
  const teamId = org.type === "team" ? org.id : void 0;
  const { args, flags } = parsed;
  const format = flags["--format"] || "json";
  const nameOrId = args[0];
  const validFormats = ["json", "ts"];
  if (!validFormats.includes(format)) {
    const msg = `Invalid format: "${format}". Valid formats: ${validFormats.join(", ")}. Usage: ${getCommandName("routes export --format json")}`;
    if (client.nonInteractive) {
      outputAgentError(client, {
        status: "error",
        reason: "invalid_arguments",
        message: msg,
        next: [
          {
            command: withGlobalFlags(client, "routes export --format json")
          }
        ]
      });
      process.exit(1);
    }
    output_manager_default.error(msg);
    return 1;
  }
  output_manager_default.spinner("Fetching routes");
  try {
    const { routes } = await getRoutes(client, project.id, { teamId });
    if (routes.length === 0) {
      output_manager_default.log(
        `No routes found. Create one with ${getCommandName("routes add")}.`
      );
      return 0;
    }
    let routesToExport = routes;
    if (nameOrId) {
      const query = nameOrId.toLowerCase();
      routesToExport = routes.filter(
        (r) => r.name.toLowerCase() === query || r.name.toLowerCase().includes(query) || r.id === nameOrId
      );
      if (routesToExport.length === 0) {
        const msg = `No route found matching "${nameOrId}". Run ${getCommandName("routes list")} to see all routes.`;
        if (client.nonInteractive) {
          outputAgentError(client, {
            status: "error",
            reason: "not_found",
            message: msg,
            next: [{ command: withGlobalFlags(client, "routes list") }]
          });
          process.exit(1);
        }
        output_manager_default.error(msg);
        return 1;
      }
    }
    let result;
    switch (format) {
      case "ts":
        result = routesToVercelTs(routesToExport);
        break;
      default:
        result = routesToVercelJson(routesToExport);
        break;
    }
    output_manager_default.stopSpinner();
    client.stdout.write(result.trimEnd() + "\n");
    return 0;
  } catch (e) {
    const error = e;
    const msg = error.message || "Failed to export routes";
    if (client.nonInteractive) {
      outputAgentError(client, {
        status: "error",
        reason: "api_error",
        message: msg,
        next: [{ command: withGlobalFlags(client, "routes export") }]
      });
      process.exit(1);
    }
    output_manager_default.error(msg);
    return 1;
  }
}
export {
  exportRoutes as default
};
