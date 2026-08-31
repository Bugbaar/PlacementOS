import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App, getTimeGreeting } from './App';
import { createAppStore } from './store';
import type { DashboardData } from './types';

const dashboard: DashboardData = {
  student: {
    id: 'student-001',
    name: 'Aarav Mehta',
    email: 'aarav@example.edu',
    program: 'B.Tech',
    branch: 'Computer Science',
    graduationYear: 2027,
    cgpa: 8.4,
    activeBacklogs: 0,
    skills: ['React'],
    profileCompletion: 84,
  },
  drives: [
    {
      id: 'drive-1',
      company: 'NovaStack',
      companyMark: 'N',
      role: 'Frontend Engineer Intern',
      type: 'Internship',
      location: 'Bengaluru',
      workMode: 'Hybrid',
      salary: '₹45,000 / month',
      closingDate: '2026-09-03T18:30:00.000Z',
      openings: 6,
      description: 'Build accessible product experiences.',
      skills: ['React', 'TypeScript'],
      eligibility: { minCgpa: 7.5, maxActiveBacklogs: 0 },
      eligibilityDecision: {
        eligible: true,
        score: 100,
        matchedSkills: ['React'],
        missingSkills: ['TypeScript'],
        checks: [
          { key: 'cgpa', label: 'CGPA', passed: true, message: '8.4 meets the 7.5 minimum' },
          { key: 'backlogs', label: 'Active backlogs', passed: true, message: '0 active backlogs (maximum 0)' },
        ],
      },
      application: null,
    },
  ],
  applications: [],
  stats: { eligibleDrives: 1, totalApplications: 0, interviews: 0, offers: 0 },
};

describe('student dashboard', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('loads the overview and exposes an explainable eligibility result', async () => {
    localStorage.setItem('placementos.session', JSON.stringify({
      studentId: 'student-001',
      name: 'Aarav Mehta',
      email: 'aarav@example.edu',
    }));
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(dashboard), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<Provider store={createAppStore()}><App /></Provider>);

    expect(await screen.findByText(/Good (morning|afternoon|evening), Aarav\./)).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Placement drives' })[0]);
    expect(screen.getByText('Find your next role')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Why am I eligible/i }));
    expect(screen.getByText('8.4 meets the 7.5 minimum')).toBeVisible();
  }, 15_000);

  it('lets a guest explore first, then signs in as the selected student', async () => {
    const priyaDashboard = {
      ...dashboard,
      student: { ...dashboard.student, id: 'student-002', name: 'Priya Sharma', email: 'priya.sharma@example.edu' },
    };
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const body = url.includes('/api/drives/public')
        ? { drives: dashboard.drives.map(({ eligibilityDecision: _decision, application: _application, ...drive }) => drive) }
        : url.includes('/api/auth/demo-users')
        ? { users: [{ id: 'student-002', name: 'Priya Sharma', email: 'priya.sharma@example.edu', program: 'B.Tech', branch: 'Electronics' }] }
        : url.includes('/api/auth/login')
          ? { session: { studentId: 'student-002', name: 'Priya Sharma', email: 'priya.sharma@example.edu' } }
          : priyaDashboard;
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<Provider store={createAppStore()}><App /></Provider>);

    expect(await screen.findByText('Your placement journey')).toBeVisible();
    expect(screen.getAllByText('Frontend Engineer Intern').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: 'Student sign in' }));
    fireEvent.click(await screen.findByRole('button', { name: /Priya Sharma/i }));
    fireEvent.click(screen.getByRole('button', { name: /Sign in to workspace/i }));
    expect(await screen.findByText(/Good (morning|afternoon|evening), Priya\./)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('placementos.session') ?? '{}').studentId).toBe('student-002');
  });

  it('selects the correct greeting for the local time', () => {
    expect(getTimeGreeting(new Date('2026-08-31T08:00:00'))).toBe('Good morning');
    expect(getTimeGreeting(new Date('2026-08-31T14:00:00'))).toBe('Good afternoon');
    expect(getTimeGreeting(new Date('2026-08-31T20:00:00'))).toBe('Good evening');
  });

  it('connects support navigation, notifications, settings, and sign out', async () => {
    localStorage.setItem('placementos.session', JSON.stringify({
      studentId: 'student-001',
      name: 'Aarav Mehta',
      email: 'aarav@example.edu',
    }));
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      const body = url.includes('/api/drives/public')
        ? { drives: dashboard.drives.map(({ eligibilityDecision: _decision, application: _application, ...drive }) => drive) }
        : url.includes('/api/auth/demo-users') ? { users: [] } : dashboard;
      return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });

    render(<Provider store={createAppStore()}><App /></Provider>);
    await screen.findByText(/Good (morning|afternoon|evening), Aarav\./);

    fireEvent.click(screen.getByRole('button', { name: 'Analytics' }));
    expect(screen.getByText('Pipeline distribution')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Help centre' }));
    expect(screen.getByText('Frequently asked questions')).toBeVisible();
    fireEvent.click(screen.getAllByRole('button', { name: 'Settings' })[0]);
    fireEvent.click(screen.getByRole('switch', { name: 'Email alerts' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save settings' }));
    expect(localStorage.getItem('placementos.settings.student-001')).toContain('emailAlerts');

    fireEvent.click(screen.getByRole('button', { name: 'Notifications' }));
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Mark all as read' }));
    expect(screen.queryByRole('dialog', { name: 'Notifications' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Sign out/i })[0]);
    expect(await screen.findByText('Your placement journey')).toBeVisible();
  });
});
