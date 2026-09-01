/** Canonical skill key so "Node.js", "node.js", and "NodeJS" compare as the same token. */
export function skillKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\.js\b/g, "js")
    .replace(/[^a-z0-9+]/g, "");
}

export function studentSkillKeys(skills: string[]): Set<string> {
  return new Set(skills.map(skillKey).filter(Boolean));
}

export function missingRequiredSkills(
  skills: string[],
  requiredSkills: string[],
  mode: "all" | "any",
): string[] {
  const have = studentSkillKeys(skills);
  const required = requiredSkills.map((s) => s.trim()).filter(Boolean);
  if (required.length === 0) return [];
  if (mode === "any") {
    const anyHit = required.some((skill) => have.has(skillKey(skill)));
    return anyHit ? [] : required;
  }
  return required.filter((skill) => !have.has(skillKey(skill)));
}

export function hasRequiredSkills(
  skills: string[],
  requiredSkills: string[],
  mode: "all" | "any",
): boolean {
  return missingRequiredSkills(skills, requiredSkills, mode).length === 0;
}
