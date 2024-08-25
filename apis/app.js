const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Import the tkn routes
const tknRoutes = require('./tkn/tkn');

app.use(cors());
app.use(express.json());

// Define the TKN Api routes and Swagger
app.use('/tkn/v1', tknRoutes);
const setupTknSwagger = require('./tkn/tkn-swagger'); // Import Swagger setup
setupTknSwagger(app);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
