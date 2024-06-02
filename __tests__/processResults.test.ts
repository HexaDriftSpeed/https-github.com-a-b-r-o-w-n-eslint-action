import { error, warning, startGroup, endGroup } from "@actions/core";

import inputs from "../src/inputs";
import { processResults } from "../src/processResults";

jest.mock("@actions/core", () => ({
  debug: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
  isDebug: () => true,
}));

jest.mock("../src/inputs", () => ({
  quiet: false,
}));

const errorMsg = {
  line: 10,
  endLine: 10,
  column: 1,
  endColumn: 10,
  severity: 2,
  ruleId: "no-var",
  message: "no var allowed",
};

const warnMsg = {
  line: 5,
  endLine: 5,
  column: 1,
  endColumn: 10,
  severity: 1,
  ruleId: "no-console",
  message: "no console allowed",
};

const multilineMsg = {
  line: 5,
  endLine: 10,
  column: 1,
  endColumn: 10,
  severity: 2,
  ruleId: "no-multiline",
  message: "no multiline allowed",
};

const invalidMsg = {
  line: 1,
  severity: 2,
  column: 1,
  endColumn: 10,
  ruleId: undefined,
  message: "bad rule",
};

const mockResults = [
  {
    filePath: "/foo",
    messages: [errorMsg, warnMsg, { ...errorMsg, line: 20, endLine: 20 }],
  },
  {
    filePath: "/bar",
    messages: [errorMsg, invalidMsg, multilineMsg],
  },
];

it("returns correct error count and warning count", () => {
  // @ts-expect-error
  const result = processResults(mockResults);

  expect(result).toMatchObject({
    errorCount: 4,
    warningCount: 1,
  });
});

it("logs each lint result with file annotations", () => {
  // @ts-expect-error
  processResults(mockResults);

  expect(error).toHaveBeenCalledTimes(4);
  expect(warning).toHaveBeenCalledTimes(1);

  expect(error).toHaveBeenNthCalledWith(1, "[no-var] no var allowed", {
    file: "/foo",
    startLine: 10,
    endLine: 10,
    startColumn: 1,
    endColumn: 10,
  });

  expect(warning).toHaveBeenNthCalledWith(1, "[no-console] no console allowed", {
    file: "/foo",
    startLine: 5,
    endLine: 5,
    startColumn: 1,
    endColumn: 10,
  });

  expect(error).toHaveBeenNthCalledWith(2, "[no-var] no var allowed", {
    file: "/foo",
    startLine: 20,
    endLine: 20,
    startColumn: 1,
    endColumn: 10,
  });

  expect(error).toHaveBeenNthCalledWith(3, "[no-var] no var allowed", {
    file: "/bar",
    startLine: 10,
    endLine: 10,
    startColumn: 1,
    endColumn: 10,
  });

  expect(error).toHaveBeenNthCalledWith(4, "[no-multiline] no multiline allowed", {
    file: "/bar",
    startLine: 5,
    endLine: 10,
  });
});

it("does not include warnings if quiet option is true", () => {
  Object.defineProperty(inputs, "quiet", {
    get: () => true,
  });
  // @ts-expect-error
  const result = processResults(mockResults);
  expect(result).toMatchObject({
    errorCount: 4,
    warningCount: 0,
  });
  expect(warning).not.toHaveBeenCalledWith("[no-console] no console allowed", expect.any(Object));
});

it("groups log output by file", () => {
  // @ts-expect-error
  processResults(mockResults);

  expect(startGroup).toHaveBeenCalledTimes(2);
  expect(endGroup).toHaveBeenCalledTimes(2);

  expect(startGroup).toHaveBeenNthCalledWith(1, "/foo");
  expect(startGroup).toHaveBeenNthCalledWith(2, "/bar");
});
