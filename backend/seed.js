/**
 * Populates the database with a sample recruiter, job postings, and
 * applications so the Recruiter Portal has real data to show in a
 * demo or PR screenshot. Run with: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Job = require('./models/Job');
const Application = require('./models/Application');

const RECRUITER_ID = new mongoose.Types.ObjectId();

const seed = async () => {
  await connectDB();

  await Job.deleteMany({ recruiterId: RECRUITER_ID });

  const job1 = await Job.create({
    recruiterId: RECRUITER_ID,
    title: 'Software Development Engineer - I',
    description: 'Building backend services for our core platform.',
    companyName: 'Acme Tech',
    location: 'Bengaluru',
    employmentType: 'full-time',
    eligibilityCriteria: { minCgpa: 7, allowedBranches: ['CSE', 'IT'], maxBacklogs: 0 },
    ctc: '8 LPA',
    applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });

  const job2 = await Job.create({
    recruiterId: RECRUITER_ID,
    title: 'Frontend Engineering Intern',
    description: 'Working on React-based dashboards for internal tools.',
    companyName: 'Acme Tech',
    location: 'Remote',
    employmentType: 'internship',
    eligibilityCriteria: { minCgpa: 6.5, allowedBranches: ['CSE', 'IT', 'ECE'], maxBacklogs: 1 },
    ctc: '25,000/month stipend',
    applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  await Application.insertMany([
    {
      jobId: job1._id,
      studentId: new mongoose.Types.ObjectId(),
      studentName: 'Aisha Verma',
      studentEmail: 'aisha.verma@example.edu',
      status: 'shortlisted',
    },
    {
      jobId: job1._id,
      studentId: new mongoose.Types.ObjectId(),
      studentName: 'Rohan Mehta',
      studentEmail: 'rohan.mehta@example.edu',
      status: 'applied',
    },
    {
      jobId: job2._id,
      studentId: new mongoose.Types.ObjectId(),
      studentName: 'Priya Nair',
      studentEmail: 'priya.nair@example.edu',
      status: 'interview',
    },
  ]);

  console.log('Seed complete.');
  console.log('Recruiter ID for testing:', RECRUITER_ID.toString());
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
