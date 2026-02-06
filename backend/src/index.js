const { createApp } = require('./app')

const app = createApp()

const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://0.0.0.0:${port}${process.env.API_BASE_PATH || ""}`);
});
