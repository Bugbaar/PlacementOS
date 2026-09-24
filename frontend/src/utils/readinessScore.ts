import type { Student } from '../store/studentSlice';

export const calculateReadinessScore = (student: Student | null): number => {
  if (!student) return 0;

  let score = 50;
  if (student.cgpa >= 8) score += 15;
  if (student.skills.length >= 5) score += 15;
  if (student.preferredRoles.length > 0) score += 10;
  if (student.resumeUrl) score += 10;
  return Math.min(score, 100);
};