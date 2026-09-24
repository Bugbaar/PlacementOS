import type { Student } from '../store/studentSlice';

export const buildPlacementInsights = (student: Student | null): string[] => {
  if (!student) return [];

  const insights: string[] = [];

  if (student.skills.length > 0) {
    insights.push(`You already have **${student.skills[0]}** in your profile, which is a strong anchor for your placement narrative.`);
  }

  if (student.preferredRoles.length > 0) {
    insights.push(`Your top target role is **${student.preferredRoles[0]}**. Keep tailoring your projects and resume to that track.`);
  }

  if (student.cgpa >= 8) {
    insights.push('Your CGPA clears a strong shortlist threshold for many internship opportunities.');
  } else {
    insights.push('A slightly higher CGPA would improve eligibility for more competitive roles.');
  }

  if (!student.resumeUrl) {
    insights.push('Adding a resume link would make your profile more complete and easier to evaluate.');
  }

  if (student.preferredLocations.length > 0) {
    insights.push(`You are open to ${student.preferredLocations[0]}, so keep an eye on opportunities in that market.`);
  }

  return insights.slice(0, 3);
};