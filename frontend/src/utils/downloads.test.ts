import { describe, expect, it, vi } from 'vitest';
import type { DetailedApplication, PlacementDrive } from '../types';
import { buildApplicationsCsv, buildCalendarFile } from './downloads';

const drive: PlacementDrive = {
  id: 'drive-1',
  company: 'Nova, Labs',
  companyMark: 'N',
  role: 'Frontend Engineer',
  type: 'Internship',
  location: 'Bengaluru',
  workMode: 'Hybrid',
  salary: '₹45,000 / month',
  closingDate: '2026-09-03T18:30:00.000Z',
  openings: 4,
  description: 'Build thoughtful products.',
  skills: ['React'],
  eligibility: { minCgpa: 7.5, maxActiveBacklogs: 0 },
};

describe('download builders', () => {
  it('creates an interoperable calendar event for a placement deadline', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-31T10:00:00.000Z'));
    const calendar = buildCalendarFile(drive);

    expect(calendar).toContain('BEGIN:VCALENDAR');
    expect(calendar).toContain('DTSTART:20260903T183000Z');
    expect(calendar).not.toContain('DTEND:');
    expect(calendar).toContain('SUMMARY:Nova\\, Labs — Frontend Engineer deadline');
    vi.useRealTimers();
  });

  it('exports application data as escaped CSV', () => {
    const application: DetailedApplication = {
      id: 'application-1',
      studentId: 'student-1',
      driveId: drive.id,
      status: 'interview',
      updatedAt: '2026-08-31T10:00:00.000Z',
      drive,
    };

    const csv = buildApplicationsCsv([application]);
    expect(csv).toContain('Company,Role,Status');
    expect(csv).toContain('"Nova, Labs",Frontend Engineer,interview');
  });
});
