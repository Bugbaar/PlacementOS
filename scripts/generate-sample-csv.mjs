import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const first = [
  "Aarav", "Aditi", "Ananya", "Arjun", "Diya", "Ishaan", "Kavya", "Meera", "Neel", "Priya",
  "Rohan", "Saanvi", "Vihaan", "Zara", "Kabir", "Isha", "Reyansh", "Tara", "Advait", "Nisha",
];
const last = [
  "Sharma", "Patel", "Reddy", "Iyer", "Khan", "Nair", "Gupta", "Singh", "Mehta", "Joshi",
  "Das", "Kulkarni", "Chopra", "Banerjee", "Malhotra",
];
const branches = ["CSE", "IT", "ECE", "EE", "ME", "Civil"];
const skills = [
  "Node.js", "React", "TypeScript", "Python", "Java", "SQL", "MongoDB", "AWS", "Docker",
  "Kubernetes", "C++", "Go", "Next.js", "Express", "TensorFlow",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function skillBundle() {
  const count = 3 + Math.floor(Math.random() * 4);
  const set = new Set();
  while (set.size < count) set.add(pick(skills));
  if (Math.random() > 0.45) set.add("Node.js");
  return [...set].join("|");
}

const rows = ["rollNumber,name,email,branch,cgpa,activeBacklogs,skills,tenthPercent,twelfthPercent"];
for (let i = 1; i <= 500; i++) {
  const name = `${pick(first)} ${pick(last)}`;
  const branch = pick(branches);
  const cgpa = (6.2 + Math.random() * 3.6).toFixed(2);
  const backlogs = Math.random() > 0.72 ? Math.floor(Math.random() * 3) : 0;
  const roll = `${branch}${String(i).padStart(4, "0")}`;
  const email = `${name.toLowerCase().replace(/\s+/g, ".")}.${i}@campus.edu`;
  const tenth = (70 + Math.random() * 28).toFixed(1);
  const twelfth = (68 + Math.random() * 30).toFixed(1);
  rows.push(
    `${roll},${name},${email},${branch},${cgpa},${backlogs},${skillBundle()},${tenth},${twelfth}`,
  );
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "frontend", "public"), { recursive: true });
writeFileSync(join(root, "frontend", "public", "sample-students-500.csv"), rows.join("\n"));
writeFileSync(join(root, "scripts", "sample-students-500.csv"), rows.join("\n"));
console.log("Wrote 500-row sample CSV");
