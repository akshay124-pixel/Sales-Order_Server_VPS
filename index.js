require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const multer = require("multer");

const SignupRoute = require("./Router/SignupRoute");
const LoginRoute = require("./Router/LoginRoute");
const Routes = require("./Router/Routes");
const dbconnect = require("./utils/dbconnect");
const Controller = require("./Controller/Logic");

const app = express();
const server = http.createServer(app);

// ✅ CORS config 
const corsOptions = {
  origin: [
    "https://sales-order-app-eight.vercel.app", // frontend vercel
    "https://srv988392.hstgr.cloud",            // backend domain
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization","Accept"],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));

// Routes
app.use("/api", Routes);
app.use("/auth", LoginRoute);
app.use("/user", SignupRoute);

// Socket.IO init
Controller.initSocket(server, app);

// Error handling
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
dbconnect()
  .then(() => {
    server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }); 