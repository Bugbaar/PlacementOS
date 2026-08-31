require("dotenv").config();
const express = require("express");
const cors = require("cors");
const resumeAnalyzeRouter = require("./routes/resumeAnalyze");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/resume", resumeAnalyzeRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Resume AI service running on port ${PORT}`);
});
