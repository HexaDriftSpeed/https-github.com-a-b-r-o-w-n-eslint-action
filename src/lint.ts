import path from "path";

import * as core from "@actions/core";
import { ESLint } from "eslint";
import * as _espree from "espree";

import inputs from "./inputs";

export async function lint(): Promise<ESLint.LintResult[]> {
  let cwd = inputs.cwd;

  /* istanbul ignore else */
  if (cwd && !path.isAbsolute(cwd)) {
    cwd = path.resolve(cwd);
  } else if (!cwd) {
    cwd = process.cwd();
  }

  core.debug(`Starting lint engine with cwd: ${cwd}`);

  const linter = new ESLint({
    cwd,
    extensions: inputs.extensions,
    overrideConfig: {
      ignorePatterns: inputs.ignore,
    },
  });

  const result = await linter.lintFiles(inputs.files);

  return result;
}

export const espree = _espree;
