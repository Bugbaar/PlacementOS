import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../../../app';
import Student from '../../../models/Student';
import Opportunity from '../../../models/Opportunity';
import Application from '../../../models/Application';
import { signToken } from '../../../utils/jwt';

describe('Recruiter portal API', () => {
  let mongo: MongoMemoryServer;
  const app = createApp();

  let recruiterId: string;
  let otherRecruiterId: string;
  let studentId: string;
  let recruiterToken: string;
  let studentToken: string;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
  }, 60_000);

  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  beforeEach(async () => {
    await Promise.all([
      Student.deleteMany({}),
      Opportunity.deleteMany({}),
      Application.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('password123', 4);

    const recruiter = await Student.create({
      name: 'Recruiter One',
      email: 'recruiter1@example.com',
      passwordHash,
      role: 'recruiter',
      branch: 'Talent',
      college: 'TechCorp',
      cgpa: 10,
      graduationYear: 2026,
    });
    const other = await Student.create({
      name: 'Recruiter Two',
      email: 'recruiter2@example.com',
      passwordHash,
      role: 'recruiter',
      branch: 'Talent',
      college: 'OtherCo',
      cgpa: 10,
      graduationYear: 2026,
    });
    const student = await Student.create({
      name: 'Jane Student',
      email: 'jane@example.com',
      passwordHash,
      role: 'student',
      branch: 'Computer Science',
      college: 'GIT',
      cgpa: 8.2,
      graduationYear: 2026,
      skills: ['react', 'node.js'],
    });

    recruiterId = recruiter.id;
    otherRecruiterId = other.id;
    studentId = student.id;
    recruiterToken = signToken({ id: recruiterId, role: 'recruiter', email: recruiter.email });
    studentToken = signToken({ id: studentId, role: 'student', email: student.email });
  });

  it('rejects students from recruiter routes', async () => {
    const res = await request(app)
      .get('/api/recruiter/opportunities')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('lets a recruiter create and list their own opportunities', async () => {
    const create = await request(app)
      .post('/api/recruiter/opportunities')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Backend Intern',
        company: 'TechCorp',
        description: 'Build APIs with Node.js',
        location: 'Remote',
        employmentType: 'Internship',
        applicationDeadline: '2027-06-01T00:00:00.000Z',
      });

    expect(create.status).toBe(201);
    expect(create.body.data.postedBy).toBe(recruiterId);
    expect(create.body.data.applicantCount).toBe(0);

    const list = await request(app)
      .get('/api/recruiter/opportunities')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].title).toBe('Backend Intern');
  });

  it('does not show another recruiter’s postings', async () => {
    await Opportunity.create({
      title: 'Other Role',
      company: 'OtherCo',
      description: 'Secret',
      location: 'Pune',
      employmentType: 'Full-time',
      minimumCgpa: 0,
      applicationDeadline: new Date('2027-01-01'),
      postedBy: otherRecruiterId,
    });

    const list = await request(app)
      .get('/api/recruiter/opportunities')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(0);
  });

  it('lists applicants and updates pipeline status for owned postings', async () => {
    const opportunity = await Opportunity.create({
      title: 'Frontend Intern',
      company: 'TechCorp',
      description: 'React work',
      location: 'Remote',
      employmentType: 'Internship',
      minimumCgpa: 0,
      applicationDeadline: new Date('2027-01-01'),
      postedBy: recruiterId,
    });

    const application = await Application.create({
      studentId,
      opportunityId: opportunity._id,
      status: 'applied',
    });

    const applicants = await request(app)
      .get(`/api/recruiter/opportunities/${opportunity.id}/applications`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(applicants.status).toBe(200);
    expect(applicants.body.data).toHaveLength(1);
    expect(applicants.body.data[0].studentName).toBe('Jane Student');
    expect(applicants.body.data[0].studentEmail).toBe('jane@example.com');

    const patched = await request(app)
      .patch(`/api/recruiter/applications/${application.id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'shortlisted' });

    expect(patched.status).toBe(200);
    expect(patched.body.data.status).toBe('shortlisted');
  });

  it('forbids updating applicants on someone else’s posting', async () => {
    const opportunity = await Opportunity.create({
      title: 'Other Role',
      company: 'OtherCo',
      description: 'Nope',
      location: 'Pune',
      employmentType: 'Full-time',
      minimumCgpa: 0,
      applicationDeadline: new Date('2027-01-01'),
      postedBy: otherRecruiterId,
    });
    const application = await Application.create({
      studentId,
      opportunityId: opportunity._id,
      status: 'applied',
    });

    const res = await request(app)
      .patch(`/api/recruiter/applications/${application.id}/status`)
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({ status: 'rejected' });

    expect(res.status).toBe(403);
  });

  it('excludes saved bookmarks from applicant counts and lists', async () => {
    const opportunity = await Opportunity.create({
      title: 'Bookmark Test',
      company: 'TechCorp',
      description: 'Count only applies',
      location: 'Remote',
      employmentType: 'Internship',
      minimumCgpa: 0,
      applicationDeadline: new Date('2027-01-01'),
      postedBy: recruiterId,
    });

    await Application.create({
      studentId,
      opportunityId: opportunity._id,
      status: 'saved',
    });

    const list = await request(app)
      .get('/api/recruiter/opportunities')
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(list.status).toBe(200);
    expect(list.body.data[0].applicantCount).toBe(0);

    const applicants = await request(app)
      .get(`/api/recruiter/opportunities/${opportunity.id}/applications`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(applicants.status).toBe(200);
    expect(applicants.body.data).toHaveLength(0);
  });

  it('blocks students from overwriting recruiter pipeline status', async () => {
    const opportunity = await Opportunity.create({
      title: 'Pipeline Lock',
      company: 'TechCorp',
      description: 'Status ownership',
      location: 'Remote',
      employmentType: 'Internship',
      minimumCgpa: 0,
      applicationDeadline: new Date('2027-01-01'),
      postedBy: recruiterId,
    });

    const application = await Application.create({
      studentId,
      opportunityId: opportunity._id,
      status: 'shortlisted',
    });

    const res = await request(app)
      .put(`/api/applications/${application.id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'applied' });

    expect(res.status).toBe(403);

    const escalate = await request(app)
      .put(`/api/applications/${application.id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ status: 'offered' });

    expect(escalate.status).toBe(403);
  });
});
