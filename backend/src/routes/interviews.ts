import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRow, getRows, runQuery } from '../db';
import { Interview, Application } from '../types';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { applicationId, type, dateTime, location, notes } = req.body;

    if (!applicationId || !type || !dateTime) {
      return res.status(400).json({ error: '请填写必要信息' });
    }

    const application = await getRow<Application>('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (!application) {
      return res.status(404).json({ error: '投递记录不存在' });
    }

    const job = await getRow<{ hrId: string }>('SELECT hrId FROM jobs WHERE id = ?', [application.jobId]);
    if (!job || job.hrId !== req.user.id) {
      return res.status(403).json({ error: '无权限发起面试邀请' });
    }

    const interviewId = uuidv4();
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO interviews (
        id, applicationId, jobId, userId, hrId, type, dateTime, location, notes, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)`,
      [interviewId, applicationId, application.jobId, application.userId, req.user.id, type, dateTime, location || null, notes || null, now, now]
    );

    await runQuery(
      'UPDATE applications SET status = \'interview\', updatedAt = ? WHERE id = ?',
      [now, applicationId]
    );

    const interview = await getRow<Interview>('SELECT * FROM interviews WHERE id = ?', [interviewId]);
    res.status(201).json(interview);
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ error: '创建面试邀请失败' });
  }
});

router.get('/my', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    let sql = `
      SELECT i.*, j.title, c.name as companyName,
             u.name as userName, u.email as userEmail, u.phone as userPhone
      FROM interviews i
      LEFT JOIN jobs j ON i.jobId = j.id
      LEFT JOIN companies c ON j.companyId = c.id
      LEFT JOIN users u ON i.userId = u.id
      WHERE 
    `;
    const params: any[] = [];

    if (req.user.role === 'hr') {
      sql += 'i.hrId = ?';
      params.push(req.user.id);
    } else {
      sql += 'i.userId = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY i.dateTime DESC';

    const interviews = await getRows(sql, params);
    res.json(interviews);
  } catch (error) {
    console.error('Get my interviews error:', error);
    res.status(500).json({ error: '获取面试列表失败' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const { status, result, notes } = req.body;

    const interview = await getRow<Interview>('SELECT * FROM interviews WHERE id = ?', [id]);
    if (!interview) {
      return res.status(404).json({ error: '面试记录不存在' });
    }

    if (interview.hrId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此面试记录' });
    }

    const now = new Date().toISOString();
    await runQuery(
      `UPDATE interviews SET 
        status = COALESCE(?, status),
        result = COALESCE(?, result),
        notes = COALESCE(?, notes),
        updatedAt = ?
      WHERE id = ?`,
      [status || null, result || null, notes || null, now, id]
    );

    const updatedInterview = await getRow<Interview>('SELECT * FROM interviews WHERE id = ?', [id]);
    res.json(updatedInterview);
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: '更新面试记录失败' });
  }
});

export default router;
