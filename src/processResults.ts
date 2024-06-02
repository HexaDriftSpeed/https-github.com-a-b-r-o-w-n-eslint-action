import * as core from "@actions/core";
import { ESLint } from "eslint";

import inputs from "./inputs";

const { GITHUB_WORKSPACE } = process.env;

type LintResult = {
  errorCount: number;
  warningCount: number;
};

type AnnotationDetails = {
  file: string;
  startColumn?: number;
  endColumn?: number;
  startLine?: number;
  endLine?: number;
};

export function processResults(results: ESLint.LintResult[]): LintResult {
  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    const { filePath, messages } = result;
    const relFilePath = filePath.replace(`${GITHUB_WORKSPACE}/`, "");

    core.startGroup(relFilePath);

    for (const lintMessage of messages) {
      const { line, endLine, severity, ruleId, message, column, endColumn } = lintMessage;

      // if ruleId is null, it's likely a parsing error, so let's skip it
      if (!ruleId) {
        continue;
      }

      if (severity === 2) {
        errorCount++;
      } else if (inputs.quiet) {
        // skip message if quiet is true
        continue;
      } else if (severity === 1) {
        warningCount++;
      }

      const isMultiLine = endLine && endLine !== line;

      const annotationDetails: AnnotationDetails = {
        file: relFilePath,
        startLine: line,
        endLine,
        // only add column info if error is on a single line
        startColumn: isMultiLine ? undefined : column,
        endColumn: isMultiLine ? undefined : endColumn,
      };

      core.debug(JSON.stringify({ message: `[${ruleId}] ${message}`, ...annotationDetails }));
      if (severity === 1) {
        core.warning(`[${ruleId}] ${message}`, annotationDetails);
      } else {
        core.error(`[${ruleId}] ${message}`, annotationDetails);
      }
    }

    core.endGroup();
  }

  return {
    errorCount,
    warningCount,
  };
}
