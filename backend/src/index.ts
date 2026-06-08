import express from 'express';
import cors from 'cors';
import path from 'path';
import { PORT, UPLOAD_DIR } from './config';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import resumeRoutes from './routes/resumes';
import applicationRoutes from './routes/applications';
import interviewRoutes from './routes/interviews';
import hrRoutes from './routes/hr';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../', UPLOAD_DIR)));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/hr', hrRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '求职招聘平台 API 服务运行正常' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

export default app;
