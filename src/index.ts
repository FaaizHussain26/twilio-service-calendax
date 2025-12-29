// src/index.ts
import express from "express";
import passport from "passport";
import connectDB from "./config/database";
import { verifyPgConnection } from "./config/pg";
import authRoutes from "./routes/auth.route";
import fileUploadRoutes from "./routes/file-upload.route";
import YAML from "yaml";
import fs from "fs";
import path from "path";
import "./config/passport";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import protocolDetailsRoutes from "./routes/uploaded-protocol-details.route";
import questionnaireRoutes from "./routes/questionnaire.route";
import interestFormRoutes from "./routes/interest-form.route";
import patientFollowupStatusRoutes from "./routes/patient-followup-status.route";
import { variables } from "./constants/variables";
import manualscreening from "./routes/manual-screening.route";
import dashboardRoutes from "./routes/dashboard.route";
import { authenticateToken } from "./middleware/auth.middleware";
import patientTranscriptDetailRoutes from "./routes/patient-transcript-details.route";
import outcomesLeadsRoutes from "./routes/outcome-lead.route";
import twilioRoutes from "./routes/twilio.route";
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio webhook form data
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://calendax-frontend.vercel.app",
      "https://calendax-hightower.vercel.app",
      "https://calendax-revival.vercel.app",
    ],
    credentials: true,
  })
);
app.use(passport.initialize());
connectDB();

verifyPgConnection()
  .then(() => console.log("Postgres connected"))
  .catch((e) => {
    console.error("Postgres connection error:", e);
    process.exit(1);
  });

const swaggerDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, "../swagger.yaml"), "utf8")
);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/auth", authRoutes);
app.use("/api/interest-form", interestFormRoutes);
app.use("/api/outcomes", outcomesLeadsRoutes);
app.use("/api/protocol-details", protocolDetailsRoutes);
app.use("/api/twilio", twilioRoutes);

app.use("/api", authenticateToken);
app.use("/api/file", fileUploadRoutes);
app.use("/api/questionnaire", questionnaireRoutes);
app.use("/api/manual-screening", manualscreening);
app.use("/api/patient-followup-status", patientFollowupStatusRoutes);
app.use("/api/patient-transcript-details", patientTranscriptDetailRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.listen(variables.PORT, () =>
  console.log(`Server running on port ${variables.PORT}`)
);
