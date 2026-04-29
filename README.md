# Eslint Annotate

![Unit Tests](https://github.com/a-b-r-o-w-n/eslint-action/workflows/Unit%20Tests/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/a-b-r-o-w-n/es.svg?branch=main)](https://coveralls.io/github/a-b-r-o-w-n/eslint-action?branch=main)



on: [pull_request, push]

    steps:
      - uses: actions/checkout@v1
      - uses: a-b-r-o-w-n/eslint-action@v2
        with:
          repo-token: "${{ secrets.GITHUB_TOKEN }}"
          files: "src/**/*"
          ignore: "src/some-file-to-ignore.js"
          extensions: ".
