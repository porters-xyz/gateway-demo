const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PORTERS API',
      version: '0.0.1',
      description: 'API documentation for the PORTERS endpoints. Refer to https://docs.porters.xyz for more information',
    },
    servers: [
      {
        url: process.env.SERVER_URI,
      },
    ],
  },
  apis: ['./tkn/tkn.js'], // Path to the API docs relative from root
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api-docs/tkn', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
