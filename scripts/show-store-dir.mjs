#!/usr/bin/env node

import { getStorePath } from '@pnpm/store-path'
console.log('????', getStorePath({ pkgRoot: process.cwd() }))