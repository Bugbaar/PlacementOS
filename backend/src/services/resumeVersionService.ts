export type ResumeVersion = {
  id: string;
  studentId: string;
  name: string;
  version: number;
  fileUrl: string;
  createdAt: string;
  isActive: boolean;
};

export type CreateResumeVersionInput = {
  name: string;
  fileUrl: string;
};

/**
 * In-memory resume versioning for the MVP.
 * Students can keep multiple named resume versions and mark one active.
 */
export class ResumeVersionService {
  private resumes = new Map<string, ResumeVersion[]>();

  createVersion(studentId: string, data: CreateResumeVersionInput): ResumeVersion {
    if (!studentId?.trim()) {
      throw new Error('studentId is required');
    }

    if (!data?.name?.trim() || !data?.fileUrl?.trim()) {
      throw new Error('name and fileUrl are required');
    }

    const versions = this.resumes.get(studentId) || [];

    const nextVersion =
      versions.length === 0
        ? 1
        : Math.max(...versions.map((resume) => resume.version)) + 1;

    const resume: ResumeVersion = {
      id: `${studentId}-${nextVersion}`,
      studentId,
      name: data.name.trim(),
      version: nextVersion,
      fileUrl: data.fileUrl.trim(),
      createdAt: new Date().toISOString(),
      isActive: versions.length === 0,
    };

    versions.push(resume);
    this.resumes.set(studentId, versions);

    return resume;
  }

  getVersions(studentId: string): ResumeVersion[] {
    return [...(this.resumes.get(studentId) || [])];
  }

  getVersion(studentId: string, versionId: string): ResumeVersion | null {
    const versions = this.resumes.get(studentId) || [];
    return versions.find((resume) => resume.id === versionId) || null;
  }

  activateVersion(studentId: string, versionId: string): ResumeVersion {
    const versions = this.resumes.get(studentId) || [];
    const target = versions.find((resume) => resume.id === versionId);

    if (!target) {
      throw new Error('Resume version not found');
    }

    versions.forEach((resume) => {
      resume.isActive = resume.id === versionId;
    });

    return target;
  }

  deleteVersion(studentId: string, versionId: string): ResumeVersion {
    const versions = this.resumes.get(studentId) || [];
    const index = versions.findIndex((resume) => resume.id === versionId);

    if (index === -1) {
      throw new Error('Resume version not found');
    }

    if (versions[index].isActive) {
      throw new Error('Active resume version cannot be deleted');
    }

    const [deleted] = versions.splice(index, 1);
    this.resumes.set(studentId, versions);

    return deleted;
  }

  /** Test helper */
  clear(): void {
    this.resumes.clear();
  }
}

/** Shared singleton for HTTP handlers in this process. */
export const resumeVersionService = new ResumeVersionService();
