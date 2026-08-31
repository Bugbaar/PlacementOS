const express = require("express");
const multer = require("multer");
const { extractText, UnsupportedFileError, EmptyResumeError } = require("../services/resumeParser");
const { runAtsChecks } = require("../services/atsChecker");
const { analyzeWithLlm } = require("../services/llmAnalyzer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/analyze", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No resume file uploaded" });
  }

  const targetRole = req.body.targetRole || null;

  let resumeText;
  try {
    resumeText = await extractText(req.file);
  } catch (err) {
    if (err instanceof UnsupportedFileError) {
      return res.status(415).json({ error: "Only PDF and DOCX files are supported" });
    }
    if (err instanceof EmptyResumeError) {
      return res.status(422).json({ error: "Could not read meaningful content from this file" });
    }
    return res.status(500).json({ error: "Failed to parse resume file" });
  }

  const atsResult = runAtsChecks(resumeText, targetRole);
  const llmResult = await analyzeWithLlm(resumeText, targetRole);

  res.json({
    atsScore: atsResult.score,
    breakdown: {
      contact: atsResult.contact,
      sections: atsResult.sections,
      length: atsResult.length,
      keywords: atsResult.keywords,
    },
    overallImpression: llmResult.overallImpression,
    suggestions: llmResult.suggestions,
    missingSections: Array.from(
      new Set([...atsResult.sections.missing, ...llmResult.missingSections])
    ),
  });
});

module.exports = router;
