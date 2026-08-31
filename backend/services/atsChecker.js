const SECTION_PATTERNS = {
  contact: /(email|phone|linkedin|github)/i,
  experience: /(experience|employment|work history)/i,
  education: /(education|academic)/i,
  skills: /(skills|technical skills|technologies)/i,
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

function checkContactInfo(text) {
  const hasEmail = EMAIL_REGEX.test(text);
  const hasPhone = PHONE_REGEX.test(text);
  return {
    passed: hasEmail && hasPhone,
    hasEmail,
    hasPhone,
  };
}

function checkSections(text) {
  const found = {};
  const missing = [];

  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    const present = pattern.test(text);
    found[section] = present;
    if (!present) missing.push(section);
  }

  return { found, missing, passed: missing.length === 0 };
}

function checkLength(text) {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const passed = wordCount >= 150 && wordCount <= 1200;
  return { wordCount, passed };
}

function checkKeywordDensity(text, targetRole) {
  if (!targetRole) {
    return { applicable: false, matchedKeywords: [], passed: true };
  }

  const roleKeywords = targetRole
    .toLowerCase()
    .split(/[\s,/]+/)
    .filter((w) => w.length > 2);

  const lowerText = text.toLowerCase();
  const matchedKeywords = roleKeywords.filter((kw) => lowerText.includes(kw));

  return {
    applicable: true,
    matchedKeywords,
    matchRatio: matchedKeywords.length / roleKeywords.length,
    passed: matchedKeywords.length / roleKeywords.length >= 0.4,
  };
}

function runAtsChecks(text, targetRole) {
  const contact = checkContactInfo(text);
  const sections = checkSections(text);
  const length = checkLength(text);
  const keywords = checkKeywordDensity(text, targetRole);

  const checks = [contact.passed, sections.passed, length.passed, keywords.passed];
  const passedCount = checks.filter(Boolean).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return {
    score,
    contact,
    sections,
    length,
    keywords,
  };
}

module.exports = { runAtsChecks };
