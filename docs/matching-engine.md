# Explainable Matching Engine

The matching engine is a core feature of the PlacementOS MVP. It determines how suitable a student is for a given opportunity.

The process consists of two stages: **Eligibility** and **Scoring**.

## 1. Eligibility (Hard Constraints)

Before a score is calculated, the system checks if the student meets the hard constraints of the opportunity.

- **Status**: Opportunity must be 'active'.
- **Deadline**: Application deadline must not have passed.
- **CGPA**: Student's CGPA `>`= Opportunity's minimum CGPA.
- **Branch**: Student's branch must be in the `eligibleBranches` list.
- **Graduation Year**: Student's graduation year must be in the `eligibleGraduationYears` list.

If a student fails any of these checks, `eligible` is set to `false`, and the reasons are recorded.

## 2. Match Scoring (Weighted Formula)

If a student is eligible (or even if they aren't, to show what they are missing), a match score out of 100 is calculated based on a weighted formula:

### Technical Skill Match (60%)
- **Normalization**: Both student skills and required skills are converted to lowercase and trimmed.
- **Calculation**: `(Matched Required Skills / Total Required Skills) * 60`
- Example: If a job requires React, Node, and MongoDB, and the student has React and Node, they get `(2/3) * 60 = 40` points.

### Academic Match (20%)
- If the student's CGPA is greater than or equal to the minimum required, they get a base of 10 points.
- They get up to 10 bonus points based on how far above the minimum their CGPA is.
- Total maximum: 20 points.

### Role Preference (10%)
- If the student's `preferredRoles` array contains a substring of the opportunity `title`, they receive 10 points.
- If no preferences are set, they receive a neutral 5 points.

### Location Preference (10%)
- If the student's `preferredLocations` matches the opportunity `location`, they receive 10 points.
- Special handling for "Remote": If the job is remote and the student prefers remote, they get full points.
- If no preferences are set, they receive a neutral 5 points.

## Final Output

The engine returns:
- `eligible` (boolean)
- `matchScore` (number 0-100)
- `matchedSkills` (array of strings)
- `missingSkills` (array of strings)
- `scoreBreakdown` (object showing the score for each category)
- `reasons` (array of reasons why they are ineligible, if applicable)
