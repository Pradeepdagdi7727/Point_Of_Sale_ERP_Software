require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 4000;
const path = require('path');

const app = express();


app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


const loginrouter = require("./routes/login");
app.use('/login', loginrouter);

const dashboardRouter = require('./routes/dashboard');
app.use('/dashboard', dashboardRouter);

const additemrouter = require('./routes/addmenual');
app.use('/additem', additemrouter);


const itemSearchRouter = require("./routes/itemsearch");
app.use("/search", itemSearchRouter);
app.use("/items", itemSearchRouter);

const invoiceRouter = require("./routes/invoice");
app.use("/invoice", invoiceRouter);

const statsRouter = require('./routes/stats');
app.use("/stats", statsRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});