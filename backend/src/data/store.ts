import { randomUUID } from 'node:crypto';
import { applications as seedApplications, drives as seedDrives, students as seedStudents } from './seed.js';
import type { Application, ApplicationStatus, PlacementDrive, Student } from '../domain/types.js';

export class PlacementStore {
  private readonly students: Student[];
  private readonly drives: PlacementDrive[];
  private readonly applications: Application[];

  constructor() {
    this.students = structuredClone(seedStudents);
    this.drives = structuredClone(seedDrives);
    this.applications = structuredClone(seedApplications);
  }

  getStudent(id: string) {
    return this.students.find((student) => student.id === id);
  }

  getStudentByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    return this.students.find((student) => student.email.toLowerCase() === normalizedEmail);
  }

  getDemoStudents() {
    return this.students.map(({ id, name, email, program, branch }) => ({
      id,
      name,
      email,
      program,
      branch,
    }));
  }

  updateStudent(id: string, changes: Partial<Omit<Student, 'id' | 'email'>>) {
    const student = this.getStudent(id);
    if (!student) return undefined;
    Object.assign(student, changes);
    return student;
  }

  getDrive(id: string) {
    return this.drives.find((drive) => drive.id === id);
  }

  getDrives() {
    return this.drives;
  }

  getApplication(id: string) {
    return this.applications.find((application) => application.id === id);
  }

  getApplicationsForStudent(studentId: string) {
    return this.applications.filter((application) => application.studentId === studentId);
  }

  createApplication(studentId: string, driveId: string, status: ApplicationStatus) {
    const existing = this.applications.find(
      (application) => application.studentId === studentId && application.driveId === driveId,
    );
    if (existing) return { application: existing, created: false };

    const application: Application = {
      id: randomUUID(),
      studentId,
      driveId,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.applications.push(application);
    return { application, created: true };
  }

  updateApplicationStatus(id: string, status: ApplicationStatus) {
    const application = this.applications.find((candidate) => candidate.id === id);
    if (!application) return undefined;
    application.status = status;
    application.updatedAt = new Date().toISOString();
    return application;
  }
}
