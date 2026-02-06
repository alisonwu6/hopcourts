const { env } = require('./config/env')
const { createApp } = require('./app')

const app = createApp()

app.listen(env.port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${env.port}${env.apiBasePath}`)
})
