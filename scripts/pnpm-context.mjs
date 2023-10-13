#!/usr/bin/env node


import meow from 'meow'
import { basename } from 'path'

const SCRIPT_PATH = basename(process.argv[1])

const cli = meow(`
  Usage
    $ ${SCRIPT_PATH} [--patterns=regex]... [--list-files] <Dockerfile-path>

  Options
    --list-files, -l      Don't generate tarball, just list files. Useful for debugging.
    --patterns, -p        Additional .gitignore-like patterns used to include/exclude files (can be specified multiple times).
    --root                Path to the root of the mono repository. Defaults to current working directory.

  Examples
    $ ${SCRIPT_PATH} servers/proxy/Dockerfile
`, {
  importMeta: import.meta
});

