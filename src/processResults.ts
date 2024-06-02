import * as core from "@actions/core";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { ESLint } from "eslint";

import inputs from "./inputs";

const { GITHUB_WORKSPACE } = process.env;

export const CHECK_NAME = "ESLint";

function logFileAnnotations(filePath: string, annotations: any[]) {
  core.startGroup(filePath);
  annotations.forEach((a) => {
    const { message, annotationLevel, startLine, endLine, column, endColumn } = a;

    if (annotationLevel === "warning") {
      core.warning(message, { file: filePath, startColumn: column, endColumn, startLine: startLine, endLine });
      // core.warning(`${message} (Line ${start_line})`);
    } else {
      core.warning(message, { file: filePath, startColumn: column, endColumn, startLine: startLine, endLine });
      // core.error(`${message} (Line ${start_line})`);
    }
  });
  core.endGroup();
}

export function processResults(
  results: ESLint.LintResult[],
): Partial<RestEndpointMethodTypes["checks"]["update"]["parameters"]> {
  const annotations: any[] = [];

  let errorCount = 0;

  for (const result of results) {
    const { filePath, messages } = result;
    const relFilePath = filePath.replace(`${GITHUB_WORKSPACE}/`, "");
    const fileAnnotations: any[] = [];

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
      }

      fileAnnotations.push({
        path: relFilePath,
        startLine: line,
        endLine,
        col: column,
        endColumn: endColumn,
        annotationLevel: severity === 2 ? "failure" : "warning",
        message: `[${ruleId}] ${message}`,
      });
    }

    // annotations.push(...fileAnnotations);
    // if (core.isDebug()) {
    //   logFileAnnotations(relFilePath, fileAnnotations);
    // }
    logFileAnnotations(relFilePath, fileAnnotations);
  }

  return {
    conclusion: errorCount > 0 ? "failure" : "success",
    output: {
      title: CHECK_NAME,
      summary: `${errorCount} error(s) found`,
      annotations,
    },
  };
}
