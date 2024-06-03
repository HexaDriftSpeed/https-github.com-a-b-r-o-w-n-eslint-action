import * as esbuild from "esbuild";

async function build() {
  await esbuild.build({
    // input
    entryPoints: ["src/eslint-action.ts"],

    // target
    platform: "node",
    target: "node20.14",
    // output
    outdir: "lib",

    external: ["espree"],

    // optimization
    bundle: true,
    minify: true,
    treeShaking: true,
  });
}

build();
