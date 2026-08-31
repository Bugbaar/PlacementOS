import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../src/models/Student';
import Opportunity from '../src/models/Opportunity';
import Application from '../src/models/Application';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/placementos';

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    await Opportunity.deleteMany({});
    await Application.deleteMany({});
    console.log('Cleared existing data');

    // Create a demo student
    const student = await Student.create({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      phone: '+91 9876543210',
      branch: 'Computer Science',
      college: 'Global Institute of Technology',
      cgpa: 8.5,
      graduationYear: 2026,
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
      preferredRoles: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer'],
      preferredLocations: ['Remote', 'Bangalore'],
      experienceLevel: 'Fresher',
      bio: 'Passionate computer science student looking for software engineering roles.',
      githubUrl: 'https://github.com/janedoe',
      linkedinUrl: 'https://linkedin.com/in/janedoe',
    });
    console.log('Created Demo Student');

    // Create opportunities
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    const opportunitiesData = [
      {
        title: 'Software Engineer Intern',
        company: 'TechCorp',
        description: 'Join our core engineering team to build scalable web applications.',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'Docker', 'AWS'],
        minimumCgpa: 7.5,
        eligibleBranches: ['Computer Science', 'Information Technology'],
        eligibleGraduationYears: [2026],
        location: 'Remote',
        employmentType: 'Internship',
        salaryRange: '₹25,000/month',
        applicationDeadline: futureDate,
      },
      {
        title: 'Full Stack Developer Intern',
        company: 'InnovateX',
        description: 'Work on cutting-edge features for our flagship SaaS product.',
        requiredSkills: ['React', 'Node.js', 'TypeScript'],
        minimumCgpa: 8.0,
        eligibleBranches: ['Computer Science'],
        eligibleGraduationYears: [2026],
        location: 'Bangalore',
        employmentType: 'Internship',
        salaryRange: '₹30,000/month',
        applicationDeadline: futureDate,
      },
      {
        title: 'Backend Developer Intern',
        company: 'CloudSystems',
        description: 'Help us scale our microservices architecture.',
        requiredSkills: ['Node.js', 'Python', 'AWS', 'PostgreSQL'],
        minimumCgpa: 7.0,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics'],
        eligibleGraduationYears: [2026, 2027],
        location: 'Hyderabad',
        employmentType: 'Internship',
        salaryRange: '₹20,000/month',
        applicationDeadline: futureDate,
      },
      {
        title: 'QA Automation Intern',
        company: 'QualityFirst',
        description: 'Write automated tests for our web platform.',
        requiredSkills: ['JavaScript', 'Selenium', 'Cypress'],
        minimumCgpa: 6.5,
        eligibleBranches: ['Computer Science', 'Information Technology'],
        eligibleGraduationYears: [2026],
        location: 'Pune',
        employmentType: 'Internship',
        salaryRange: '₹15,000/month',
        applicationDeadline: futureDate,
      },
      {
        title: 'AI/ML Intern',
        company: 'DataMinds',
        description: 'Work on predictive models and data pipelines.',
        requiredSkills: ['Python', 'TensorFlow', 'PyTorch', 'SQL'],
        minimumCgpa: 8.5,
        eligibleBranches: ['Computer Science', 'Data Science'],
        eligibleGraduationYears: [2026],
        location: 'Remote',
        employmentType: 'Internship',
        salaryRange: '₹40,000/month',
        applicationDeadline: futureDate,
      },
      {
        title: 'Frontend Engineer',
        company: 'WebSolutions',
        description: 'Create beautiful user interfaces.',
        requiredSkills: ['React', 'CSS', 'HTML', 'JavaScript'],
        minimumCgpa: 7.0,
        eligibleBranches: ['Computer Science'],
        eligibleGraduationYears: [2025, 2026],
        location: 'Remote',
        employmentType: 'Full-time',
        salaryRange: '₹8,00,000/year',
        applicationDeadline: futureDate,
      },
      {
        title: 'Data Analyst Intern',
        company: 'MetricsCorp',
        description: 'Analyze data to find actionable insights.',
        requiredSkills: ['SQL', 'Python', 'Tableau', 'Excel'],
        minimumCgpa: 7.0,
        eligibleBranches: ['Computer Science', 'Information Technology', 'Mathematics'],
        eligibleGraduationYears: [2026],
        location: 'Mumbai',
        employmentType: 'Internship',
        salaryRange: '₹20,000/month',
        applicationDeadline: futureDate,
      },
      {
        title: 'DevOps Intern',
        company: 'CloudNative',
        description: 'Maintain CI/CD pipelines and infrastructure.',
        requiredSkills: ['Linux', 'Docker', 'Kubernetes', 'AWS'],
        minimumCgpa: 7.5,
        eligibleBranches: ['Computer Science', 'Information Technology'],
        eligibleGraduationYears: [2026],
        location: 'Remote',
        employmentType: 'Internship',
        salaryRange: '₹25,000/month',
        applicationDeadline: pastDate, // Expired
        status: 'closed',
      }
    ];

    await Opportunity.insertMany(opportunitiesData);
    console.log(`Created ${opportunitiesData.length} Opportunities`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
