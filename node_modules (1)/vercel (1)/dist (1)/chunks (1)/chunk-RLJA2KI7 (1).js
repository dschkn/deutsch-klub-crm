import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  formatOption,
  limitOption,
  projectOption,
  yesOption
} from "./chunk-EHTPDXTS.js";
import {
  packageName
} from "./chunk-P6AK7SVK.js";

// src/commands/vcr/image/command.ts
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
var imageLsSubcommand = {
  name: "ls",
  aliases: ["list"],
  description: "List images in a container registry repository",
  arguments: [
    {
      name: "repository",
      required: true
    }
  ],
  options: [
    projectScopeOption,
    {
      name: "untagged",
      shorthand: null,
      type: Boolean,
      deprecated: false,
      description: "Only list images that have no tags"
    },
    limitOption,
    cursorOption,
    formatOption
  ],
  examples: [
    {
      name: "List images in a repository",
      value: `${packageName} vcr image ls my-app`
    },
    {
      name: "List untagged images as JSON",
      value: `${packageName} vcr image ls my-app --untagged --format json`
    }
  ]
};
var imageInspectSubcommand = {
  name: "inspect",
  aliases: ["get"],
  description: "Show details for a single image, including its layer history",
  arguments: [
    {
      name: "repository",
      required: true
    },
    {
      name: "imageId",
      required: true
    }
  ],
  options: [projectScopeOption, formatOption],
  examples: [
    {
      name: "Inspect an image by id",
      value: `${packageName} vcr image inspect my-app img_abc123`
    }
  ]
};
var imageRmSubcommand = {
  name: "rm",
  aliases: ["remove", "delete"],
  description: "Delete an image from a repository",
  arguments: [
    {
      name: "repository",
      required: true
    },
    {
      name: "imageId",
      required: true
    }
  ],
  options: [projectScopeOption, yesOption, formatOption],
  examples: [
    {
      name: "Delete an image by id",
      value: `${packageName} vcr image rm my-app img_abc123`
    },
    {
      name: "Delete an image without the confirmation prompt",
      value: `${packageName} vcr image rm my-app img_abc123 --yes`
    }
  ]
};
var imageAggregateCommand = {
  name: "image",
  aliases: ["images"],
  description: "List, inspect, or delete images in a repository",
  arguments: [],
  subcommands: [imageLsSubcommand, imageInspectSubcommand, imageRmSubcommand],
  options: [],
  examples: []
};

export {
  imageLsSubcommand,
  imageInspectSubcommand,
  imageRmSubcommand,
  imageAggregateCommand
};
