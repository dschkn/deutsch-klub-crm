'use strict';

const fs = require('fs');
const path = require('path');
const { debuglog } = require('util');

const debug = debuglog('stylus-lookup');

/**
 * Determines the resolved dependency path according to
 * the Stylus compiler's dependency lookup behavior.
 *
 * Resolution order:
 * 1. Relative to `filename`
 * 2. Relative to the directory containing `filename`
 * 3. As an `index.styl` inside a subdirectory relative to `filename`'s directory
 *
 * @param  {Object} options
 * @param  {String} options.dependency  - The import/require name (e.g. `'variables'` or `'partials/reset'`)
 * @param  {String} options.filename    - Absolute or relative path to the file that contains the import
 * @param  {String} options.directory   - Root directory of all Stylus files (reserved; not yet used in resolution)
 * @return {String} The resolved absolute path to the dependency file, or an empty string if it cannot be found
 */
module.exports = function({ dependency, filename, directory } = {}) {
  if (dependency === undefined) throw new Error('dependency is not supplied');
  if (filename === undefined) throw new Error('filename is not supplied');
  if (directory === undefined) throw new Error('directory is not supplied');

  const fileDir = path.dirname(filename);

  debug(`trying to resolve: ${dependency}`);
  debug(`filename: ${filename}`);
  debug(`directory: ${directory}`);

  // Use the file's extension if necessary
  const extension = path.extname(dependency) ? '' : path.extname(filename);

  if (!path.isAbsolute(dependency)) {
    const resolved = path.resolve(filename, dependency) + extension;

    debug(`resolved relative dependency: ${resolved}`);

    if (fs.existsSync(resolved)) return resolved;

    debug('resolved file does not exist');
  }

  const sameDir = path.resolve(fileDir, dependency) + extension;
  debug(`resolving dependency about the parent file's directory: ${sameDir}`);

  if (fs.existsSync(sameDir)) return sameDir;

  debug(`resolved file does not exist: ${sameDir}`);

  // Check for dependency/index.styl file
  const indexFile = path.join(path.resolve(fileDir, dependency), 'index.styl');
  debug(`resolving dependency as if it points to an index.styl file: ${indexFile}`);

  if (fs.existsSync(indexFile)) return indexFile;

  debug(`resolved file does not exist: ${indexFile}`);
  debug('could not resolve the dependency');

  return '';
};
