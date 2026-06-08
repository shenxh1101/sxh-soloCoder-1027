import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '🔍',
      title: '海量职位',
      description: '覆盖各行各业的优质职位，精准匹配您的求职需求',
    },
    {
      icon: '📝',
      title: '智能匹配',
      description: '根据您的技能和期望，智能推荐最合适的工作机会',
    },
    {
      icon: '💼',
      title: '简历中心',
      description: '一站式简历管理，支持在线编辑和附件上传',
    },
    {
      icon: '📊',
      title: '投递跟踪',
      description: '实时跟踪投递状态，不错过任何面试机会',
    },
  ];

  const hrFeatures = [
    {
      icon: '🎯',
      title: '高效招聘',
      description: '快速发布职位，海量简历库任您筛选',
    },
    {
      icon: '💬',
      title: '沟通便捷',
      description: '一键发起面试邀请，实时记录沟通备注',
    },
    {
      icon: '📈',
      title: '数据分析',
      description: '职位浏览和投递数据一目了然，优化招聘策略',
    },
    {
      icon: '👥',
      title: '人才库',
      description: '建立企业人才库，储备优质候选人资源',
    },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-page">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {user?.role === 'hr' 
                ? '让招聘更高效，让人才更易得' 
                : '找到理想工作，开启职业新篇章'}
            </h1>
            <p className="text-xl text-primary-100 mb-10">
              {user?.role === 'hr'
                ? '智聘网为中小企业提供一站式招聘解决方案'
                : '智聘网连接优秀人才与优质企业，助您实现职业梦想'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to={user.role === 'hr' ? '/hr/jobs' : '/jobs'}
                  className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  {user.role === 'hr' ? '管理职位' : '浏览职位'}
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                  >
                    免费注册
                  </Link>
                  <Link
                    to="/jobs"
                    className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 text-lg font-semibold"
                  >
                    浏览职位
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container-page">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {user?.role === 'hr' ? '企业HR专属功能' : '核心功能'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(user?.role === 'hr' ? hrFeatures : features).map((feature, index) => (
              <div key={index} className="card p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {user?.role === 'hr' ? '为什么选择智聘网？' : '为何选择智聘网？'}
              </h2>
              <div className="space-y-4">
                {user?.role === 'hr' ? (
                  <>
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">精准匹配算法</p>
                        <p className="text-gray-500">智能推荐匹配度高的候选人，节省筛选时间</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">高效沟通工具</p>
                        <p className="text-gray-500">一站式面试安排和沟通记录，提升招聘效率</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">数据驱动决策</p>
                        <p className="text-gray-500">详尽的招聘数据分析，优化招聘策略</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">海量优质职位</p>
                        <p className="text-gray-500">汇集各行业知名企业，职位每日更新</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">简历隐私保护</p>
                        <p className="text-gray-500">严格的隐私保护机制，您的信息安全有保障</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">职业发展指导</p>
                        <p className="text-gray-500">提供简历优化、面试技巧等职业发展建议</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary-600">10万+</div>
                <p className="text-gray-500 mt-2">优质职位</p>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary-600">5万+</div>
                <p className="text-gray-500 mt-2">合作企业</p>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary-600">50万+</div>
                <p className="text-gray-500 mt-2">注册用户</p>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-primary-600">98%</div>
                <p className="text-gray-500 mt-2">用户满意度</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container-page">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-8 h-8 text-primary-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="text-xl font-bold">智聘网</span>
              </div>
              <p className="text-gray-400 text-sm">
                专业的求职招聘平台，连接人才与企业的桥梁
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">求职者</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/jobs" className="hover:text-white">浏览职位</Link></li>
                <li><Link to="/resume" className="hover:text-white">我的简历</Link></li>
                <li><Link to="/applications" className="hover:text-white">投递记录</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">企业HR</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/hr/jobs" className="hover:text-white">职位管理</Link></li>
                <li><Link to="/hr/applications" className="hover:text-white">简历筛选</Link></li>
                <li><Link to="/hr/dashboard" className="hover:text-white">数据统计</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>客服邮箱：support@zhipin.com</li>
                <li>客服电话：400-888-8888</li>
                <li>工作时间：周一至周五 9:00-18:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2024 智聘网 版权所有</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
