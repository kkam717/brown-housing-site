import "./loadEnv.js";
import express from "express";
import cors from "cors";
import { reviewsRouter } from "./routes/reviews.js";
import { contactRouter } from "./routes/contact.js";

const app = express();
const port = Number(process.env.PORT) || 3001;

const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(
    cors({
      origin: corsOrigin.split(",").map((o) => o.trim()),
      methods: ["GET", "POST", "OPTIONS"],
    }),
  );
} else {
  app.use(cors());
}

app.use(express.json({ limit: "16kb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

app.use("/api/reviews", reviewsRouter);
app.use("/api/contact", contactRouter);

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: "Not found" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

export default app;
