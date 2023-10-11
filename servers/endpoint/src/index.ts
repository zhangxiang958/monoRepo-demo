import Koa from 'koa'
import * as tools from '@pkg/tools'

const app = new Koa()

app.listen(8080, () => {
    console.log('endpoint svr is listening', tools.simpleTool(), tools.simpleToolWithUtil())
})
