'use strict';

const { debuglog } = require('util');
const Walker = require('node-source-walk');
const gonzales = require('gonzales-pe');

const debug = debuglog('detective-less');

/**
 * Extract the @import statements from a given less file's content
 *
 * @param  {String} content
 * @param  {Object} options
 * @param  {Boolean} options.url - detect any url() references to images, fonts, etc.
 * @return {String[]}
 */
module.exports = function detective(content, options = {}) {
  if (content === undefined) throw new Error('content not given');
  if (typeof content !== 'string') throw new Error('content is not a string');

  let ast = {};

  try {
    debug('content: %s', content);
    ast = gonzales.parse(content, { syntax: 'less' });
  } catch (error) {
    debug('parse error: %s', error.message);
  }

  detective.ast = ast;

  const walker = new Walker();
  const dependencies = [];

  walker.walk(ast, node => {
    if (isImportStatement(node)) {
      dependencies.push(...extractDependencies(node, ['string', 'ident']));
      return;
    }

    if (options.url && node.type === 'uri') {
      dependencies.push(...extractDependencies(node, ['string', 'ident', 'raw']));
    }
  });

  return dependencies;
};

function isImportStatement(node) {
  if (!node || node.type !== 'atrule') return false;
  if (node.content.length === 0 || node.content[0].type !== 'atkeyword') return false;

  const atKeyword = node.content[0];

  if (atKeyword.content.length === 0) return false;

  return atKeyword.content[0].content === 'import';
}

function extractDependencies(importStatementNode, innerNodeTypes) {
  return importStatementNode.content
    .filter(innerNode => innerNodeTypes.includes(innerNode.type))
    .map(identifierNode => identifierNode.content.replaceAll(/["']/g, ''));
}
