require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const { connectDatabase } = require("./config/database");
const healthRoutes = require("./routes/health");
const interestsRoutes = require("./routes/interests");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

app.use((req, res, next) => {
  if (req.path.startsWith("/interests") && req.method !== "GET") {
    console.log(`[${req.method}] ${req.path}`, req.body);
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use("/health", healthRoutes);
app.use("/interests", interestsRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`User engagement API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
