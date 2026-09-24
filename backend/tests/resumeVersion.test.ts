import { describe, it, expect, beforeEach } from 'vitest';
import { ResumeVersionService } from '../src/services/resumeVersionService';

describe('ResumeVersionService', () => {
  let service: ResumeVersionService;

  beforeEach(() => {
    service = new ResumeVersionService();
  });

  it('creates first version as v1 and active', () => {
    const first = service.createVersion('student-1', {
      name: 'Java Developer Resume',
      fileUrl: '/resumes/java-v1.pdf',
    });

    expect(first.version).toBe(1);
    expect(first.isActive).toBe(true);
  });

  it('increments version numbers for the same student', () => {
    service.createVersion('student-1', {
      name: 'Java Developer Resume',
      fileUrl: '/resumes/java-v1.pdf',
    });
    const second = service.createVersion('student-1', {
      name: 'Backend Developer Resume',
      fileUrl: '/resumes/backend-v2.pdf',
    });

    expect(second.version).toBe(2);
    expect(second.isActive).toBe(false);
    expect(service.getVersions('student-1')).toHaveLength(2);
  });

  it('activates a version and deactivates others', () => {
    const first = service.createVersion('student-1', {
      name: 'Java Developer Resume',
      fileUrl: '/resumes/java-v1.pdf',
    });
    const second = service.createVersion('student-1', {
      name: 'Backend Developer Resume',
      fileUrl: '/resumes/backend-v2.pdf',
    });

    const activated = service.activateVersion('student-1', second.id);
    expect(activated.isActive).toBe(true);
    expect(service.getVersion('student-1', first.id)?.isActive).toBe(false);
  });

  it('blocks deleting the active version', () => {
    const first = service.createVersion('student-1', {
      name: 'Java Developer Resume',
      fileUrl: '/resumes/java-v1.pdf',
    });

    expect(() => service.deleteVersion('student-1', first.id)).toThrow(
      /Active resume version cannot be deleted/
    );
  });

  it('deletes inactive versions', () => {
    const first = service.createVersion('student-1', {
      name: 'Java Developer Resume',
      fileUrl: '/resumes/java-v1.pdf',
    });
    const second = service.createVersion('student-1', {
      name: 'Backend Developer Resume',
      fileUrl: '/resumes/backend-v2.pdf',
    });
    service.activateVersion('student-1', second.id);

    const deleted = service.deleteVersion('student-1', first.id);
    expect(deleted.id).toBe(first.id);
    expect(service.getVersions('student-1')).toHaveLength(1);
  });

  it('validates studentId and payload', () => {
    expect(() =>
      service.createVersion('', {
        name: 'Test Resume',
        fileUrl: '/resume.pdf',
      })
    ).toThrow(/studentId is required/);

    expect(() => service.createVersion('student-2', { name: '', fileUrl: '' })).toThrow(
      /name and fileUrl are required/
    );
  });

  it('keeps student version lists independent', () => {
    service.createVersion('student-1', {
      name: 'Java Developer Resume',
      fileUrl: '/resumes/java-v1.pdf',
    });
    const other = service.createVersion('student-2', {
      name: 'Python Developer Resume',
      fileUrl: '/resumes/python-v1.pdf',
    });

    expect(other.version).toBe(1);
    expect(service.getVersions('student-2')).toHaveLength(1);
    expect(service.getVersions('student-1')).toHaveLength(1);
  });
});
