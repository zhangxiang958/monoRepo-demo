#!/usr/bin/env node


import meow from 'meow'
import { basename, dirname, relative, join, resolve } from 'path'
import { promises as fs } from 'fs'
import os from 'os'
import { promisify } from 'util'
import { parsePackageSelector, readProjects } from '@pnpm/filter-workspace-packages'
import { globby } from 'globby'
import { create as createTar } from 'tar'
import { pipe as rawPipe } from 'mississippi'

const pipe = promisify(rawPipe)
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
  importMeta: import.meta,
  autoHelp: false,
  allowUnknownFlags: false,
  description: `./${SCRIPT_PATH}`,
  flags: {
    help: { type: 'boolean', shortFlag: 'h' },
    listFiles: { type: 'boolean', shortFlag: 'l' },
    patterns: { type: 'string', shortFlag: 'p', isMultiple: true },
    root: { type: 'string', default: process.cwd() }
  }
});

if (cli.flags.help) {
  cli.showHelp(0)
}

// ================================ execute ==========================================
await parseCli(cli)
  .then(main)
  .catch(err => {
    throw err
  })


// =========================== main entry login ======================================

/**
 * @typedef ParsedCLI
 * @type {object}
 * @property {boolean} listFiles
 * @property {string[]} extraPatterns
 * @property {string} dockerFile
 * @property {string} root
 */

/**
 * @param {ParsedCLI} cli
 */
async function main(cli) {
  const projectPath = dirname(cli.dockerFile)

  // https://pnpm.io/filtering
  const [dependencyFiles, packageFiles, metaFiles] = await Promise.all([
    getFilesFromPnpmSelector(`{${projectPath}}^...`, cli.root, {
      extraPatterns: cli.extraPatterns
    }),
    getFilesFromPnpmSelector(`{${projectPath}}`, cli.root, {
      // 本包目录下除了 Dockerfile 都复制
      extraPatterns: cli.extraPatterns.concat([`!${cli.dockerFile}`])
    }),
    getMetafilesFromPnpmSelector(`{${projectPath}}...`, cli.root, {
      extraPatterns: cli.extraPatterns
    })
  ])

  await withTmpDir(async (tmpdir) => {
    await Promise.all([
      fs.copyFile(cli.dockerFile, join(tmpdir, 'Dockerfile')),
      copyFiles(dependencyFiles, join(tmpdir, 'deps')),
      copyFiles(metaFiles, join(tmpdir, 'meta')),
      copyFiles(packageFiles, join(tmpdir, 'pkg'))
    ])

    const files = await getFiles(tmpdir)
    if (cli.listFiles) {
      for (const path of files) console.log(path)
    } else {
      await pipe(createTar({ gzip: true, cwd: tmpdir }, files), process.stdout)
    }
  })
}

// ============================== pnpm selector function ================================

/**
 * @param {stribng} selector
 * @param {string} cwd
 * @param {object} options
 * @param {string[]} options.extraPatterns
 * @returns {Promise<string[]>}
 */
async function getFilesFromPnpmSelector(selector, cwd, options = {}) {
  const projectPaths = await getPackagePathsFronPnpmSelector(selector, cwd)
  const patterns = projectPaths.concat(options.extraPatterns || [])
  return globby(patterns, {
    cwd,
    dot: true,
    gitignore: false
  })
}

/**
 * 
 * @param {string} selector 
 * @param {string} cwd 
 * @param {object} options 
 * @param {string[]} options.extraPatterns
 * @returns {Promise<string[]>}
 */
async function getMetafilesFromPnpmSelector(selector, cwd, options = {}) {
  const [rootMetas, projectMetas] = await Promise.all([
    globby([
      'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml', 'tsconfig.*.json', 'tsconfig.json', '.pnpmfile.mjs'
    ], { cwd, dot: true, gitignore: false }),
    getPackagePathsFronPnpmSelector(selector, cwd).then(paths => {
      const patterns = paths.map(p => `${p}/**/package.json`).concat(options.extraPatterns || [])
      return globby(patterns, { cwd, dot: true, gitignore: false })
    })
  ])
  return rootMetas.concat(projectMetas)
}

/**
 * 根据 filtering selector 返回对应的包名/路径
 * @param {string} selector 
 * @param {string} cwd 
 */
async function getPackagePathsFronPnpmSelector(selector, cwd) {
  const projects = await readProjects(cwd, [parsePackageSelector(selector, cwd)])
  return Object.keys(projects.selectedProjectsGraph).map(p => relative(cwd, p).replace('\\', '/'))
}



// ==============================  util tools function ===================================

/**
 * @param {string[]} input
 * @param {object} flags
 * @returns {Promise<ParsedCLI>}
 */
async function parseCli({ input, flags }) {
  const dockerFile = input.shift()
  if (!dockerFile) throw new Error('Must specify path to Dockerfile')
  if (!await fileExists(dockerFile)) throw new Error(`Dockerfile not found: ${dockerFile}`)

  return {
    dockerFile,
    extraPatterns: flags.patterns,
    listFiles: flags.listFiles,
    root: flags.root
  }
}

/**
 * @param {string} path
 * @returns {Promise<boolean>}
 */
async function fileExists(path) {
  try {
    await fs.stat(path)
  } catch (err) {
    return false
  }
  return true
}

/**
 * Call `callback` with a temp dir that is cleaned up after runing
 * @param {function(string):Promise<void>} callback
 */
async function withTmpDir (callback) {
  const tmpdir = await fs.mkdtemp(join(os.tmpdir(), SCRIPT_PATH))
  let result
  try {
    result = await callback(tmpdir)
  } finally {
    await fs.rm(tmpdir, { recursive: true })
  }
  return result
}

/**
 * @param {string[]} files
 * @param {string} dstDir
 * @returns {Promise<void>}
 */
async function copyFiles (files, dstDir) {
  return Promise.all(
    files.map(f => {
      const dst = join(dstDir, f)
      return fs.mkdir(dirname(dst), { recursive: true }).then(() => fs.copyFile(f, dst))
    })
  )
}

/**
 * Get relative files recursively from `dir`
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function getFiles (dir) {
  async function * yieldFiles (dirPath) {
    const paths = await fs.readdir(dirPath, { withFileTypes: true })
    for (const path of paths) {
      const res = resolve(dirPath, path.name)
      if (path.isDirectory()) {
        yield * yieldFiles(res)
      } else {
        yield res
      }
    }
  }

  const files = []
  for await (const f of yieldFiles(dir)) {
    files.push(relative(dir, f))
  }
  return files
}
