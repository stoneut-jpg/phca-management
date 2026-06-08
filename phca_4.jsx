import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronRight, CheckCircle2, Search, Calendar, 
  MapPin, Phone, User, BookOpen, AlertCircle, ArrowRight, ShieldCheck, Ticket, Sparkles, LogIn, UserPlus, LogOut
} from 'lucide-react';

// --- [Data] Mock Data (부서 및 후원금 추가) ---
const MOCK_COURSES = [
  { id: 1, title: '찬양 인도 기초반', intro: '찬양 인도의 기본 자세와 발성을 배웁니다.', target: '학생', department: '찬양부', day: '월, 수', time: '14:00 - 15:30', capacity: 15, material: '개인 성경, 필기도구', fee: '10,000원', status: '신청가능' },
  { id: 2, title: '미디어 콘텐츠 제작', intro: '스마트폰을 활용한 영상 촬영 및 기초 편집', target: '학생', department: '홍보부', day: '화, 목', time: '10:00 - 12:00', capacity: 20, material: '스마트폰', fee: '무료', status: '신청가능' },
  { id: 3, title: '키즈 댄스 기초', intro: '신나는 음악에 맞춰 배우는 기초 율동과 댄스', target: '유년', department: '문화부', day: '수, 금', time: '13:00 - 14:30', capacity: 20, material: '편한 복장, 운동화', fee: '15,000원', status: '마감임박' },
  { id: 4, title: '미술 심리 치료', intro: '미술 활동을 통해 내면을 표현하고 치유하는 시간', target: '학생', department: '문화부', day: '월, 목', time: '15:00 - 17:00', capacity: 10, material: '미술 도구 제공', fee: '20,000원', status: '신청가능' },
  { id: 5, title: '블록 코딩 첫걸음', intro: '엔트리를 활용한 재미있는 프로그래밍 기초', target: '유년', department: '정보통신부', day: '화, 금', time: '10:00 - 11:30', capacity: 15, material: '없음 (노트북 제공)', fee: '무료', status: '마감' },
  { id: 6, title: '영상 편집 마스터', intro: '프리미어 프로를 활용한 전문가 수준의 영상 편집', target: '학생', department: '정보통신부', day: '토', time: '10:00 - 13:00', capacity: 12, material: '개인 노트북 (권장)', fee: '20,000원', status: '신청가능' },
  { id: 7, title: '청소년 풋살 클래스', intro: '기본기 훈련부터 미니 게임까지 함께하는 체육 활동', target: '학생', department: '체육부', day: '금', time: '16:00 - 18:00', capacity: 16, material: '운동복, 풋살화', fee: '10,000원', status: '신청가능' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    '접수 완료': 'bg-blue-100 text-blue-700 border border-blue-200',
    '확인 중': 'bg-amber-100 text-amber-700 border border-amber-200',
    '배정 완료': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    '대기': 'bg-slate-100 text-slate-600 border border-slate-200',
    '반려': 'bg-red-100 text-red-700 border border-red-200',
    '신청가능': 'bg-sky-100 text-sky-700 border border-sky-200',
    '마감임박': 'bg-gradient-to-r from-orange-400 to-rose-400 text-white font-bold shadow-sm',
    '마감': 'bg-slate-200 text-slate-500',
  };
  return (
    <span className={`px-3 py-1 text-xs font-bold rounded-full tracking-wide ${styles[status] || 'bg-slate-100 text-slate-800'}`}>
      {status}
    </span>
  );
};

const Header = ({ currentPath, navigate, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/courses', label: '강좌 안내' },
    { path: '/check', label: '신청 확인' },
  ];

  const handleNav = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => handleNav('/')}>
            <span className="text-3xl font-black tracking-tighter uppercase text-slate-800">
              PHCA<span className="text-sky-500">.</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`text-sm font-bold tracking-wider transition-colors ${currentPath === item.path ? 'text-sky-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {item.label}
              </button>
            ))}
            
            <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
              {user ? (
                <>
                  <span className="text-sm font-bold text-slate-700">{user.name}님</span>
                  <button onClick={onLogout} className="text-slate-400 hover:text-rose-500 transition-colors" title="로그아웃">
                    <LogOut size={20} />
                  </button>
                  <button onClick={() => handleNav('/apply')} className="bg-sky-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-sky-600 shadow-sm transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
                    <Ticket size={18} /><span>수강 신청</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleNav('/login')} className="text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1">
                    로그인
                  </button>
                  <button onClick={() => handleNav('/signup')} className="bg-slate-800 text-white font-bold px-5 py-2.5 rounded-full hover:bg-slate-900 shadow-sm transition-all text-sm">
                    회원가입
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-sky-500">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl">
          <div className="px-4 py-4 space-y-2">
            {user && <div className="px-4 py-2 font-bold text-sky-600 border-b border-slate-100 mb-2">{user.name}님 환영합니다!</div>}
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-bold tracking-wider ${currentPath === item.path ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                {item.label}
              </button>
            ))}
            
            {user ? (
              <>
                <button onClick={() => handleNav('/apply')} className="block w-full text-center mt-4 bg-sky-500 text-white font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md">
                  <Ticket size={18} /> 수강 신청
                </button>
                <button onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block w-full text-center mt-2 bg-slate-100 text-slate-600 font-bold px-4 py-3 rounded-xl">
                  로그아웃
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-4">
                 <button onClick={() => handleNav('/login')} className="w-full text-center bg-slate-100 text-slate-700 font-bold px-4 py-3 rounded-xl">로그인</button>
                 <button onClick={() => handleNav('/signup')} className="w-full text-center bg-slate-800 text-white font-bold px-4 py-3 rounded-xl">회원가입</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <span className="text-2xl font-black text-slate-800 tracking-tighter">PHCA<span className="text-sky-500">.</span></span>
        <p className="text-slate-500 text-sm mt-2">피터 하늘 문화 아카데미 4기<br/>신천지예수교 증거장막성전 베드로지파 광주교회</p>
      </div>
      <div className="text-slate-400 text-sm font-medium">
        © 2026 PHCA. All rights reserved.
      </div>
    </div>
  </footer>
);

const AuthPage = ({ type, navigate, onAuthSuccess }) => {
  const isLogin = type === 'login';
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', church: '광주교회', department: '학생회', grade: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const users = JSON.parse(localStorage.getItem('phca_users') || '[]');

    if (isLogin) {
      if (!formData.phone || !formData.password) return setError('연락처와 비밀번호를 입력해주세요.');
      const user = users.find(u => u.phone === formData.phone && u.password === formData.password);
      if (user) {
        onAuthSuccess(user);
        navigate('/');
      } else {
        setError('연락처 또는 비밀번호가 일치하지 않습니다.');
      }
    } else {
      if (!formData.name || !formData.phone || !formData.password || !formData.grade) return setError('모든 필수 항목을 입력해주세요.');
      if (users.find(u => u.phone === formData.phone)) return setError('이미 가입된 연락처입니다.');
      
      const newUser = { ...formData, id: Date.now() };
      users.push(newUser);
      localStorage.setItem('phca_users', JSON.stringify(users));
      onAuthSuccess(newUser);
      navigate('/');
    }
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium mt-2 mb-4";
  const labelClass = "block text-sm font-black text-slate-700 tracking-wide";

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center animate-fadeIn bg-slate-50">
      <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-100 text-sky-500 mb-4">
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{isLogin ? '로그인' : '회원가입'}</h2>
          <p className="text-slate-500 font-medium mt-2">{isLogin ? '계정에 로그인하여 간편하게 신청하세요.' : 'PHCA 계정을 만들고 아카데미에 참여하세요.'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <label className={labelClass}>이름 *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="홍길동" />
            </>
          )}
          
          <label className={labelClass}>연락처 (- 제외) *</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="01012345678" />
          
          <label className={labelClass}>비밀번호 *</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClass} placeholder="비밀번호 입력" />

          {!isLogin && (
            <>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className={labelClass}>소속 교회 *</label>
                  <input type="text" name="church" value={formData.church} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>부서 *</label>
                  <select name="department" value={formData.department} onChange={handleChange} className={inputClass}>
                    <option value="유년회">유년회</option>
                    <option value="학생회">학생회</option>
                  </select>
                </div>
              </div>
              <label className={labelClass}>학년 (나이) *</label>
              <input type="text" name="grade" value={formData.grade} onChange={handleChange} className={inputClass} placeholder="예: 초3 (10세)" />
            </>
          )}

          {error && <p className="text-rose-500 text-sm font-bold text-center mb-4">{error}</p>}

          <button type="submit" className="w-full bg-sky-500 text-white font-black py-4 rounded-2xl hover:bg-sky-600 transition-all shadow-md mt-2">
            {isLogin ? '로그인' : '가입하기'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <span className="text-slate-500 text-sm font-medium">
            {isLogin ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'} 
          </span>
          <button onClick={() => navigate(isLogin ? '/signup' : '/login')} className="ml-2 text-sky-600 font-bold hover:underline">
            {isLogin ? '회원가입' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ navigate }) => {
  return (
    <div className="animate-fadeIn pb-10">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('420222베광김현석_피터하늘문화아카데미발표회3147.jpg')` }}
        ></div>
        
        {/* Bright Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/60 to-sky-50/95 backdrop-blur-[2px]"></div>

        {/* Decorative Blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-yellow-300/30 blur-[100px]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-10">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-sm text-sky-600 font-black text-sm mb-6 border border-sky-100">
            <Sparkles size={16} className="text-amber-500" />
            <span>2026 Summer Academy</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-tight mb-6 drop-shadow-sm">
            PETER HEAVENLY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-600 to-sky-500 bg-300% animate-gradient">
              CULTURE ACADEMY
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-800 font-bold mb-10 max-w-2xl mx-auto leading-relaxed bg-white/40 px-6 py-3 rounded-2xl backdrop-blur-sm shadow-sm inline-block">
            여름방학을 배움과 성장의 시간으로.<br className="hidden md:block"/> 
            4기 피터 하늘 문화 아카데미에 여러분을 초대합니다!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/apply')} className="bg-sky-500 text-white font-black px-10 py-4 rounded-full hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 transition-all transform hover:-translate-y-1 text-lg">
              수강 신청하기
            </button>
            <button onClick={() => navigate('/courses')} className="bg-white/90 backdrop-blur-sm text-slate-800 font-black px-10 py-4 rounded-full hover:bg-white shadow-lg hover:shadow-xl transition-all border border-slate-100 text-lg">
              강좌 둘러보기
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6 group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">모집 일정</h3>
            <p className="text-slate-500 font-medium">7월 12일(일) ~ 7월 22일(수)</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">운영 일정</h3>
            <p className="text-slate-500 font-medium">7월 25일(토) ~ 8월 23일(토)</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform"><User size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">모집 대상</h3>
            <p className="text-slate-500 font-medium">유년 회원</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform"><MapPin size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">운영 장소</h3>
            <p className="text-slate-500 font-medium">베드로지파 광주교회 각 층</p>
          </div>
        </div>
      </section>

      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sky-500 font-black tracking-widest uppercase text-sm mb-2">How it works</p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">신청 절차 안내</h2>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center relative bg-white p-8 md:p-12 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="hidden md:block absolute top-1/2 left-[10%] w-[80%] h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
            
            {['회원 가입/로그인', '희망 강좌 선택', '접수 및 완료', '배정 결과 확인'].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center w-full md:w-auto mb-8 md:mb-0 bg-white px-6">
                <div className="w-20 h-20 bg-white border-4 border-sky-100 rounded-full flex items-center justify-center font-black text-sky-500 shadow-lg shadow-sky-100 mb-4 text-2xl">
                  0{idx + 1}
                </div>
                <span className="font-bold text-slate-700 text-lg">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const CoursesPage = ({ navigate, user }) => {
  const [filterDept, setFilterDept] = useState('전체');
  const [filterTarget, setFilterTarget] = useState('전체');

  const filteredCourses = MOCK_COURSES.filter(course => {
    if (filterDept !== '전체' && course.department !== filterDept) return false;
    if (filterTarget !== '전체' && course.target !== filterTarget) return false;
    return true;
  });

  const handleDirectApply = (courseTitle) => {
    if (!user) {
      // Custom inline message would be better, but redirecting to login is smooth.
      // We pass the intended destination state.
      navigate('/login', { redirect: '/apply', selectedCourse: courseTitle });
    } else {
      navigate('/apply', { selectedCourse: courseTitle });
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 animate-fadeIn bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-500 font-black tracking-widest uppercase text-sm mb-2">Explore</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">강좌 안내</h2>
        </div>
        
        {/* Filters (부서 단위로 개편) */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-md shadow-slate-200/50 border border-slate-100 mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
            <span className="text-sm font-bold text-slate-500 uppercase">부서 구분</span>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 p-3 outline-none min-w-[140px]">
              <option value="전체">전체보기</option>
              <option value="문화부">문화부</option>
              <option value="찬양부">찬양부</option>
              <option value="체육부">체육부</option>
              <option value="홍보부">홍보부</option>
              <option value="정보통신부">정보통신부</option>
            </select>
          </div>
          <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
          <div className="flex items-center space-x-3 w-full sm:w-auto justify-center">
            <span className="text-sm font-bold text-slate-500 uppercase">대상 구분</span>
            <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-800 font-bold rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 p-3 outline-none min-w-[140px]">
              <option value="전체">전체보기</option>
              <option value="유년">유년회</option>
              <option value="학생">학생회</option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:-translate-y-2 hover:shadow-2xl hover:shadow-sky-100 transition-all duration-300 flex flex-col group">
              <div className="p-8 flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1.5 text-xs font-black rounded-lg ${course.target === '유년' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>{course.target}</span>
                    <span className="px-3 py-1.5 text-xs font-black rounded-lg bg-sky-100 text-sky-700">{course.department}</span>
                  </div>
                  <StatusBadge status={course.status} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-sky-500 transition-colors">{course.title}</h3>
                <p className="text-slate-500 text-sm mb-8 h-10 line-clamp-2 leading-relaxed font-medium">{course.intro}</p>
                
                {/* Details (일시, 정원, 준비물, 후원금) */}
                <div className="space-y-3 text-sm text-slate-600 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-xs">일시</span><span className="font-bold text-slate-700">{course.day} / {course.time}</span></div>
                  <div className="w-full h-px bg-slate-200/50"></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-xs">정원</span><span className="font-bold text-slate-700">{course.capacity}명</span></div>
                  <div className="w-full h-px bg-slate-200/50"></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-xs">준비물</span><span className="font-bold text-slate-700">{course.material}</span></div>
                  <div className="w-full h-px bg-slate-200/50"></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold text-xs">후원금</span><span className="font-black text-rose-500">{course.fee}</span></div>
                </div>
              </div>
              
              {/* Direct Apply Button */}
              <div className="px-8 pb-8">
                <button 
                  onClick={() => handleDirectApply(course.title)}
                  disabled={course.status === '마감'}
                  className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${course.status === '마감' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-200'}`}
                >
                  <Ticket size={18} />
                  {user ? '이 강좌 바로 신청하기' : '로그인 후 신청하기'}
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredCourses.length === 0 && (
          <div className="text-center py-32 text-slate-500 font-bold text-lg bg-white rounded-3xl border border-slate-100 shadow-sm">
            조건에 맞는 강좌가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

const ApplyPage = ({ navigate, routeState, user }) => {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  
  // user 정보나 routeState(강좌 안내에서 넘어온 데이터)로 초기값 설정
  const [formData, setFormData] = useState({
    name: user?.name || '', 
    church: user?.church || '광주교회', 
    department: user?.department || '유년회', 
    grade: user?.grade || '', 
    gender: '남', 
    contact: user?.phone || '',
    choice1: routeState?.selectedCourse || '', 
    choice2: '', 
    advancedApply: '아니오',
    guardianName: '', 
    guardianContact: '', 
    notes: '',
    agreePrivacy: false, 
    agreeGuardian: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrorMsg('');
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1 && (!formData.name || !formData.church || !formData.contact)) {
      setErrorMsg('필수 정보를 모두 입력해주세요.'); return;
    }
    if (step === 2 && !formData.choice1) {
      setErrorMsg('희망 강좌 1순위는 필수입니다.'); return;
    }
    if (step === 3 && (!formData.guardianName || !formData.guardianContact)) {
      setErrorMsg('보호자 정보를 입력해주세요.'); return;
    }
    setStep(s => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const prevStep = () => {
    setErrorMsg('');
    setStep(s => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!formData.agreePrivacy || !formData.agreeGuardian) {
      setErrorMsg('모든 동의 항목에 체크해주세요.'); return;
    }
    const applications = JSON.parse(localStorage.getItem('phca_applications') || '[]');
    const newApp = { ...formData, userId: user?.id || 'guest', id: Date.now(), status: '접수 완료', date: new Date().toLocaleDateString() };
    applications.push(newApp);
    localStorage.setItem('phca_applications', JSON.stringify(applications));
    
    localStorage.setItem('phca_last_submit', JSON.stringify(newApp));
    navigate('/apply/complete');
    window.scrollTo(0,0);
  };

  const inputClass = "mt-2 block w-full rounded-2xl bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 sm:text-sm p-4 outline-none transition-all font-medium";
  const labelClass = "block text-sm font-black text-slate-700 tracking-wide";

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 animate-fadeIn">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sky-500 font-black tracking-widest uppercase text-sm mb-2">Registration</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">수강 신청</h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-400 px-2 mb-4">
            <span className={step >= 1 ? 'text-sky-500' : ''}>1. 기본 정보</span>
            <span className={step >= 2 ? 'text-sky-500' : ''}>2. 강좌 선택</span>
            <span className={step >= 3 ? 'text-sky-500' : ''}>3. 보호자 정보</span>
            <span className={step >= 4 ? 'text-sky-500' : ''}>4. 제출</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-[2.5rem] p-6 sm:p-12 border border-slate-100 relative overflow-hidden">
          
          {step === 1 && (
            <div className="space-y-8 animate-fadeIn relative z-10">
              <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><span className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-sm mr-3">1</span>신청자 정보</h3>
              {user && <div className="bg-sky-50 p-4 rounded-xl text-sky-700 font-bold text-sm mb-4 flex items-center"><CheckCircle2 size={16} className="mr-2"/> 회원 정보가 자동으로 입력되었습니다.</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className={labelClass}>이름 *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="홍길동" /></div>
                <div><label className={labelClass}>소속 교회 *</label><input type="text" name="church" value={formData.church} onChange={handleChange} className={inputClass} placeholder="광주교회" /></div>
                <div>
                  <label className={labelClass}>부서 구분 *</label>
                  <select name="department" value={formData.department} onChange={handleChange} className={inputClass}>
                    <option value="유년회">유년회</option>
                    <option value="학생회">학생회</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>학년 (나이) *</label>
                  <input type="text" name="grade" value={formData.grade} onChange={handleChange} className={inputClass} placeholder="초3 / 10세" />
                </div>
                <div>
                  <label className={labelClass}>성별</label>
                  <div className="mt-4 flex space-x-6">
                    <label className="inline-flex items-center cursor-pointer"><input type="radio" name="gender" value="남" checked={formData.gender === '남'} onChange={handleChange} className="w-5 h-5 text-sky-500 bg-slate-50 border-slate-300 focus:ring-sky-500" /><span className="ml-3 text-slate-700 font-bold">남</span></label>
                    <label className="inline-flex items-center cursor-pointer"><input type="radio" name="gender" value="여" checked={formData.gender === '여'} onChange={handleChange} className="w-5 h-5 text-sky-500 bg-slate-50 border-slate-300 focus:ring-sky-500" /><span className="ml-3 text-slate-700 font-bold">여</span></label>
                  </div>
                </div>
                <div><label className={labelClass}>본인 연락처 *</label><input type="tel" name="contact" value={formData.contact} onChange={handleChange} className={inputClass} placeholder="01012345678" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn relative z-10">
               <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><span className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-sm mr-3">2</span>강좌 선택</h3>
               <div>
                  <label className={labelClass}>희망 강좌 1순위 *</label>
                  <select name="choice1" value={formData.choice1} onChange={handleChange} className={inputClass}>
                    <option value="">강좌를 선택해주세요</option>
                    {MOCK_COURSES.map(c => <option key={c.id} value={c.title}>[{c.department}] {c.title}</option>)}
                  </select>
               </div>
               <div>
                  <label className={labelClass}>희망 강좌 2순위</label>
                  <select name="choice2" value={formData.choice2} onChange={handleChange} className={inputClass}>
                    <option value="">강좌를 선택해주세요 (선택)</option>
                    {MOCK_COURSES.map(c => <option key={c.id} value={c.title}>[{c.department}] {c.title}</option>)}
                  </select>
                  <p className="text-sm text-amber-500 mt-2 font-bold">1순위 마감 시 2순위로 배정될 수 있습니다.</p>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn relative z-10">
               <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><span className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-sm mr-3">3</span>보호자 정보</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className={labelClass}>보호자 이름 *</label><input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className={inputClass} placeholder="홍길동" /></div>
                  <div><label className={labelClass}>보호자 연락처 *</label><input type="tel" name="guardianContact" value={formData.guardianContact} onChange={handleChange} className={inputClass} placeholder="01012345678" /></div>
               </div>
               <div>
                  <label className={labelClass}>특이사항 및 전달사항</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className={inputClass} placeholder="알러지, 지병 등 강사가 알아야 할 사항이 있다면 적어주세요."></textarea>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fadeIn relative z-10">
               <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><span className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-sm mr-3">4</span>동의 및 제출</h3>
               
               <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                  <h4 className="font-black text-slate-800 mb-3 flex items-center text-lg"><ShieldCheck size={20} className="mr-2 text-emerald-500"/> 개인정보 수집 및 이용 동의</h4>
                  <div className="text-sm text-slate-600 h-24 overflow-y-auto mb-5 bg-white p-4 rounded-xl border border-slate-200 leading-relaxed font-medium">
                    수집 목적: PHCA 수강 신청 및 학사 관리, 긴급 연락<br/>
                    수집 항목: 이름, 소속, 연락처, 보호자 정보 등<br/>
                    보유 기간: 아카데미 4기 종료 후 1년 내 파기
                  </div>
                  <label className="inline-flex items-center cursor-pointer group bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm w-full">
                    <input type="checkbox" name="agreePrivacy" checked={formData.agreePrivacy} onChange={handleChange} className="w-5 h-5 rounded text-sky-500 bg-slate-50 border-slate-300 focus:ring-sky-500" />
                    <span className="ml-3 font-bold text-slate-700">위 개인정보 수집 및 이용에 동의합니다. *</span>
                  </label>
               </div>

               <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                  <h4 className="font-black text-slate-800 mb-3 flex items-center text-lg"><AlertCircle size={20} className="mr-2 text-amber-500"/> 보호자 동의</h4>
                  <p className="text-sm text-slate-600 mb-5 font-medium">본 아카데미 참여에 있어 보호자의 동의를 받았음을 확인합니다.</p>
                  <label className="inline-flex items-center cursor-pointer group bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm w-full">
                    <input type="checkbox" name="agreeGuardian" checked={formData.agreeGuardian} onChange={handleChange} className="w-5 h-5 rounded text-sky-500 bg-slate-50 border-slate-300 focus:ring-sky-500" />
                    <span className="ml-3 font-bold text-slate-700">보호자 동의를 확인했습니다. *</span>
                  </label>
               </div>
            </div>
          )}

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="mt-6 p-4 bg-rose-50 text-rose-600 font-bold rounded-2xl flex items-center justify-center animate-fadeIn">
              <AlertCircle size={20} className="mr-2" /> {errorMsg}
            </div>
          )}

          {/* Form Navigation Buttons */}
          <div className="mt-8 flex justify-between pt-8 border-t border-slate-100 relative z-10">
            {step > 1 ? (
              <button onClick={prevStep} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-full font-bold hover:bg-slate-200 transition-all text-sm">
                이전 단계
              </button>
            ) : <div></div>}
            
            {step < 4 ? (
              <button onClick={nextStep} className="px-8 py-4 bg-slate-800 text-white rounded-full font-bold hover:bg-slate-900 transition-all flex items-center shadow-lg shadow-slate-300 text-sm">
                다음 단계 <ArrowRight size={18} className="ml-2"/>
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-10 py-4 bg-sky-500 text-white rounded-full font-black hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-500/30 transition-all transform hover:-translate-y-1 text-sm sm:text-base">
                신청서 최종 제출
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplyCompletePage = ({ navigate }) => {
  const submitData = JSON.parse(localStorage.getItem('phca_last_submit'));

  if (!submitData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20 animate-fadeIn">
        <p className="text-2xl text-slate-500 font-bold mb-6">제출된 신청 정보가 없습니다.</p>
        <button onClick={() => navigate('/')} className="text-sky-500 hover:text-sky-600 font-bold underline">홈으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 animate-fadeIn flex flex-col items-center">
      <div className="max-w-2xl w-full text-center">
        <div className="flex justify-center mb-8">
          <div className="w-28 h-28 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl shadow-emerald-100">
            <CheckCircle2 size={64} />
          </div>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-4">신청 완료!</h2>
        <p className="text-lg text-slate-500 mb-12 font-medium">정상적으로 접수되었습니다. 배정 결과는 추후 안내됩니다.</p>

        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-slate-100 mb-12 text-left shadow-xl shadow-slate-200/50">
          <h3 className="font-black text-2xl text-slate-800 border-b border-slate-100 pb-5 mb-6">신청 내역 요약</h3>
          <div className="space-y-5 text-base">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">신청자</span><span className="font-black text-slate-800 text-lg">{submitData.name} <span className="text-slate-500 text-sm font-medium">({submitData.department})</span></span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">1순위 지망</span><span className="font-black text-sky-600 text-xl">{submitData.choice1}</span></div>
            {submitData.choice2 && <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">2순위 지망</span><span className="font-bold text-slate-600">{submitData.choice2}</span></div>}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-6 border-t border-slate-100"><span className="text-slate-400 font-bold text-sm mb-2 sm:mb-0">현재 상태</span><StatusBadge status={submitData.status} /></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigate('/check')} className="px-10 py-4 bg-sky-500 text-white font-black rounded-full hover:bg-sky-600 shadow-lg shadow-sky-200 transition-all">
            신청 내용 확인하기
          </button>
          <button onClick={() => navigate('/')} className="px-10 py-4 bg-white text-slate-700 font-bold rounded-full border border-slate-200 hover:bg-slate-50 transition-all">
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

const ApplicationCheckPage = ({ user }) => {
  const [searchParams, setSearchParams] = useState({ name: user?.name || '', contact: user?.phone || '' });
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!searchParams.name || !searchParams.contact) {
      setErrorMsg('이름과 연락처를 모두 입력해주세요.'); return;
    }

    const applications = JSON.parse(localStorage.getItem('phca_applications') || '[]');
    const found = applications.find(app => 
      app.name === searchParams.name && 
      (app.contact === searchParams.contact || app.guardianContact === searchParams.contact)
    );

    setResult(found || null);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 animate-fadeIn">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-emerald-500 font-black tracking-widest uppercase text-sm mb-2">Check Status</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">신청 확인</h2>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">이름</label>
              <input type="text" placeholder="신청자 이름" value={searchParams.name} onChange={e => setSearchParams({...searchParams, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">연락처 (- 제외)</label>
              <input type="tel" placeholder="01012345678" value={searchParams.contact} onChange={e => setSearchParams({...searchParams, contact: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold" />
            </div>
            <button type="submit" className="w-full md:w-auto bg-slate-800 text-white px-10 py-4 rounded-2xl font-black hover:bg-slate-900 shadow-md transition-all flex items-center justify-center mt-4 md:mt-0">
              <Search size={20} className="mr-2" /> 조회하기
            </button>
          </form>
          {errorMsg && <p className="text-rose-500 text-sm font-bold mt-4 text-center">{errorMsg}</p>}
        </div>

        {hasSearched && (
          <div className="animate-fadeIn">
            {result ? (
              <div className="bg-white border-2 border-sky-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-sky-100/50 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 mb-8 gap-4">
                  <h3 className="text-2xl font-black text-slate-800">상세 내역</h3>
                  <StatusBadge status={result.status} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">신청자명</span><span className="font-black text-slate-800 text-xl">{result.name}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">소속</span><span className="font-bold text-slate-600 text-lg">{result.church} / {result.department}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">학년 / 연락처</span><span className="font-bold text-slate-600 text-lg">{result.grade} / {result.contact}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">접수일</span><span className="font-bold text-slate-600 text-lg">{result.date}</span></div>
                  
                  <div className="sm:col-span-2 bg-sky-50 p-6 sm:p-8 rounded-3xl mt-4 border border-sky-100">
                    <div className="flex flex-col mb-4"><span className="text-slate-500 text-xs font-bold mb-2">1순위 희망 강좌</span><span className="font-black text-sky-600 text-2xl">{result.choice1}</span></div>
                    {result.choice2 && <div className="flex flex-col mb-6"><span className="text-slate-500 text-xs font-bold mb-2">2순위 희망 강좌</span><span className="font-bold text-slate-700 text-lg">{result.choice2}</span></div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <AlertCircle size={56} className="mx-auto text-slate-300 mb-6" />
                <h3 className="text-2xl font-black text-slate-800 mb-2">조회 결과가 없습니다</h3>
                <p className="text-slate-500 font-medium">입력하신 이름과 연락처를 다시 확인해주세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [routeState, setRouteState] = useState({});
  const [user, setUser] = useState(null);

  // Load user from session/storage on mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem('phca_current_user');
    if (loggedInUser) setUser(JSON.parse(loggedInUser));
  }, []);

  const navigate = (path, state = {}) => {
    setCurrentPath(path);
    setRouteState(state);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('phca_current_user', JSON.stringify(userData));
    // If there was a redirect set (e.g. from course direct apply), go there
    if (routeState.redirect) {
      navigate(routeState.redirect, routeState);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('phca_current_user');
    navigate('/');
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/': return <HomePage navigate={navigate} />;
      case '/courses': return <CoursesPage navigate={navigate} user={user} />;
      case '/apply': return <ApplyPage navigate={navigate} routeState={routeState} user={user} />;
      case '/apply/complete': return <ApplyCompletePage navigate={navigate} />;
      case '/check': return <ApplicationCheckPage user={user} />;
      case '/login': return <AuthPage type="login" navigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case '/signup': return <AuthPage type="signup" navigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-sky-200 selection:text-sky-900">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap');
        
        body { font-family: 'Inter', -apple-system, sans-serif; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradient 8s ease infinite;
        }
      `}} />
      <Header currentPath={currentPath} navigate={navigate} user={user} onLogout={handleLogout} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}
