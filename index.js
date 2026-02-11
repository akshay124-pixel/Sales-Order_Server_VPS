require('dotenv').config({ path: '/www/wwwroot/Sales_Order-Server/.env' });
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
const logger = require("./utils/logger");
const requestLogger = require("./Middleware/requestLogger");
const app = express();
const server = http.createServer(app);

// ✅ CORS config 
const corsOptions = {
  origin: [
    "https://sales-order-app-eight.vercel.app",// frontend vercel
    "https://sales-order-app-git-staging-akshay124-pixels-projects.vercel.app",
    "https://srv988392.hstgr.cloud", // backend domain
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log requests
app.use(requestLogger);
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
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File size exceeds the maximum limit of 10MB. Please upload a smaller file.'
      });
    }
    return res.status(400).json({ success: false, error: `File upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

// Start server
const PORT = process.env.PORT || 5000;
dbconnect()
  .then(() => {
    server.listen(PORT, () => logger.info(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed", err);
    process.exit(1);
  }); 