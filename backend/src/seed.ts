import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getRow } from './db';
import fs from 'fs';
import path from 'path';

const seedData = async () => {
  const now = new Date().toISOString();

  console.log('开始插入种子数据...');

  const dbPath = path.join(__dirname, '../data/recruitment.db');
  if (fs.existsSync(dbPath)) {
    console.log('删除旧数据库...');
    fs.unlinkSync(dbPath);
  }

  const company1Id = uuidv4();
  await runQuery(
    'INSERT INTO companies (id, name, industry, size, description, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [company1Id, '智联科技有限公司', '互联网', '100-499', '智联科技是一家专注于人工智能和大数据领域的创新型科技公司，致力于为企业提供智能化解决方案。我们拥有一支充满激情和创造力的团队，欢迎优秀人才加入！', '北京市海淀区中关村软件园', now, now]
  );

  const company2Id = uuidv4();
  await runQuery(
    'INSERT INTO companies (id, name, industry, size, description, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [company2Id, '未来金融服务集团', '金融', '500-999', '未来金融是国内领先的金融科技公司，专注于为个人和企业提供创新的金融服务。我们以科技驱动金融，让金融更普惠、更高效。', '上海市浦东新区陆家嘴金融中心', now, now]
  );

  const company3Id = uuidv4();
  await runQuery(
    'INSERT INTO companies (id, name, industry, size, description, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [company3Id, '云端教育科技', '教育', '20-99', '云端教育致力于用科技改变教育，为K12和职业教育领域提供在线学习解决方案。我们相信每个孩子都应该获得优质的教育资源。', '杭州市西湖区文三路', now, now]
  );

  const company4Id = uuidv4();
  await runQuery(
    'INSERT INTO companies (id, name, industry, size, description, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [company4Id, '健康医疗科技', '医疗健康', '100-499', '健康医疗科技专注于智慧医疗领域，通过AI和大数据技术提升医疗服务效率和质量，让每个人都能享受优质的医疗服务。', '深圳市南山区科技园', now, now]
  );

  const hashedPassword = await bcrypt.hash('123456', 10);

  const hr1Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [hr1Id, 'hr1@zhilian.com', hashedPassword, 'hr', '张经理', '13800138001', company1Id, now, now]
  );

  const hr2Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [hr2Id, 'hr2@weilai.com', hashedPassword, 'hr', '李主管', '13800138002', company2Id, now, now]
  );

  const hr3Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [hr3Id, 'hr3@yunduan.com', hashedPassword, 'hr', '王老师', '13800138003', company3Id, now, now]
  );

  const hr4Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, companyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [hr4Id, 'hr4@health.com', hashedPassword, 'hr', '赵主管', '13800138004', company4Id, now, now]
  );

  const jobseeker1Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [jobseeker1Id, 'zhangsan@example.com', hashedPassword, 'jobseeker', '张三', '13900139001', now, now]
  );

  const jobseeker2Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [jobseeker2Id, 'lisi@example.com', hashedPassword, 'jobseeker', '李四', '13900139002', now, now]
  );

  const jobseeker3Id = uuidv4();
  await runQuery(
    'INSERT INTO users (id, email, password, role, name, phone, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [jobseeker3Id, 'wangwu@example.com', hashedPassword, 'jobseeker', '王五', '13900139003', now, now]
  );

  const resume1Id = uuidv4();
  await runQuery(
    `INSERT INTO resumes (
      id, userId, name, phone, email, gender, birthday, currentCity,
      education, major, graduationYear, workYears,
      currentPosition, currentCompany, currentSalary,
      expectedSalary, expectedCity, expectedPosition,
      selfIntroduction, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resume1Id, jobseeker1Id, '张三', '13900139001', 'zhangsan@example.com', 'male', '1995-06-15', '北京',
      'bachelor', '计算机科学与技术', 2018, 5,
      '高级前端工程师', '某互联网公司', '25K',
      '30K-40K', '北京', '前端架构师',
      '5年前端开发经验，精通React生态，有大型项目架构经验。热爱技术，善于学习新事物。',
      now, now
    ]
  );

  const workId1 = uuidv4();
  await runQuery(
    `INSERT INTO workExperiences (
      id, resumeId, company, position, startTime, endTime, isCurrent, description, salary, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      workId1, resume1Id, '某知名互联网公司', '前端工程师', '2018-07', '2021-06', 0,
      '负责电商平台的前端开发，参与性能优化项目，页面加载速度提升40%。', '18K', now, now
    ]
  );

  const workId2 = uuidv4();
  await runQuery(
    `INSERT INTO workExperiences (
      id, resumeId, company, position, startTime, isCurrent, description, salary, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      workId2, resume1Id, '某互联网公司', '高级前端工程师', '2021-07', 1,
      '负责核心业务系统的前端架构设计和开发，带领5人小组完成多个重要项目。', '25K', now, now
    ]
  );

  const projectId1 = uuidv4();
  await runQuery(
    `INSERT INTO projectExperiences (
      id, resumeId, name, role, startTime, endTime, description, technologies, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      projectId1, resume1Id, '电商平台重构', '前端负责人', '2022-01', '2022-12',
      '主导电商平台从Vue2迁移到React18的技术重构，设计微前端架构，提升了开发效率和系统稳定性。',
      'React, TypeScript, Webpack, Micro-Frontend', now, now
    ]
  );

  const resume2Id = uuidv4();
  await runQuery(
    `INSERT INTO resumes (
      id, userId, name, phone, email, gender, birthday, currentCity,
      education, major, graduationYear, workYears,
      currentPosition, currentCompany, currentSalary,
      expectedSalary, expectedCity, expectedPosition,
      selfIntroduction, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resume2Id, jobseeker2Id, '李四', '13900139002', 'lisi@example.com', 'male', '1996-03-20', '上海',
      'bachelor', '软件工程', 2019, 4,
      'Java后端开发工程师', '某金融科技公司', '22K',
      '25K-35K', '上海', '后端架构师',
      '4年Java后端开发经验，熟悉Spring生态，有高并发系统设计经验。',
      now, now
    ]
  );

  const workId3 = uuidv4();
  await runQuery(
    `INSERT INTO workExperiences (
      id, resumeId, company, position, startTime, isCurrent, description, salary, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      workId3, resume2Id, '某金融科技公司', 'Java后端开发工程师', '2019-07', 1,
      '负责支付系统的设计与开发，处理峰值QPS达10000+，系统可用性99.99%。', '22K', now, now
    ]
  );

  const resume3Id = uuidv4();
  await runQuery(
    `INSERT INTO resumes (
      id, userId, name, phone, email, gender, birthday, currentCity,
      education, major, graduationYear, workYears,
      currentPosition, currentCompany, currentSalary,
      expectedSalary, expectedCity, expectedPosition,
      selfIntroduction, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resume3Id, jobseeker3Id, '王五', '13900139003', 'wangwu@example.com', 'female', '1998-09-10', '杭州',
      'master', '应用数学', 2023, 1,
      '算法工程师', '某AI创业公司', '28K',
      '35K-50K', '北京', '算法研究员',
      '硕士学历，有NLP和推荐系统研究经验，在ACL发表过论文。',
      now, now
    ]
  );

  const jobs = [
    {
      title: '高级前端工程师',
      description: '负责公司核心产品的前端开发工作，参与技术架构设计，优化用户体验。',
      requirements: '1. 本科及以上学历，计算机相关专业；\n2. 3年以上前端开发经验；\n3. 精通React/Vue等前端框架；\n4. 熟悉TypeScript，了解Node.js；\n5. 有大型项目经验者优先。',
      benefits: '五险一金、年终奖、带薪年假、定期团建、技术培训、弹性工作',
      salaryMin: 25,
      salaryMax: 45,
      city: '北京',
      experience: '3-5',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr1Id,
      companyId: company1Id
    },
    {
      title: 'Java后端开发工程师',
      description: '负责后端服务的设计与开发，保障系统的高可用和高性能。',
      requirements: '1. 本科及以上学历；\n2. 2年以上Java开发经验；\n3. 熟悉Spring Boot、MyBatis等框架；\n4. 熟悉MySQL、Redis等数据库；\n5. 有微服务架构经验者优先。',
      benefits: '五险一金、股票期权、餐补、交通补、年度体检',
      salaryMin: 20,
      salaryMax: 35,
      city: '北京',
      experience: '1-3',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr1Id,
      companyId: company1Id
    },
    {
      title: '算法工程师',
      description: '参与AI产品的算法研发，包括自然语言处理、机器学习等方向。',
      requirements: '1. 硕士及以上学历，计算机、数学相关专业；\n2. 熟悉常用机器学习和深度学习算法；\n3. 熟练使用Python、TensorFlow/PyTorch；\n4. 有NLP或CV项目经验者优先。',
      benefits: '五险一金、高额年终奖、学术假、论文奖励、导师制',
      salaryMin: 35,
      salaryMax: 60,
      city: '北京',
      experience: '1-3',
      education: 'master',
      type: 'fulltime',
      hrId: hr1Id,
      companyId: company1Id
    },
    {
      title: '风控分析师',
      description: '负责金融产品的风险评估和控制，建立风控模型和策略。',
      requirements: '1. 本科及以上学历，金融、统计、数学相关专业；\n2. 2年以上风控相关工作经验；\n3. 熟悉风控建模和数据分析方法；\n4. 了解金融监管政策。',
      benefits: '五险一金、绩效奖金、年度旅游、员工理财优惠',
      salaryMin: 18,
      salaryMax: 30,
      city: '上海',
      experience: '1-3',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr2Id,
      companyId: company2Id
    },
    {
      title: '产品经理',
      description: '负责金融产品的规划和设计，协调研发、运营团队推动产品落地。',
      requirements: '1. 本科及以上学历；\n2. 3年以上互联网产品经理经验；\n3. 有金融科技产品经验者优先；\n4. 优秀的沟通协调能力和数据分析能力。',
      benefits: '五险一金、项目奖金、年度体检、专业培训',
      salaryMin: 25,
      salaryMax: 40,
      city: '上海',
      experience: '3-5',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr2Id,
      companyId: company2Id
    },
    {
      title: '课程设计师',
      description: '负责K12在线课程的设计和开发，确保课程质量和教学效果。',
      requirements: '1. 本科及以上学历，教育相关专业优先；\n2. 2年以上课程设计或教学经验；\n3. 熟悉中小学课程标准；\n4. 有在线教育经验者优先。',
      benefits: '五险一金、寒暑假、节日福利、子女教育优惠',
      salaryMin: 12,
      salaryMax: 20,
      city: '杭州',
      experience: '1-3',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr3Id,
      companyId: company3Id
    },
    {
      title: '前端开发实习生',
      description: '参与公司产品的前端开发工作，学习前沿技术。',
      requirements: '1. 本科及以上在读学生；\n2. 了解HTML、CSS、JavaScript基础；\n3. 了解React或Vue框架优先；\n4. 每周至少实习4天，实习期3个月以上。',
      benefits: '实习补贴、转正机会、导师带教、免费午餐',
      salaryMin: 4,
      salaryMax: 6,
      city: '杭州',
      experience: 'fresh',
      education: 'bachelor',
      type: 'internship',
      hrId: hr3Id,
      companyId: company3Id
    },
    {
      title: '医疗AI研究员',
      description: '从事医疗影像AI算法研究，推动技术创新和产品化。',
      requirements: '1. 博士学历，计算机、生物医学工程相关专业；\n2. 有医疗影像或深度学习研究背景；\n3. 在顶级会议发表过论文者优先；\n4. 熟悉PyTorch/TensorFlow等框架。',
      benefits: '五险一金、科研经费、股权激励、学术交流机会',
      salaryMin: 50,
      salaryMax: 80,
      city: '深圳',
      experience: 'fresh',
      education: 'doctor',
      type: 'fulltime',
      hrId: hr4Id,
      companyId: company4Id
    },
    {
      title: '运维工程师',
      description: '负责公司服务器和网络系统的运维工作，保障系统稳定运行。',
      requirements: '1. 大专及以上学历；\n2. 1年以上Linux运维经验；\n3. 熟悉Docker、K8s等容器技术；\n4. 有云平台使用经验（阿里云/腾讯云）。',
      benefits: '五险一金、夜班补贴、年度体检、技术培训',
      salaryMin: 10,
      salaryMax: 18,
      city: '深圳',
      experience: '1-3',
      education: 'college',
      type: 'fulltime',
      hrId: hr4Id,
      companyId: company4Id
    },
    {
      title: '远程客服专员',
      description: '在线解答用户咨询，处理用户反馈和投诉。',
      requirements: '1. 大专及以上学历；\n2. 普通话标准，沟通能力强；\n3. 有客服经验优先；\n4. 能接受轮班制。',
      benefits: '五险一金、居家办公、绩效奖金、节日福利',
      salaryMin: 6,
      salaryMax: 10,
      city: '其他',
      experience: 'fresh',
      education: 'college',
      type: 'remote',
      hrId: hr1Id,
      companyId: company1Id
    },
    {
      title: 'UI/UX设计师',
      description: '负责产品的界面设计和用户体验优化，参与产品迭代。',
      requirements: '1. 本科及以上学历，设计相关专业；\n2. 2年以上UI设计经验；\n3. 精通Figma、Sketch等设计工具；\n4. 有完整的作品集。',
      benefits: '五险一金、设计软件补贴、艺术展参观、创意空间',
      salaryMin: 15,
      salaryMax: 28,
      city: '成都',
      experience: '1-3',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr2Id,
      companyId: company2Id
    },
    {
      title: '数据分析师',
      description: '负责业务数据分析，输出数据报告和决策建议。',
      requirements: '1. 本科及以上学历，统计、数学相关专业；\n2. 2年以上数据分析经验；\n3. 熟练使用SQL、Python/R；\n4. 熟悉Tableau等BI工具。',
      benefits: '五险一金、数据大会门票、技能培训、年度体检',
      salaryMin: 15,
      salaryMax: 25,
      city: '武汉',
      experience: '1-3',
      education: 'bachelor',
      type: 'fulltime',
      hrId: hr1Id,
      companyId: company1Id
    }
  ];

  const jobIds: string[] = [];
  for (const job of jobs) {
    const jobId = uuidv4();
    const viewCount = Math.floor(Math.random() * 500) + 50;
    const applyCount = Math.floor(Math.random() * 50) + 5;
    await runQuery(
      `INSERT INTO jobs (
        id, title, description, requirements, benefits,
        salaryMin, salaryMax, salaryType, city, experience, education, type,
        companyId, hrId, viewCount, applyCount, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'monthly', ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        jobId, job.title, job.description, job.requirements, job.benefits,
        job.salaryMin, job.salaryMax, job.city, job.experience, job.education, job.type,
        job.companyId, job.hrId, viewCount, applyCount, now, now
      ]
    );
    jobIds.push(jobId);
  }

  const statuses: Array<'applied' | 'pending' | 'interview' | 'hired' | 'rejected'> = ['applied', 'pending', 'interview', 'hired', 'rejected'];
  const resumes = [
    { id: resume1Id, userId: jobseeker1Id },
    { id: resume2Id, userId: jobseeker2Id },
    { id: resume3Id, userId: jobseeker3Id },
  ];

  for (let i = 0; i < 8; i++) {
    const jobId = jobIds[i % jobIds.length];
    const resume = resumes[i % resumes.length];
    const status = statuses[i % statuses.length];
    
    const existing = await getRow(
      'SELECT id FROM applications WHERE jobId = ? AND userId = ?',
      [jobId, resume.userId]
    );
    
    if (!existing) {
      const appId = uuidv4();
      await runQuery(
        `INSERT INTO applications (
          id, jobId, userId, resumeId, status, hrNotes, appliedAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          appId, jobId, resume.userId, resume.id, status,
          status === 'pending' ? '简历已通过初筛，待电话沟通' :
          status === 'interview' ? '已安排面试' :
          status === 'hired' ? '已发放offer，等待入职' :
          status === 'rejected' ? '简历不符合要求，已拒绝' : null,
          now, now
        ]
      );

      if (status === 'interview') {
        const interviewId = uuidv4();
        const interviewDate = new Date();
        interviewDate.setDate(interviewDate.getDate() + Math.floor(Math.random() * 7) + 1);
        const job = await getRow<{ hrId: string }>('SELECT hrId FROM jobs WHERE id = ?', [jobId]);
        
        await runQuery(
          `INSERT INTO interviews (
            id, applicationId, jobId, userId, hrId, type, dateTime, location, notes, status, result, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', 'pending', ?, ?)`,
          [
            interviewId, appId, jobId, resume.userId, job?.hrId || hr1Id,
            i % 3 === 0 ? 'phone' : i % 3 === 1 ? 'onsite' : 'video',
            interviewDate.toISOString().slice(0, 16),
            i % 3 === 1 ? '北京市海淀区中关村大厦A座10层' : i % 3 === 2 ? '腾讯会议：123-456-789' : null,
            '请准备好相关项目介绍，面试时长约30分钟。',
            now, now
          ]
        );
      }
    }
  }

  console.log('种子数据插入完成！');
  console.log('');
  console.log('=== HR 账号 ===');
  console.log('智联科技: hr1@zhilian.com / 密码: 123456');
  console.log('未来金融: hr2@weilai.com / 密码: 123456');
  console.log('云端教育: hr3@yunduan.com / 密码: 123456');
  console.log('健康医疗: hr4@health.com / 密码: 123456');
  console.log('');
  console.log('=== 求职者账号 ===');
  console.log('张三: zhangsan@example.com / 密码: 123456 (前端工程师)');
  console.log('李四: lisi@example.com / 密码: 123456 (后端工程师)');
  console.log('王五: wangwu@example.com / 密码: 123456 (算法工程师)');
};

seedData().catch(console.error);
