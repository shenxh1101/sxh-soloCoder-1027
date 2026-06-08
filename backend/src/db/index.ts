import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'recruitment.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    industry TEXT NOT NULL,
    size TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    website TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('jobseeker', 'hr')),
    name TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    companyId TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (companyId) REFERENCES companies(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    benefits TEXT,
    salaryMin INTEGER NOT NULL,
    salaryMax INTEGER NOT NULL,
    salaryType TEXT NOT NULL DEFAULT 'monthly',
    city TEXT NOT NULL,
    district TEXT,
    experience TEXT NOT NULL,
    education TEXT NOT NULL,
    type TEXT NOT NULL,
    companyId TEXT NOT NULL,
    hrId TEXT NOT NULL,
    viewCount INTEGER DEFAULT 0,
    applyCount INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'closed')),
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (companyId) REFERENCES companies(id),
    FOREIGN KEY (hrId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS resumes (
    id TEXT PRIMARY KEY,
    userId TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    gender TEXT CHECK(gender IN ('male', 'female')),
    birthday TEXT,
    currentCity TEXT,
    education TEXT NOT NULL,
    major TEXT,
    graduationYear INTEGER,
    workYears INTEGER DEFAULT 0,
    currentPosition TEXT,
    currentCompany TEXT,
    currentSalary TEXT,
    expectedSalary TEXT,
    expectedCity TEXT,
    expectedPosition TEXT,
    selfIntroduction TEXT,
    attachmentUrl TEXT,
    attachmentName TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS workExperiences (
    id TEXT PRIMARY KEY,
    resumeId TEXT NOT NULL,
    company TEXT NOT NULL,
    position TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT,
    isCurrent INTEGER DEFAULT 0,
    description TEXT,
    salary TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS projectExperiences (
    id TEXT PRIMARY KEY,
    resumeId TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    startTime TEXT NOT NULL,
    endTime TEXT,
    description TEXT,
    technologies TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (resumeId) REFERENCES resumes(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL,
    userId TEXT NOT NULL,
    resumeId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied' CHECK(status IN ('applied', 'pending', 'interview', 'hired', 'rejected')),
    hrNotes TEXT,
    appliedAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (jobId) REFERENCES jobs(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (resumeId) REFERENCES resumes(id),
    UNIQUE(jobId, userId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS interviews (
    id TEXT PRIMARY KEY,
    applicationId TEXT NOT NULL,
    jobId TEXT NOT NULL,
    userId TEXT NOT NULL,
    hrId TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('phone', 'onsite', 'video')),
    dateTime TEXT NOT NULL,
    location TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    result TEXT CHECK(result IN ('pass', 'fail', 'pending')),
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (applicationId) REFERENCES applications(id),
    FOREIGN KEY (jobId) REFERENCES jobs(id),
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (hrId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    jobId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (jobId) REFERENCES jobs(id),
    UNIQUE(userId, jobId)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS jobViews (
    id TEXT PRIMARY KEY,
    jobId TEXT NOT NULL,
    userId TEXT,
    viewedAt TEXT NOT NULL,
    FOREIGN KEY (jobId) REFERENCES jobs(id)
  )`);
});

export const runQuery = (sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const getRow = <T>(sql: string, params: any[] = []): Promise<T | null> => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T | null);
    });
  });
};

export const getRows = <T>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
};

export default db;
