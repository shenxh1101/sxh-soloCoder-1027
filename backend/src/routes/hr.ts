import { Router } from 'express';
import { getRow, getRows } from '../db';
import { Job, Application } from '../types';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/jobs', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { status, page = 1, pageSize = 10 } = req.query;

    let sql = `
      SELECT j.*, c.name as companyName, c.logo as companyLogo
      FROM jobs j
      LEFT JOIN companies c ON j.companyId = c.id
      WHERE j.hrId = ?
    `;
    const params: any[] = [req.user.id];

    if (status && status !== 'all') {
      sql += ' AND j.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY j.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize as string), (parseInt(page as string) - 1) * parseInt(pageSize as string));

    const jobs = await getRows(sql, params);

    const countSql = 'SELECT COUNT(*) as total FROM jobs WHERE hrId = ?' + (status && status !== 'all' ? ' AND status = ?' : '');
    const countParams = status && status !== 'all' ? [req.user.id, status] : [req.user.id];
    const countResult = await getRow<{ total: number }>(countSql, countParams as any[]);

    res.json({
      list: jobs,
      total: countResult?.total || 0,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
  } catch (error) {
    console.error('Get HR jobs error:', error);
    res.status(500).json({ error: '获取职位列表失败' });
  }
});

router.get('/applications', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { jobId, status, keyword, page = 1, pageSize = 10 } = req.query;

    let sql = `
      SELECT a.*, j.title, r.name as applicantName, r.phone as applicantPhone, 
             r.email as applicantEmail, r.education, r.workYears,
             r.currentPosition, r.currentCompany
      FROM applications a
      LEFT JOIN jobs j ON a.jobId = j.id
      LEFT JOIN resumes r ON a.resumeId = r.id
      WHERE j.hrId = ?
    `;
    const params: any[] = [req.user.id];

    if (jobId) {
      sql += ' AND a.jobId = ?';
      params.push(jobId);
    }
    if (status && status !== 'all') {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    if (keyword) {
      sql += ' AND (r.name LIKE ? OR j.title LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY a.updatedAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize as string), (parseInt(page as string) - 1) * parseInt(pageSize as string));

    const applications = await getRows(sql, params);

    let countSql = `
      SELECT COUNT(*) as total
      FROM applications a
      LEFT JOIN jobs j ON a.jobId = j.id
      LEFT JOIN resumes r ON a.resumeId = r.id
      WHERE j.hrId = ?
    `;
    const countParams = params.slice(0, -2);
    if (params.length > 2) {
      countSql += ' AND ' + sql.split('WHERE')[1].split('ORDER')[0].trim().replace('LIMIT ? OFFSET ?', '').trim();
    }
    const countResult = await getRow<{ total: number }>(countSql, countParams);

    res.json({
      list: applications,
      total: countResult?.total || 0,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
  } catch (error) {
    console.error('Get HR applications error:', error);
    res.status(500).json({ error: '获取简历列表失败' });
  }
});

router.get('/stats', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = await getRow<{ companyId: string }>('SELECT companyId FROM users WHERE id = ?', [req.user.id]);
    if (!user?.companyId) {
      return res.status(400).json({ error: '未关联企业信息' });
    }

    const jobStats = await getRows(`
      SELECT 
        SUM(viewCount) as totalViews,
        SUM(applyCount) as totalApplies,
        COUNT(*) as totalJobs
      FROM jobs 
      WHERE hrId = ?
    `, [req.user.id]);

    const applicationStats = await getRows(`
      SELECT a.status, COUNT(*) as count
      FROM applications a
      LEFT JOIN jobs j ON a.jobId = j.id
      WHERE j.hrId = ?
      GROUP BY a.status
    `, [req.user.id]);

    const applicationsByStatus: Record<string, number> = {
      applied: 0,
      pending: 0,
      interview: 0,
      hired: 0,
      rejected: 0
    };

    applicationStats.forEach((s: any) => {
      applicationsByStatus[s.status] = s.count;
    });

    const topJobs = await getRows(`
      SELECT id, title, viewCount, applyCount
      FROM jobs
      WHERE hrId = ?
      ORDER BY applyCount DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({
      totalViews: jobStats[0]?.totalViews || 0,
      totalApplies: jobStats[0]?.totalApplies || 0,
      totalJobs: jobStats[0]?.totalJobs || 0,
      applicationsByStatus,
      topJobs
    });
  } catch (error) {
    console.error('Get HR stats error:', error);
    res.status(500).json({ error: '获取统计数据失败' });
  }
});

router.get('/job/:id/stats', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const job = await getRow<Job>('SELECT * FROM jobs WHERE id = ? AND hrId = ?', [id, req.user.id]);

    if (!job) {
      return res.status(404).json({ error: '职位不存在或无权限查看' });
    }

    const applicationStats = await getRows(`
      SELECT status, COUNT(*) as count
      FROM applications
      WHERE jobId = ?
      GROUP BY status
    `, [id]);

    const stats: Record<string, number> = {
      applied: 0,
      pending: 0,
      interview: 0,
      hired: 0,
      rejected: 0
    };

    applicationStats.forEach((s: any) => {
      stats[s.status] = s.count;
    });

    res.json({
      viewCount: job.viewCount,
      applyCount: job.applyCount,
      applicationStats: stats
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ error: '获取职位统计失败' });
  }
});

export default router;
