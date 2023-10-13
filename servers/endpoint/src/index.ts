import Koa from 'koa'
import aegis from 'aegis-web-sdk'
import * as tools from '@pkg/tools'

const app = new Koa()
const PORT = 8080


app.listen(PORT, () => {
    console.log(`endpoint svr is listening ${PORT}`, tools.simpleTool(), tools.simpleToolWithUtil(), aegis)
})
