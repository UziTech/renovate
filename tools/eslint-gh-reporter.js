const { error } = require('@actions/core');
const { issueCommand } = require('@actions/core/lib/command');
const stripAnsi = require('strip-ansi');
const upath = require('upath');

const ROOT = process.cwd();

function getCmd(severity) {
  switch (severity) {
    case 2:
      return 'error';
    case 1:
      return 'warning';
    default:
      return 'debug';
  }
}

function getPath(path) {
  return upath.relative(ROOT, path).replace(/\\/g, '/');
}

/** @type {import('eslint').CLIEngine.Formatter} */
const formatter = (results) => {
  try {
    for (const { filePath, messages } of results) {
      const file = getPath(filePath);
      for (const { severity, line, column, ruleId, message } of messages) {
        const cmd = getCmd(severity);
        const pos = { line: line.toString(), col: column.toString() };
        issueCommand(
          cmd,
          { file, ...pos },
          stripAnsi(`[${ruleId}] ${message}`)
        );
      }
    }
  } catch (e) {
    error(`Unexpected error: ${e.toString()}`);
  }
  return '';
};

module.exports = formatter;