import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./modules/auth/authRoute.js";
import staffPageRoutes from "./modules/staff/staffpage/staffPageRoute.js";
import staffTypeRoutes from "./modules/staff/stafftype/staffTypeRoute.js";
import cardRoutes from "./modules/staff/card/cardRoute.js";

import assetRoutes from "./modules/machine-maintenance/asset/assetRoute.js";
import spareRoutes from "./modules/machine-maintenance/spare/spareRoute.js";
import taskRoutes from "./modules/machine-maintenance/task/taskRoute.js";
import userAllocationRoutes from "./modules/machine-maintenance/user-allocation/userAllocationRoute.js";
import vendorRoutes from "./modules/machine-maintenance/vendor/vendorRoute.js";

import departmentRoute from "./modules/configure/department/departmentRoute.js";
import shiftTimingRoute from "./modules/configure/shift-timing/shiftTimingRoute.js";
import plantSiteRoute from "./modules/configure/plant-site/plantSiteRoute.js";
import statusRoute from "./modules/configure/status/statusRoute.js";
import criticalLevelRoute from "./modules/configure/critical-level/criticalLevelRoute.js";
import unitOfMeasureRoute from "./modules/configure/unit-of-measure/unitOfMeasureRoute.js";
import taskCategoryRoute from "./modules/configure/task-category/taskCategoryRoute.js";
import frequencyRoute from "./modules/configure/frequency/frequencyRoute.js";
import contractTypeRoute from "./modules/configure/contract-type/contractTypeRoute.js";

dotenv.config();
connectDB();

const app = express();

app.set("trust proxy", 1);
app.set("etag", false);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const envAllowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...new Set([...defaultAllowedOrigins, ...envAllowedOrigins]),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/staff-types", staffTypeRoutes);
app.use("/api/staff-page", staffPageRoutes);
app.use("/api/cards", cardRoutes);

app.use("/api/machine-maintenance/assets", assetRoutes);
app.use("/api/machine-maintenance/spares", spareRoutes);
app.use("/api/machine-maintenance/tasks", taskRoutes);
app.use("/api/machine-maintenance/user-allocations", userAllocationRoutes);
app.use("/api/machine-maintenance/vendors", vendorRoutes);

app.use("/api/configure/departments", departmentRoute);
app.use("/api/configure/shift-timings", shiftTimingRoute);
app.use("/api/configure/plant-sites", plantSiteRoute);
app.use("/api/configure/statuses", statusRoute);
app.use("/api/configure/critical-levels", criticalLevelRoute);
app.use("/api/configure/units-of-measure", unitOfMeasureRoute);
app.use("/api/configure/task-categories", taskCategoryRoute);
app.use("/api/configure/frequencies", frequencyRoute);
app.use("/api/configure/contract-types", contractTypeRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Allowed origins:", allowedOrigins);
});
