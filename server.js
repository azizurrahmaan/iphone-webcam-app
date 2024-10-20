const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Setup Multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Endpoint to receive uploaded images
app.post("/upload", upload.single("photo"), (req, res) => {
  console.log("Image received:", req.file.filename);
  res.status(200).send("Image uploaded successfully");
});

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("Client connected via WebSocket");

  // Example: Send a signal to capture a picture every minute
  const interval = setInterval(() => {
    console.log("Sending capture signal to client");

    const signal = { capture: true, timestamp: Date.now() };
    console.log("Sent signal: " + JSON.stringify(signal));
    ws.send(JSON.stringify(signal));
  }, 60000); // every 60 seconds

  ws.on("close", () => {
    clearInterval(interval);
    console.log("Client disconnected");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
