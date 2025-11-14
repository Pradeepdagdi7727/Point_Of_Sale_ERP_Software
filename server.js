require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 4000;
const path = require('path');
// const mysql = require('mysql'); // You might not need these directly in server.js if handled in routes
// const bcrypt = require('bcrypt');

const app = express();
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// use env vars
const loginrouter = require("./routes/login");
app.use('/login',loginrouter);

const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);

const additemrouter = require('./routes/addmenual');
app.use('/additem',additemrouter);

// Import your itemSearchRouter
const itemSearchRouter = require("./routes/itemsearch");

// Mount the itemSearchRouter at TWO DIFFERENT paths
app.use("/search", itemSearchRouter); // Handles /search?q=...
app.use("/items", itemSearchRouter);  // Handles /items/:id (as the router has a '/:id' route)
const invoiceRouter = require("./routes/invoice");
app.use("/invoice", invoiceRouter);
const statsRouter = require("./routes/stats");
app.use("/stats", statsRouter);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});