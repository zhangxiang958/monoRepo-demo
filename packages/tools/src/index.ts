import { simpleUtil } from '@pkg/utils'

export function simpleTool() {
    console.log('simpleTool')
}

export function simpleToolWithUtil() {
    console.log('simpleTool,', simpleUtil())
}
