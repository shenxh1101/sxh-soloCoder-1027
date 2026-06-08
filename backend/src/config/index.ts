export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
export const JWT_EXPIRES_IN = '7d';
export const PORT = process.env.PORT || 3001;
export const UPLOAD_DIR = 'uploads';
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const SALARY_RANGES = [
  { label: '不限', value: 'all' },
  { label: '10K以下', value: '0-10' },
  { label: '10K-20K', value: '10-20' },
  { label: '20K-40K', value: '20-40' },
  { label: '40K-60K', value: '40-60' },
  { label: '60K以上', value: '60-' },
];

export const EXPERIENCE_OPTIONS = [
  { label: '不限', value: 'all' },
  { label: '应届生', value: 'fresh' },
  { label: '1-3年', value: '1-3' },
  { label: '3-5年', value: '3-5' },
  { label: '5-10年', value: '5-10' },
  { label: '10年以上', value: '10+' },
];

export const EDUCATION_OPTIONS = [
  { label: '不限', value: 'all' },
  { label: '大专', value: 'college' },
  { label: '本科', value: 'bachelor' },
  { label: '硕士', value: 'master' },
  { label: '博士', value: 'doctor' },
];

export const JOB_TYPES = [
  { label: '不限', value: 'all' },
  { label: '全职', value: 'fulltime' },
  { label: '兼职', value: 'parttime' },
  { label: '实习', value: 'internship' },
  { label: '远程', value: 'remote' },
];

export const CITIES = [
  { label: '不限', value: 'all' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
  { label: '成都', value: '成都' },
  { label: '武汉', value: '武汉' },
  { label: '西安', value: '西安' },
  { label: '南京', value: '南京' },
  { label: '苏州', value: '苏州' },
  { label: '重庆', value: '重庆' },
  { label: '天津', value: '天津' },
  { label: '青岛', value: '青岛' },
  { label: '大连', value: '大连' },
  { label: '厦门', value: '厦门' },
  { label: '其他', value: '其他' },
];

export const COMPANY_SIZES = [
  { label: '0-20人', value: '0-20' },
  { label: '20-99人', value: '20-99' },
  { label: '100-499人', value: '100-499' },
  { label: '500-999人', value: '500-999' },
  { label: '1000人以上', value: '1000+' },
];

export const INDUSTRIES = [
  '互联网',
  '金融',
  '教育',
  '医疗健康',
  '电子商务',
  '游戏',
  '人工智能',
  '新能源',
  '汽车',
  '房地产',
  '咨询',
  '法律',
  '媒体',
  '广告营销',
  '其他',
];
