/**
 * Non-destructive: upsert seed recruiter account and optionally link orphan opportunities.
 * Does NOT wipe students/applications.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Student from '../src/models/Student';
import Opportunity from '../src/models/Opportunity';

dotenv.config();

async function main() {
  const email = (process.env.SEED_RECRUITER_EMAIL || '').trim().toLowerCase();
  const password = (process.env.SEED_RECRUITER_PASSWORD || '').trim();
  if (!email || !password) {
    throw new Error('Set SEED_RECRUITER_EMAIL and SEED_RECRUITER_PASSWORD in backend/.env');
  }

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is required');

  await mongoose.connect(uri);
  const hash = await bcrypt.hash(password, 10);

  let recruiter = await Student.findOne({ email }).select('+passwordHash');
  if (recruiter) {
    recruiter.role = 'recruiter';
    recruiter.passwordHash = hash;
    if (!recruiter.name) recruiter.name = 'Sample Recruiter';
    await recruiter.save();
    console.log('Updated existing recruiter', recruiter.id);
  } else {
    recruiter = await Student.create({
      name: 'Sample Recruiter',
      email,
      passwordHash: hash,
      role: 'recruiter',
      branch: 'Talent Acquisition',
      college: 'TechCorp Campus Hiring',
      cgpa: 10,
      graduationYear: 2026,
      skills: [],
      preferredRoles: [],
      preferredLocations: [],
    });
    console.log('Created recruiter', recruiter.id);
  }

  const orphan = await Opportunity.find({
    $or: [{ postedBy: { $exists: false } }, { postedBy: null }],
  }).limit(2);

  for (const o of orphan) {
    o.postedBy = recruiter._id as typeof o.postedBy;
    await o.save();
  }
  console.log('Linked orphan opportunities:', orphan.length);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
