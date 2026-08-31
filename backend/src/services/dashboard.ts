import type { PlacementStore } from '../data/store.js';
import { evaluateEligibility } from '../domain/eligibility.js';

export function buildStudentDashboard(store: PlacementStore, studentId: string) {
  const student = store.getStudent(studentId);
  if (!student) return undefined;

  const applications = store.getApplicationsForStudent(studentId);
  const applicationByDrive = new Map(applications.map((item) => [item.driveId, item]));
  const drives = store.getDrives().map((drive) => ({
    ...drive,
    eligibilityDecision: evaluateEligibility(student, drive),
    application: applicationByDrive.get(drive.id) ?? null,
  }));

  const detailedApplications = applications.flatMap((application) => {
    const drive = store.getDrive(application.driveId);
    return drive ? [{ ...application, drive }] : [];
  });

  return {
    student,
    drives,
    applications: detailedApplications,
    stats: {
      eligibleDrives: drives.filter((drive) => drive.eligibilityDecision.eligible).length,
      totalApplications: applications.length,
      interviews: applications.filter((item) => item.status === 'interview').length,
      offers: applications.filter((item) => item.status === 'offered').length,
    },
  };
}

