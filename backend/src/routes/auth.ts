import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getRow, runQuery } from '../db';
import { User, Company, AuthResponse } from '../types';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, companyName, industry, size, companyAddress, companyDescription } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: '请填写必要信息' });
    }

    const existingUser = await getRow<User>('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: '该邮箱已被注册' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    const now = new Date().toISOString();

    let companyId: string | undefined;

    if (role === 'hr') {
      if (!companyName || !industry || !size || !companyAddress) {
        return res.status(400).json({ error: '请填写企业信息' });
      }
      companyId = uuidv4();
      await runQuery(
        'INSERT INTO companies (id, name, industry, size, description, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [companyId, companyName, industry, size, companyDescription || '', companyAddress, now, now]
      );
    }

    await runQuery(
      'INSERT INTO users (id, email, password, role, name, phone, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, email, hashedPassword, role, name, phone || null, companyId || null, now, now]
    );

    const token = jwt.sign({ id: userId, role, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const user = await getRow<User>('SELECT id, email, role, name, phone, avatar, companyId, createdAt, updatedAt FROM users WHERE id = ?', [userId]);
    
    let company: Company | undefined;
    if (companyId) {
      company = await getRow<Company>('SELECT * FROM companies WHERE id = ?', [companyId]);
    }

    res.json({ token, user, company } as AuthResponse);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '注册失败' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: '请填写邮箱、密码和角色' });
    }

    const user = await getRow<User>('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
    if (!user) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    
    const { password: _, ...userWithoutPassword } = user;
    
    let company: Company | undefined;
    if (user.companyId) {
      company = await getRow<Company>('SELECT * FROM companies WHERE id = ?', [user.companyId]);
    }

    res.json({ token, user: userWithoutPassword, company } as AuthResponse);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '登录失败' });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = await getRow<User>('SELECT id, email, role, name, phone, avatar, companyId, createdAt, updatedAt FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    let company: Company | undefined;
    if (user.companyId) {
      company = await getRow<Company>('SELECT * FROM companies WHERE id = ?', [user.companyId]);
    }

    res.json({ user, company });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: '未登录' });
    }

    const { name, phone, avatar } = req.body;
    const now = new Date().toISOString();

    await runQuery(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar), updatedAt = ? WHERE id = ?',
      [name || null, phone || null, avatar || null, now, req.user.id]
    );

    const user = await getRow<User>('SELECT id, email, role, name, phone, avatar, companyId, createdAt, updatedAt FROM users WHERE id = ?', [req.user.id]);
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: '更新个人信息失败' });
  }
});

export default router;
