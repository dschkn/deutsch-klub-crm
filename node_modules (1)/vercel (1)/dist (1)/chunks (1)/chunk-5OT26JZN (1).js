import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  tagsAggregateCommand
} from "./chunk-7C7MMT4J.js";
import {
  imageAggregateCommand
} from "./chunk-RLJA2KI7.js";
import {
  formatOption,
  limitOption,
  projectOption,
  yesOption
} from "./chunk-EHTPDXTS.js";
import {
  packageName
} from "./chunk-P6AK7SVK.js";

// src/commands/vcr/command.ts
var projectScopeOption = {
  ...projectOption,
  shorthand: "p",
  description: "Project name or ID (defaults to the linked project)."
};
var cursorOption = {
  name: "cursor",
  shorthand: "c",
  type: String,
  deprecated: false,
  description: "Cursor from a previous page to continue listing from",
  argument: "STRING"
};
var listSubcommand = {
  name: "ls",
  aliases: ["list"],
  description: "List container registry repositories for a project",
  arguments: [],
  options: [projectScopeOption, limitOption, cursorOption, formatOption],
  examples: [
    {
      name: "List repositories in the linked project",
      value: `${packageName} vcr ls`
    },
    {
      name: "List repositories for a specific project as JSON",
      value: `${packageName} vcr ls --project my-app --format json`
    }
  ]
};
var inspectSubcommand = {
  name: "inspect",
  aliases: ["get"],
  description: "Show details for a single repository",
  arguments: [
    {
      name: "repository",
      required: true
    }
  ],
  options: [projectScopeOption, formatOption],
  examples: [
    {
      name: "Inspect a repository by name",
      value: `${packageName} vcr inspect my-repository`
    }
  ]
};
var addSubcommand = {
  name: "add",
  aliases: ["create"],
  description: "Create a container registry repository",
  arguments: [
    {
      name: "name",
      required: true
    }
  ],
  options: [projectScopeOption, formatOption],
  examples: [
    {
      name: "Create a repository",
      value: `${packageName} vcr add my-repository`
    }
  ]
};
var removeSubcommand = {
  name: "rm",
  aliases: ["remove", "delete"],
  description: "Delete a container registry repository",
  arguments: [
    {
      name: "repository",
      required: true
    }
  ],
  options: [projectScopeOption, yesOption, formatOption],
  examples: [
    {
      name: "Delete a repository",
      value: `${packageName} vcr rm my-repository`
    },
    {
      name: "Delete a repository without the confirmation prompt",
      value: `${packageName} vcr rm my-repository --yes`
    }
  ]
};
var loginSubcommand = {
  name: "login",
  aliases: [],
  description: "Authenticate a container tool (docker, podman, or buildah) with the Vercel Container Registry",
  arguments: [
    {
      name: "engine",
      required: true
    }
  ],
  options: [projectScopeOption, formatOption],
  examples: [
    {
      name: "Log in with Docker",
      value: `${packageName} vcr login docker`
    },
    {
      name: "Log in with Podman",
      value: `${packageName} vcr login podman`
    },
    {
      name: "Log in with Buildah",
      value: `${packageName} vcr login buildah`
    },
    {
      name: "Log in for a specific project",
      value: `${packageName} vcr login docker --project my-app`
    }
  ]
};
var vcrCommand = {
  name: "vcr",
  aliases: [],
  description: "Manage Vercel Container Registry repositories and images (see `vcr image`).",
  arguments: [],
  subcommands: [
    listSubcommand,
    inspectSubcommand,
    addSubcommand,
    removeSubcommand,
    loginSubcommand,
    tagsAggregateCommand,
    imageAggregateCommand
  ],
  options: [],
  examples: [
    {
      name: "List repositories in the linked project",
      value: `${packageName} vcr ls`
    },
    {
      name: "Create a repository",
      value: `${packageName} vcr add my-app`
    },
    {
      name: "List images in a repository",
      value: `${packageName} vcr image ls my-app`
    }
  ]
};

export {
  listSubcommand,
  inspectSubcommand,
  addSubcommand,
  removeSubcommand,
  loginSubcommand,
  vcrCommand
};
