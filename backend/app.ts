import cors from "cors";
import "dotenv/config";
import express from "express";
import authRoutes from "./routes/authRoutes";
import channelRoutes from "./routes/channelRoutes";
import workspaceRoutes from "./routes/workspaceRoutes";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/channels", channelRoutes);

export default app;
