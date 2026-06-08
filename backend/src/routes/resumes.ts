import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getRow, getRows, runQuery } from '../db';
import { Resume, WorkExperience, ProjectExperience } from '../types';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { UPLOAD_DIR, MAX_FILE_SIZE } from '../config';

const router = Router();

const uploadDir = path.join(__dirname, '../../', UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 PDF、Word 和 TXT 格式'));
    }
  }
});

router.get('/my', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const resume = await getRow<Resume>('SELECT * FROM resumes WHERE userId = ?', [req.user.id]);
    
    if (!resume) {
      return res.json(null);
    }

    const workExperiences = await getRows<WorkExperience>('SELECT * FROM workExperiences WHERE resumeId = ? ORDER BY startTime DESC', [resume.id]);
    const projectExperiences = await getRows<ProjectExperience>('SELECT * FROM projectExperiences WHERE resumeId = ? ORDER BY startTime DESC', [resume.id]);

    res.json({
      ...resume,
      workExperiences,
      projectExperiences
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: '获取简历失败' });
  }
});

router.post('/', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const {
      name, phone, email, gender, birthday, currentCity,
      education, major, graduationYear, workYears,
      currentPosition, currentCompany, currentSalary,
      expectedSalary, expectedCity, expectedPosition,
      selfIntroduction
    } = req.body;

    if (!name || !phone || !email || !education || workYears === undefined) {
      return res.status(400).json({ error: '请填写必填信息' });
    }

    const existingResume = await getRow<Resume>('SELECT * FROM resumes WHERE userId = ?', [req.user.id]);
    const now = new Date().toISOString();

    let resumeId: string;
    if (existingResume) {
      resumeId = existingResume.id;
      await runQuery(
        `UPDATE resumes SET 
          name = ?, phone = ?, email = ?, gender = ?, birthday = ?, currentCity = ?,
          education = ?, major = ?, graduationYear = ?, workYears = ?,
          currentPosition = ?, currentCompany = ?, currentSalary = ?,
          expectedSalary = ?, expectedCity = ?, expectedPosition = ?,
          selfIntroduction = ?, updatedAt = ?
        WHERE id = ?`,
        [
          name, phone, email, gender || null, birthday || null, currentCity || null,
          education, major || null, graduationYear || null, workYears,
          currentPosition || null, currentCompany || null, currentSalary || null,
          expectedSalary || null, expectedCity || null, expectedPosition || null,
          selfIntroduction || null, now, resumeId
        ]
      );
    } else {
      resumeId = uuidv4();
      await runQuery(
        `INSERT INTO resumes (
          id, userId, name, phone, email, gender, birthday, currentCity,
          education, major, graduationYear, workYears,
          currentPosition, currentCompany, currentSalary,
          expectedSalary, expectedCity, expectedPosition,
          selfIntroduction, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resumeId, req.user.id, name, phone, email, gender || null, birthday || null, currentCity || null,
          education, major || null, graduationYear || null, workYears,
          currentPosition || null, currentCompany || null, currentSalary || null,
          expectedSalary || null, expectedCity || null, expectedPosition || null,
          selfIntroduction || null, now, now
        ]
      );
    }

    const resume = await getRow<Resume>('SELECT * FROM resumes WHERE id = ?', [resumeId]);
    res.json(resume);
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ error: '保存简历失败' });
  }
});

router.post('/upload', authenticateToken, requireRole(['jobseeker']), upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的文件' });
    }

    const resume = await getRow<Resume>('SELECT * FROM resumes WHERE userId = ?', [req.user.id]);
    if (!resume) {
      return res.status(400).json({ error: '请先完善基本信息' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const now = new Date().toISOString();

    await runQuery(
      'UPDATE resumes SET attachmentUrl = ?, attachmentName = ?, updatedAt = ? WHERE id = ?',
      [fileUrl, req.file.originalname, now, resume.id]
    );

    const updatedResume = await getRow<Resume>('SELECT * FROM resumes WHERE id = ?', [resume.id]);
    res.json({ 
      url: fileUrl, 
      name: req.file.originalname,
      resume: updatedResume
    });
  } catch (error) {
    console.error('Upload resume error:', error);
    res.status(500).json({ error: '上传失败' });
  }
});

router.delete('/attachment', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const resume = await getRow<Resume>('SELECT * FROM resumes WHERE userId = ?', [req.user.id]);
    if (!resume || !resume.attachmentUrl) {
      return res.status(400).json({ error: '没有附件简历' });
    }

    const filePath = path.join(__dirname, '../../', resume.attachmentUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const now = new Date().toISOString();
    await runQuery('UPDATE resumes SET attachmentUrl = NULL, attachmentName = NULL, updatedAt = ? WHERE id = ?', [now, resume.id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

router.post('/work-experience', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id, company, position, startTime, endTime, isCurrent, description, salary } = req.body;

    if (!company || !position || !startTime) {
      return res.status(400).json({ error: '请填写必要信息' });
    }

    const resume = await getRow<Resume>('SELECT id FROM resumes WHERE userId = ?', [req.user.id]);
    if (!resume) {
      return res.status(400).json({ error: '请先创建简历' });
    }

    const now = new Date().toISOString();
    let experienceId: string;

    if (id) {
      experienceId = id;
      await runQuery(
        `UPDATE workExperiences SET 
          company = ?, position = ?, startTime = ?, endTime = ?, 
          isCurrent = ?, description = ?, salary = ?, updatedAt = ?
        WHERE id = ? AND resumeId = ?`,
        [company, position, startTime, endTime || null, isCurrent ? 1 : 0, description || '', salary || null, now, id, resume.id]
      );
    } else {
      experienceId = uuidv4();
      await runQuery(
        `INSERT INTO workExperiences (
          id, resumeId, company, position, startTime, endTime, 
          isCurrent, description, salary, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [experienceId, resume.id, company, position, startTime, endTime || null, isCurrent ? 1 : 0, description || '', salary || null, now, now]
      );
    }

    const experience = await getRow<WorkExperience>('SELECT * FROM workExperiences WHERE id = ?', [experienceId]);
    res.json(experience);
  } catch (error) {
    console.error('Save work experience error:', error);
    res.status(500).json({ error: '保存工作经历失败' });
  }
});

router.delete('/work-experience/:id', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const resume = await getRow<Resume>('SELECT id FROM resumes WHERE userId = ?', [req.user.id]);
    
    if (!resume) {
      return res.status(400).json({ error: '简历不存在' });
    }

    await runQuery('DELETE FROM workExperiences WHERE id = ? AND resumeId = ?', [id, resume.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete work experience error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

router.post('/project-experience', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id, name, role, startTime, endTime, description, technologies } = req.body;

    if (!name || !role || !startTime) {
      return res.status(400).json({ error: '请填写必要信息' });
    }

    const resume = await getRow<Resume>('SELECT id FROM resumes WHERE userId = ?', [req.user.id]);
    if (!resume) {
      return res.status(400).json({ error: '请先创建简历' });
    }

    const now = new Date().toISOString();
    let experienceId: string;

    if (id) {
      experienceId = id;
      await runQuery(
        `UPDATE projectExperiences SET 
          name = ?, role = ?, startTime = ?, endTime = ?, 
          description = ?, technologies = ?, updatedAt = ?
        WHERE id = ? AND resumeId = ?`,
        [name, role, startTime, endTime || null, description || '', technologies || null, now, id, resume.id]
      );
    } else {
      experienceId = uuidv4();
      await runQuery(
        `INSERT INTO projectExperiences (
          id, resumeId, name, role, startTime, endTime, 
          description, technologies, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [experienceId, resume.id, name, role, startTime, endTime || null, description || '', technologies || null, now, now]
      );
    }

    const experience = await getRow<ProjectExperience>('SELECT * FROM projectExperiences WHERE id = ?', [experienceId]);
    res.json(experience);
  } catch (error) {
    console.error('Save project experience error:', error);
    res.status(500).json({ error: '保存项目经历失败' });
  }
});

router.delete('/project-experience/:id', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const resume = await getRow<Resume>('SELECT id FROM resumes WHERE userId = ?', [req.user.id]);
    
    if (!resume) {
      return res.status(400).json({ error: '简历不存在' });
    }

    await runQuery('DELETE FROM projectExperiences WHERE id = ? AND resumeId = ?', [id, resume.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete project experience error:', error);
    res.status(500).json({ error: '删除失败' });
  }
});

router.patch('/my', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const existingResume = await getRow<Resume>('SELECT * FROM resumes WHERE userId = ?', [req.user.id]);
    if (!existingResume) {
      return res.status(400).json({ error: '请先创建简历' });
    }

    const allowedFields = [
      'name', 'phone', 'email', 'gender', 'birthday', 'currentCity',
      'education', 'major', 'graduationYear', 'workYears',
      'currentPosition', 'currentCompany', 'currentSalary',
      'expectedSalary', 'expectedCity', 'expectedPosition',
      'selfIntroduction', 'attachmentUrl', 'attachmentName'
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field] === '' ? null : req.body[field]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: '没有要更新的字段' });
    }

    const now = new Date().toISOString();
    updates.push('updatedAt = ?');
    values.push(now, existingResume.id);

    await runQuery(
      `UPDATE resumes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const resume = await getRow<Resume>('SELECT * FROM resumes WHERE id = ?', [existingResume.id]);
    res.json(resume);
  } catch (error) {
    console.error('Patch resume error:', error);
    res.status(500).json({ error: '更新简历失败' });
  }
});

router.get('/:id', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const resume = await getRow<Resume>('SELECT * FROM resumes WHERE id = ?', [id]);
    if (!resume) {
      return res.status(404).json({ error: '简历不存在' });
    }

    const workExperiences = await getRows<WorkExperience>('SELECT * FROM workExperiences WHERE resumeId = ? ORDER BY startTime DESC', [id]);
    const projectExperiences = await getRows<ProjectExperience>('SELECT * FROM projectExperiences WHERE resumeId = ? ORDER BY startTime DESC', [id]);

    res.json({
      ...resume,
      workExperiences,
      projectExperiences
    });
  } catch (error) {
    console.error('Get resume by id error:', error);
    res.status(500).json({ error: '获取简历失败' });
  }
});

export default router;
