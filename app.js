const express = require("express");
const connectToDb = require("./config/connectToDb");
const { errorHandler, notFound } = require("./middlewares/error");
const cors = require("cors");
require("dotenv").config();
const colors = require("colors");

// Connection To Db
connectToDb();

// Init App
const app = express();

// تعريف محرك العرض EJS
app.set("view engine", "ejs");

// Middlewares
app.use(express.json());

// Cors Policy
app.use(
  cors({
    origin: "*",
  })
);

// Routes
app.use("/api/users/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);
