const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SportsMatch API',
      version: '1.0.0',
      description: 'API documentation for SportsMatch backend',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local server' },
      // { url: 'https://api.sportsmatch.com', description: 'Production' },
    ],
  },
  apis: ['./src/routes/*.js'],
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec
