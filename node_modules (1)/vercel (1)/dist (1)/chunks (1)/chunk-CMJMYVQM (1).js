import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __dirname_ } from 'node:path';
const require = __createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_(__filename);
import {
  require_bytes
} from "./chunk-P6AK7SVK.js";
import {
  require_ms
} from "./chunk-GGP5R3FU.js";
import {
  __toESM
} from "./chunk-TZ2YI2VH.js";

// src/commands/vcr/utils/format.ts
var import_ms = __toESM(require_ms(), 1);
var import_bytes = __toESM(require_bytes(), 1);
function formatBytes(size) {
  if (typeof size !== "number" || Number.isNaN(size)) {
    return "-";
  }
  return import_bytes.default.format(size, { decimalPlaces: 1 }) ?? "-";
}
function formatRelativeTime(iso) {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) {
    return "-";
  }
  return `${(0, import_ms.default)(Date.now() - time)} ago`;
}
function formatDigest(digest) {
  if (!digest) {
    return "-";
  }
  return digest.replace(/^sha256:/, "").slice(0, 12);
}
function formatImageStatus(status) {
  switch (status) {
    case "ready":
      return "Ready";
    case "preparing":
      return "Preparing";
    case "unoptimized":
      return "Ready (unoptimized)";
    default:
      return "-";
  }
}
var VCR_REGISTRY = "vcr.vercel.com";
function formatImageReference(teamSlug, projectName, repositoryName, digest) {
  if (!digest) {
    return "-";
  }
  return `${VCR_REGISTRY}/${teamSlug}/${projectName}/${repositoryName}@${digest}`;
}
function formatTagReference(teamSlug, projectName, repositoryName, tag) {
  if (!tag) {
    return "-";
  }
  return `${VCR_REGISTRY}/${teamSlug}/${projectName}/${repositoryName}:${tag}`;
}

export {
  formatBytes,
  formatRelativeTime,
  formatDigest,
  formatImageStatus,
  VCR_REGISTRY,
  formatImageReference,
  formatTagReference
};
