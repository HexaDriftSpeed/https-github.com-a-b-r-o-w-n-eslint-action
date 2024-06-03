import * as core from "@actions/core";
import * as github from "@actions/github";

import { getPrNumber, getSha } from "./githubUtils";
import { lint } from "./lint";
import { processResults } from "./processResults";

const OWNER = github.context.repo.owner;
const REPO = github.context.repo.repo;

async function run(): Promise<void> {
  const prNumber = getPrNumber();

  try {
    core.info(`PR: ${prNumber}, SHA: ${getSha()}, OWNER: ${OWNER}, REPO: ${REPO}`);

    const report = await lint();
    const result = processResults(report);

    if (result.errorCount > 0) {
      core.setFailed(`${result.errorCount} linting errors found.`);
    }
  } catch (err) {
    if (err instanceof Error && err.message) {
      core.setFailed(err.message);
    } else {
      core.setFailed("Error linting files.");
    }
  }
}

run();
