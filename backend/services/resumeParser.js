const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

class UnsupportedFileError extends Error {
  constructor(mimetype) {
    super(`Unsupported file type: ${mimetype}`);
    this.name = "UnsupportedFileError";
  }
}

class EmptyResumeError extends Error {
  constructor() {
    super("Resume appears to be empty or unreadable");
    this.name = "EmptyResumeError";
  }
}

async function extractFromPdf(buffer) {
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function extractText(file) {
  let rawText;

  if (file.mimetype === "application/pdf") {
    rawText = await extractFromPdf(file.buffer);
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    rawText = await extractFromDocx(file.buffer);
  } else {
    throw new UnsupportedFileError(file.mimetype);
  }

  const cleaned = rawText.replace(/\s+/g, " ").trim();

  if (cleaned.length < 50) {
    throw new EmptyResumeError();
  }

  return cleaned;
}

module.exports = { extractText, UnsupportedFileError, EmptyResumeError };
