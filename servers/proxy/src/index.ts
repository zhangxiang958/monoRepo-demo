import Koa from 'koa'
import * as tools from '@pkg/tools'

const app = new Koa()

app.listen(() => {
    console.log('proxy svr is listening', tools.simpleTool(), tools.simpleToolWithUtil())
})
