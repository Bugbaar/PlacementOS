import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.application.deleteMany();
  await prisma.driveRegistration.deleteMany();
  await prisma.placementDrive.deleteMany();
  await prisma.job.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding Database with Mock Users (ESM mode)...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@college.edu',
      password: hashedPassword,
      name: 'John Doe',
      role: 'STUDENT',
      student: {
        create: {
          college: 'Global Institute of Technology',
          branch: 'Computer Science',
          cgpa: 8.5,
          batch: '2024',
          skills: ['React', 'Node.js', 'PostgreSQL'],
        },
      },
    },
  });

  const recruiterUser = await prisma.user.create({
    data: {
      email: 'recruiter@techcorp.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: 'RECRUITER',
      company: {
        create: {
          name: 'TechCorp Solutions',
          website: 'https://techcorp.com',
          industry: 'Software',
          location: 'Bangalore, India',
        },
      },
    },
  });

  const placementCellUser = await prisma.user.create({
    data: {
      email: 'placement@college.edu',
      password: hashedPassword,
      name: 'Admin Panel',
      role: 'PLACEMENT_CELL',
    },
  });

  const company = await prisma.company.findFirst();

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: 'Full Stack Developer',
      description: 'We are looking for a MERN stack developer.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      salary: '₹12,00,000 LPA',
      location: 'Bangalore',
      type: 'FULL_TIME',
      minCgpa: 7.5,
    },
  });

  const drive = await prisma.placementDrive.create({
    data: {
      companyId: company.id,
      title: 'TechCorp Campus Hiring 2024',
      description: 'Hiring for SDE roles.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  
      minCgpa: 7.5,
      rounds: ['Aptitude', 'Technical', 'HR'],
    },
  });

  await prisma.announcement.create({
    data: {
      authorId: placementCellUser.id,
      title: 'Welcome to PlacementOS',
      content: 'The campus placement drive 2024 officially begins today.',
      priority: 'HIGH',
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
