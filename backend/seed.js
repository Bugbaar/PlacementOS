import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from './config/db.js';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';
import Job from './models/Job.js';
import Application from './models/Application.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Database connected. Seeding sample placement data...');

    // Clear existing data
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});

    console.log('Cleared existing database records.');

    // Common password
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('password123', salt);
    const adminPassword = await bcrypt.hash('admin123', salt);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Placement Officer',
      email: 'admin@placementos.com',
      password: adminPassword,
      role: 'ADMIN',
    });

    // 2. Create Students
    const rahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@student.com',
      password: defaultPassword,
      role: 'STUDENT',
    });

    const aman = await User.create({
      name: 'Aman Verma',
      email: 'aman@student.com',
      password: defaultPassword,
      role: 'STUDENT',
    });

    const priya = await User.create({
      name: 'Priya Patel',
      email: 'priya@student.com',
      password: defaultPassword,
      role: 'STUDENT',
    });

    // 3. Create Student Profiles
    await StudentProfile.create({
      user: rahul._id,
      phone: '9876543210',
      college: 'Delhi Technological University',
      branch: 'Computer Science',
      graduationYear: 2026,
      cgpa: 8.5,
      skills: ['Java', 'Spring Boot', 'SQL', 'Git'],
      resumeUrl: 'https://example.com/resumes/rahul.pdf',
    });

    await StudentProfile.create({
      user: aman._id,
      phone: '9876543211',
      college: 'IIT Delhi',
      branch: 'Information Technology',
      graduationYear: 2026,
      cgpa: 7.2,
      skills: ['JavaScript', 'React.js', 'HTML/CSS', 'Node.js'],
      resumeUrl: 'https://example.com/resumes/aman.pdf',
    });

    await StudentProfile.create({
      user: priya._id,
      phone: '9876543212',
      college: 'NSUT Delhi',
      branch: 'Electronics & Communication',
      graduationYear: 2026,
      cgpa: 6.2,
      skills: ['Python', 'C++', 'Data Structures'],
      resumeUrl: 'https://example.com/resumes/priya.pdf',
    });

    // 4. Create Jobs
    const job1 = await Job.create({
      companyName: 'TCS',
      jobTitle: 'Java Developer',
      description: 'Looking for enthusiastic Java Developers skilled in OOP, Spring Boot, and enterprise backend systems.',
      location: 'Bengaluru / Hybrid',
      salary: '7.5 LPA',
      requiredSkills: ['Java', 'Spring Boot', 'MySQL', 'REST API'],
      minimumCGPA: 7.0,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    });

    const job2 = await Job.create({
      companyName: 'Infosys',
      jobTitle: 'Frontend Developer',
      description: 'Build sleek modern user interfaces using React.js, Tailwind CSS, and Redux Toolkit.',
      location: 'Pune',
      salary: '6.5 LPA',
      requiredSkills: ['React.js', 'JavaScript', 'Tailwind CSS', 'Git'],
      minimumCGPA: 6.5,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    });

    const job3 = await Job.create({
      companyName: 'Accenture',
      jobTitle: 'Backend Developer',
      description: 'Design scalable microservices, optimize MongoDB databases, and handle cloud integrations.',
      location: 'Hyderabad',
      salary: '8.0 LPA',
      requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'AWS'],
      minimumCGPA: 7.5,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    });

    const job4 = await Job.create({
      companyName: 'Tech Mahindra',
      jobTitle: 'Software Engineer',
      description: 'Entry level software engineering role involving application testing, maintenance, and bug fixes.',
      location: 'Noida',
      salary: '6.0 LPA',
      requiredSkills: ['C++', 'Java', 'Problem Solving'],
      minimumCGPA: 6.0,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    // 5. Create Applications
    await Application.create({
      student: rahul._id,
      job: job1._id,
      status: 'Shortlisted',
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      student: rahul._id,
      job: job3._id,
      status: 'Applied',
      appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      student: aman._id,
      job: job2._id,
      status: 'Applied',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Application.create({
      student: priya._id,
      job: job4._id,
      status: 'Selected',
      appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    });

    console.log('🎉 --- SEED COMPLETE ---');
    console.log('Admin Account: admin@placementos.com / admin123');
    console.log('Student Accounts:');
    console.log(' - rahul@student.com / password123 (CGPA: 8.5)');
    console.log(' - aman@student.com / password123 (CGPA: 7.2)');
    console.log(' - priya@student.com / password123 (CGPA: 6.2)');
    console.log('---------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
