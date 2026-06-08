import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRow, getRows, runQuery } from '../db';
import { Application, ApplicationStatus } from '../types';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/my', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { status } = req.query;

    let sql = `
      SELECT a.*, j.title, j.salaryMin, j.salaryMax, j.city, j.experience, j.type,
             c.name as companyName, c.logo as companyLogo
      FROM applications a
      LEFT JOIN jobs j ON a.jobId = j.id
      LEFT JOIN companies c ON j.companyId = c.id
      WHERE a.userId = ?
    `;
    const params: any[] = [req.user.id];

    if (status && status !== 'all') {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY a.updatedAt DESC';

    const applications = await getRows(sql, params);
    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: '获取投递记录失败' });
  }
});

router.put('/:id/status', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const { status, hrNotes } = req.body;

    const validStatuses: ApplicationStatus[] = ['applied', 'pending', 'interview', 'hired', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const application = await getRow<Application>('SELECT * FROM applications WHERE id = ?', [id]);
    if (!application) {
      return res.status(404).json({ error: '投递记录不存在' });
    }

    const job = await getRow<{ hrId: string }>('SELECT hrId FROM jobs WHERE id = ?', [application.jobId]);
    if (!job || job.hrId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此投递记录' });
    }

    const now = new Date().toISOString();
    await runQuery(
      'UPDATE applications SET status = ?, hrNotes = COALESCE(?, hrNotes), updatedAt = ? WHERE id = ?',
      [status, hrNotes || null, now, id]
    );

    const updatedApplication = await getRow<Application>('SELECT * FROM applications WHERE id = ?', [id]);
    res.json(updatedApplication);
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: '更新状态失败' });
  }
});

router.get('/stats', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const stats = await getRows(`
      SELECT status, COUNT(*) as count
      FROM applications
      WHERE userId = ?
      GROUP BY status
    `, [req.user.id]);

    const result: Record<string, number> = {
      applied: 0,
      pending: 0,
      interview: 0,
      hired: 0,
      rejected: 0
    };

    stats.forEach((s: any) => {
      result[s.status] = s.count;
    });

    res.json(result);
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

export default router;
