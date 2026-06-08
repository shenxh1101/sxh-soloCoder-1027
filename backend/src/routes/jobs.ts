import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getRow, getRows, runQuery } from '../db';
import { Job, Company, Favorite, Application } from '../types';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { 
      keyword, 
      city, 
      salary, 
      experience, 
      education, 
      type, 
      page = 1, 
      pageSize = 10 
    } = req.query;

    let sql = `
      SELECT j.*, c.name as companyName, c.logo as companyLogo, c.industry, c.size 
      FROM jobs j 
      LEFT JOIN companies c ON j.companyId = c.id 
      WHERE j.status = 'active'
    `;
    const params: any[] = [];

    if (keyword) {
      sql += ' AND (j.title LIKE ? OR j.description LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (city && city !== 'all') {
      sql += ' AND j.city = ?';
      params.push(city);
    }
    if (salary && salary !== 'all') {
      const [min, max] = (salary as string).split('-');
      if (min && max) {
        sql += ' AND j.salaryMin >= ? AND j.salaryMax <= ?';
        params.push(parseInt(min), parseInt(max));
      } else if (min) {
        sql += ' AND j.salaryMin >= ?';
        params.push(parseInt(min));
      }
    }
    if (experience && experience !== 'all') {
      sql += ' AND j.experience = ?';
      params.push(experience);
    }
    if (education && education !== 'all') {
      sql += ' AND j.education = ?';
      params.push(education);
    }
    if (type && type !== 'all') {
      sql += ' AND j.type = ?';
      params.push(type);
    }

    sql += ' ORDER BY j.createdAt DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize as string), (parseInt(page as string) - 1) * parseInt(pageSize as string));

    const jobs = await getRows(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM jobs j WHERE j.status = \'active\'';
    const countParams = params.slice(0, -2);
    if (params.length > 2) {
      countSql += ' AND ' + sql.split('WHERE')[1].split('ORDER')[0].trim().replace('LIMIT ? OFFSET ?', '').trim();
    }
    const countResult = await getRow<{ total: number }>(countSql, countParams);

    res.json({
      list: jobs,
      total: countResult?.total || 0,
      page: parseInt(page as string),
      pageSize: parseInt(pageSize as string)
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: '获取职位列表失败' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await getRow(`
      SELECT j.*, c.name as companyName, c.logo as companyLogo, c.industry, c.size, c.description as companyDescription, c.address, c.website
      FROM jobs j 
      LEFT JOIN companies c ON j.companyId = c.id 
      WHERE j.id = ?
    `, [id]);

    if (!job) {
      return res.status(404).json({ error: '职位不存在' });
    }

    await runQuery('UPDATE jobs SET viewCount = viewCount + 1 WHERE id = ?', [id]);
    await runQuery('INSERT INTO jobViews (id, jobId, viewedAt) VALUES (?, ?, ?)', [uuidv4(), id, new Date().toISOString()]);

    res.json(job);
  } catch (error) {
    console.error('Get job detail error:', error);
    res.status(500).json({ error: '获取职位详情失败' });
  }
});

router.post('/', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const {
      title, description, requirements, benefits,
      salaryMin, salaryMax, salaryType = 'monthly',
      city, district, experience, education, type
    } = req.body;

    if (!title || !description || !requirements || !salaryMin || !salaryMax || !city || !experience || !education || !type) {
      return res.status(400).json({ error: '请填写完整的职位信息' });
    }

    const user = await getRow<{ companyId: string }>('SELECT companyId FROM users WHERE id = ?', [req.user.id]);
    if (!user?.companyId) {
      return res.status(400).json({ error: '未关联企业信息' });
    }

    const jobId = uuidv4();
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO jobs (
        id, title, description, requirements, benefits,
        salaryMin, salaryMax, salaryType, city, district,
        experience, education, type, companyId, hrId,
        viewCount, applyCount, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'active', ?, ?)`,
      [
        jobId, title, description, requirements, benefits || '',
        salaryMin, salaryMax, salaryType, city, district || '',
        experience, education, type, user.companyId, req.user.id,
        now, now
      ]
    );

    const job = await getRow<Job>('SELECT * FROM jobs WHERE id = ?', [jobId]);
    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: '发布职位失败' });
  }
});

router.put('/:id', authenticateToken, requireRole(['hr']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const job = await getRow<Job>('SELECT * FROM jobs WHERE id = ?', [id]);

    if (!job) {
      return res.status(404).json({ error: '职位不存在' });
    }

    if (job.hrId !== req.user.id) {
      return res.status(403).json({ error: '无权限修改此职位' });
    }

    const {
      title, description, requirements, benefits,
      salaryMin, salaryMax, salaryType,
      city, district, experience, education, type, status
    } = req.body;

    const now = new Date().toISOString();

    await runQuery(
      `UPDATE jobs SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        requirements = COALESCE(?, requirements),
        benefits = COALESCE(?, benefits),
        salaryMin = COALESCE(?, salaryMin),
        salaryMax = COALESCE(?, salaryMax),
        salaryType = COALESCE(?, salaryType),
        city = COALESCE(?, city),
        district = COALESCE(?, district),
        experience = COALESCE(?, experience),
        education = COALESCE(?, education),
        type = COALESCE(?, type),
        status = COALESCE(?, status),
        updatedAt = ?
      WHERE id = ?`,
      [
        title || null, description || null, requirements || null, benefits || null,
        salaryMin || null, salaryMax || null, salaryType || null,
        city || null, district || null, experience || null, education || null, type || null,
        status || null, now, id
      ]
    );

    const updatedJob = await getRow<Job>('SELECT * FROM jobs WHERE id = ?', [id]);
    res.json(updatedJob);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: '更新职位失败' });
  }
});

router.post('/:id/favorite', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const job = await getRow<Job>('SELECT * FROM jobs WHERE id = ?', [id]);

    if (!job) {
      return res.status(404).json({ error: '职位不存在' });
    }

    const existingFavorite = await getRow<Favorite>('SELECT * FROM favorites WHERE userId = ? AND jobId = ?', [req.user.id, id]);
    
    if (existingFavorite) {
      await runQuery('DELETE FROM favorites WHERE id = ?', [existingFavorite.id]);
      res.json({ favorited: false });
    } else {
      const favoriteId = uuidv4();
      await runQuery('INSERT INTO favorites (id, userId, jobId, createdAt) VALUES (?, ?, ?, ?)', [favoriteId, req.user.id, id, new Date().toISOString()]);
      res.json({ favorited: true });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: '操作失败' });
  }
});

router.get('/favorites/list', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const favorites = await getRows(`
      SELECT f.*, j.title, j.salaryMin, j.salaryMax, j.city, j.experience, j.type,
             c.name as companyName, c.logo as companyLogo
      FROM favorites f
      LEFT JOIN jobs j ON f.jobId = j.id
      LEFT JOIN companies c ON j.companyId = c.id
      WHERE f.userId = ?
      ORDER BY f.createdAt DESC
    `, [req.user.id]);

    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: '获取收藏列表失败' });
  }
});

router.post('/:id/apply', authenticateToken, requireRole(['jobseeker']), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { id } = req.params;
    const job = await getRow<Job>('SELECT * FROM jobs WHERE id = ? AND status = \'active\'', [id]);

    if (!job) {
      return res.status(404).json({ error: '职位不存在或已关闭' });
    }

    const existingApplication = await getRow<Application>('SELECT * FROM applications WHERE jobId = ? AND userId = ?', [id, req.user.id]);
    if (existingApplication) {
      return res.status(400).json({ error: '您已投递过此职位' });
    }

    const resume = await getRow<{ id: string }>('SELECT id FROM resumes WHERE userId = ?', [req.user.id]);
    if (!resume) {
      return res.status(400).json({ error: '请先完善简历信息' });
    }

    const applicationId = uuidv4();
    const now = new Date().toISOString();

    await runQuery(
      'INSERT INTO applications (id, jobId, userId, resumeId, status, appliedAt, updatedAt) VALUES (?, ?, ?, ?, \'applied\', ?, ?)',
      [applicationId, id, req.user.id, resume.id, now, now]
    );

    await runQuery('UPDATE jobs SET applyCount = applyCount + 1 WHERE id = ?', [id]);

    const application = await getRow<Application>('SELECT * FROM applications WHERE id = ?', [applicationId]);
    res.status(201).json(application);
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: '投递失败' });
  }
});

export default router;
