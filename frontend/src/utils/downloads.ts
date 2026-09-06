import type { DetailedApplication, PlacementDrive } from '../types';

function saveFile(contents: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function escapeCalendar(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function calendarDate(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildCalendarFile(drive: PlacementDrive) {
  const deadline = calendarDate(drive.closingDate);
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PlacementOS//Placement deadline//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeCalendar(drive.id)}@placementos`,
    `DTSTAMP:${calendarDate(new Date().toISOString())}`,
    `DTSTART:${deadline}`,
    `SUMMARY:${escapeCalendar(`${drive.company} — ${drive.role} deadline`)}`,
    `DESCRIPTION:${escapeCalendar(`${drive.type} · ${drive.workMode} · ${drive.salary}`)}`,
    `LOCATION:${escapeCalendar(drive.location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function downloadCalendarEvent(drive: PlacementDrive) {
  const filename = `${drive.company}-${drive.role}-deadline.ics`.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
  saveFile(buildCalendarFile(drive), filename, 'text/calendar;charset=utf-8');
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildApplicationsCsv(applications: DetailedApplication[]) {
  const rows = applications.map((application) => [
    application.drive.company,
    application.drive.role,
    application.status,
    application.drive.type,
    `${application.drive.location} · ${application.drive.workMode}`,
    application.drive.closingDate,
    application.updatedAt,
  ]);
  return [
    ['Company', 'Role', 'Status', 'Type', 'Location', 'Deadline', 'Last updated'],
    ...rows,
  ].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export function downloadApplicationsCsv(applications: DetailedApplication[]) {
  saveFile(buildApplicationsCsv(applications), 'placementos-applications.csv', 'text/csv;charset=utf-8');
}
