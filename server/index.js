import express from "express";
import cors from "cors";
import couchbase from "couchbase";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// Couchbase connection
const clusterConnStr = process.env.COUCHBASE_CONNSTR;
const username = process.env.COUCHBASE_USER;
const password = process.env.COUCHBASE_PASS;
const bucketName = process.env.COUCHBASE_BUCKET;

let collection;

(async () => {
  try {
    const cluster = await couchbase.connect(clusterConnStr, {
      username,
      password,
    });
    const bucket = cluster.bucket(bucketName);
    collection = bucket.defaultCollection();
    console.log("✅ Connected to Couchbase");
  } catch (err) {
    console.error("❌ Couchbase connection failed:", err);
  }
})();

// API routes
app.post("/api/punch", async (req, res) => {
  try {
    const time = req.body.time;
    const id = `punch::${Date.now()}`;
    await collection.insert(id, { time, createdAt: new Date().toISOString() });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save punch" });
  }
});

app.get("/api/punches", async (req, res) => {
  try {
    const query = `SELECT time, createdAt FROM \`${bucketName}\`._default._default ORDER BY createdAt DESC LIMIT 20`;
    const cluster = await couchbase.connect(clusterConnStr, {
      username,
      password,
    });
    const result = await cluster.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch punches" });
  }
});

// ✅ Serve React frontend (this fixes "Cannot GET /")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../client/build");

app.use(express.static(clientBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuildPath, "index.html"));
});

// Listen on Render's port
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
