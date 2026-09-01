const checkEligibility = (studentProfile, placementDrive) => {
  const reasons = [];
  const matchedRequirements = [];

  // Check CGPA
  if (studentProfile.cgpa < placementDrive.minimumCgpa) {
    reasons.push(
      `Minimum CGPA required is ${placementDrive.minimumCgpa}, but your CGPA is ${studentProfile.cgpa}.`
    );
  } else {
    matchedRequirements.push("CGPA requirement satisfied");
  }

  // Check branch
  if (
    placementDrive.eligibleBranches.length > 0 &&
    !placementDrive.eligibleBranches.includes(studentProfile.branch)
  ) {
    reasons.push(
      `Your branch (${studentProfile.branch}) is not eligible for this placement drive.`
    );
  } else {
    matchedRequirements.push("Branch requirement satisfied");
  }

  // Check graduation year
  if (
    placementDrive.eligibleGraduationYears.length > 0 &&
    !placementDrive.eligibleGraduationYears.includes(
      studentProfile.graduationYear
    )
  ) {
    reasons.push(
      `Your graduation year (${studentProfile.graduationYear}) is not eligible.`
    );
  } else {
    matchedRequirements.push("Graduation year requirement satisfied");
  }

  // Normalize skills for case-insensitive comparison
  const studentSkills = studentProfile.skills.map((skill) =>
    skill.toLowerCase()
  );

  const missingSkills = placementDrive.requiredSkills.filter(
    (skill) => !studentSkills.includes(skill.toLowerCase())
  );

  if (missingSkills.length > 0) {
    reasons.push(
      `Missing required skills: ${missingSkills.join(", ")}`
    );
  } else {
    matchedRequirements.push("All required skills satisfied");
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    matchedRequirements,
  };
};

module.exports = {
  checkEligibility,
};