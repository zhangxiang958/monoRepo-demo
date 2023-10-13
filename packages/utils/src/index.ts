import { callMeApiProxy } from '@pkg/types/lib/api/api-proxy'


export function simpleUtil(): string {
    console.log('simpleUtil')
    callMeApiProxy()
    return "util"
}
