import * as core from "@actions/core";
import { ESLint } from "eslint";

import inputs from "./inputs";

const { GITHUB_WORKSPACE } = process.env;

type LintResult = {
  errorCount: number;
  warningCount: number;
};

type Annotation = {
  file: string;
  message: string;
  severity: "warning" | "failure";
  col?: number;
  endColumn?: number;
  startLine?: number;
  endLine?: number;
};

function logFileAnnotations(filePath: string, annotations: Annotation[]) {
  core.startGroup(filePath);
  annotations.forEach((a) => {
    const { message, severity, ...annotationDetails } = a;

    core.debug(JSON.stringify(a));
    if (severity === "warning") {
      core.warning(message, annotationDetails);
    } else {
      core.warning(message, annotationDetails);
    }
  });
  core.endGroup();
}

export function processResults(results: ESLint.LintResult[]): LintResult {
  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    const { filePath, messages } = result;
    const relFilePath = filePath.replace(`${GITHUB_WORKSPACE}/`, "");
    const fileAnnotations: Annotation[] = [];

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

      fileAnnotations.push({
        file: relFilePath,
        startLine: line,
        endLine,
        col: column,
        endColumn: endColumn,
        severity: severity === 2 ? "failure" : "warning",
        message: `[${ruleId}] ${message}`,
      });
    }

    logFileAnnotations(relFilePath, fileAnnotations);
  }

  return {
    errorCount,
    warningCount,
  };
}
