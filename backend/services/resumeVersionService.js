class ResumeVersionService {
  constructor() {
    this.resumes = new Map();
  }

  createVersion(studentId, data) {
    if (!studentId) {
      throw new Error("studentId is required");
    }

    if (!data || !data.name || !data.fileUrl) {
      throw new Error("name and fileUrl are required");
    }

    const versions = this.resumes.get(studentId) || [];

    const nextVersion =
      versions.length === 0
        ? 1
        : Math.max(...versions.map((resume) => resume.version)) + 1;

    const resume = {
      id: `${studentId}-${nextVersion}`,
      studentId,
      name: data.name.trim(),
      version: nextVersion,
      fileUrl: data.fileUrl,
      createdAt: new Date().toISOString(),
      isActive: versions.length === 0,
    };

    versions.push(resume);
    this.resumes.set(studentId, versions);

    return resume;
  }

  getVersions(studentId) {
    return [...(this.resumes.get(studentId) || [])];
  }

  getVersion(studentId, versionId) {
    const versions = this.resumes.get(studentId) || [];

    return versions.find((resume) => resume.id === versionId) || null;
  }

  activateVersion(studentId, versionId) {
    const versions = this.resumes.get(studentId) || [];

    const target = versions.find((resume) => resume.id === versionId);

    if (!target) {
      throw new Error("Resume version not found");
    }

    versions.forEach((resume) => {
      resume.isActive = resume.id === versionId;
    });

    return target;
  }

  deleteVersion(studentId, versionId) {
    const versions = this.resumes.get(studentId) || [];

    const index = versions.findIndex((resume) => resume.id === versionId);

    if (index === -1) {
      throw new Error("Resume version not found");
    }

    if (versions[index].isActive) {
      throw new Error("Active resume version cannot be deleted");
    }

    const [deleted] = versions.splice(index, 1);
    this.resumes.set(studentId, versions);

    return deleted;
  }
}

module.exports = ResumeVersionService;
