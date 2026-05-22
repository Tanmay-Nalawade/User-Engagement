const mongoose = require("mongoose");

const formatMongoError = (error, uri) => {
  const msg = error.message || String(error);

  if (msg.includes("querySrv ECONNREFUSED") || msg.includes("ECONNREFUSED")) {
    const hostMatch = uri.match(/@([^/?]+)/);
    const host = hostMatch ? hostMatch[1] : "your-cluster";

    return [
      `MongoDB DNS lookup failed inside Docker (${msg}).`,
      "Fix options:",
      "  1. Rebuild after docker-compose DNS update: docker compose up --build",
      "  2. In Atlas → Connect → Drivers, copy the connection string again.",
      `     Host should look like cluster0.xxxxx.mongodb.net (yours may be ${host}).`,
      "  3. Or use a standard (non-SRV) URI — see README “MongoDB in Docker”.",
      "  4. Atlas → Network Access → allow your IP (or 0.0.0.0/0 for dev).",
    ].join("\n");
  }

  if (msg.includes("authentication failed") || msg.includes("bad auth")) {
    return "MongoDB authentication failed — check username/password in MONGODB_URI.";
  }

  if (msg.includes("whitelist") || msg.includes("IP")) {
    return "MongoDB blocked this IP — add it in Atlas → Network Access.";
  }

  return msg;
};

const connectDatabase = async () => {
  const uri = process.env.MONGODB_URI_STANDARD || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in .env");
  }

  if (uri.includes("<") || uri.includes("cluster>")) {
    throw new Error(
      "MONGODB_URI still has placeholder values — paste the real string from Atlas → Connect → Drivers",
    );
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });

    const { host, name } = mongoose.connection;
    console.log(`Connected to MongoDB — database: ${name}, host: ${host}`);
  } catch (error) {
    throw new Error(formatMongoError(error, uri));
  }
};

module.exports = { connectDatabase, mongoose };
