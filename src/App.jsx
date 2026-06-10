import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, ChevronRight, ChevronLeft, CheckCircle2, Search, Calendar, 
  MapPin, Phone, User, BookOpen, AlertCircle, ArrowRight, ShieldCheck, Ticket, Sparkles, LogIn, UserPlus, LogOut,
  LayoutDashboard, Users, Bell, MessageSquare, Settings, Lock, Edit2, Trash2, Plus, FileText, Download, Filter, Eye, EyeOff
} from 'lucide-react';
import faqData from './data/faqs';
import noticeData from './data/notices';
import { currentGeneration } from './data/generation';
import * as XLSX from 'xlsx';

// --- [Excel Helper Functions] ---
const DEPARTMENT_OPTIONS = [
  "문화부",
  "찬양부",
  "체육부",
  "홍보부",
  "정보통신부"
];

const createWorksheetFromData = (data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  
  if (!ws['!ref']) return ws;
  
  const range = XLSX.utils.decode_range(ws['!ref']);
  let numColIndex = -1;
  
  // 첫 번째 행(헤더)에서 '번호' 컬럼 찾기
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = ws[XLSX.utils.encode_cell({ c: C, r: 0 })];
    if (cell && cell.v === '번호') {
      numColIndex = C;
      break;
    }
  }

  // '번호' 컬럼 셀들을 중앙 정렬
  if (numColIndex !== -1) {
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ c: numColIndex, r: R })];
      if (cell) {
        if (!cell.s) cell.s = {};
        cell.s.alignment = { horizontal: "center", vertical: "center" };
      }
    }
  }

  return ws;
};

const appendSheetIfHasData = (workbook, data, sheetName) => {
  if (data && data.length > 0) {
    const worksheet = createWorksheetFromData(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
};

const downloadExcelByDepartment = (filteredData, formatDataFn, filePrefix, departmentField) => {
  const workbook = XLSX.utils.book_new();
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  
  // 1. 전체 시트 (항상 포함)
  const allData = filteredData.map((item, index) => formatDataFn(item, index));
  appendSheetIfHasData(workbook, allData, "전체");

  // 2. 부서별 시트
  DEPARTMENT_OPTIONS.forEach(dept => {
    const deptData = filteredData.filter(item => item[departmentField] === dept).map((item, index) => formatDataFn(item, index));
    appendSheetIfHasData(workbook, deptData, dept);
  });

  // 3. 기타 시트
  const etcData = filteredData.filter(item => !DEPARTMENT_OPTIONS.includes(item[departmentField])).map((item, index) => formatDataFn(item, index));
  appendSheetIfHasData(workbook, etcData, "기타");

  XLSX.writeFile(workbook, `${filePrefix}_${today}.xlsx`);
};

const downloadExcelSingleSheet = (filteredData, formatDataFn, filePrefix, sheetName) => {
  const workbook = XLSX.utils.book_new();
  const today = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const data = filteredData.map((item, index) => formatDataFn(item, index));
  appendSheetIfHasData(workbook, data, sheetName);
  XLSX.writeFile(workbook, `${filePrefix}_${today}.xlsx`);
};

// --- [Data] Mock Data (부서 및 후원금 추가) ---
const RAW_COURSES = [
  {
    id: 'youth-martial-arts',
    title: '무예단',
    intro: '문화부 주관 태권도 및 기계체조 수업입니다.',
    group: '유년',
    target: '6세~초6',
    department: '문화부',
    day: '화/목, 일',
    time: '10:00~11:30 / 14:30~16:30',
    capacity: 50,
    material: '편한 복장',
    fee: '30,000원',
    status: '신청가능',
    thumbnail: 'https://placehold.co/640x360/034f84/ffffff?text=%EB%AC%B4%EC%98%88%EB%8B%A8',
    images: [
      'https://placehold.co/960x540/034f84/ffffff?text=%EB%AC%B4%EC%98%88%EB%8B%A8+1',
      'https://placehold.co/960x540/ffb703/000000?text=%EB%AC%B4%EC%98%88%EB%8B%A8+2',
    ],
  },
  {
    id: 'youth-heaven-dance',
    title: '하늘문화 댄스',
    intro: '문화부 주관 유년회 댄스 수업입니다.',
    group: '유년',
    target: '6세~초6',
    department: '문화부',
    day: '화/목',
    time: '17:30~19:00',
    capacity: 20,
    material: '운동화',
    fee: '30,000원',
    status: '신청가능',
    thumbnail: 'https://placehold.co/640x360/fd9b9a/000000?text=%EB%8F%8C%EC%8A%A4',
    images: [
      'https://placehold.co/960x540/fd9b9a/000000?text=%EB%8F%8C%EC%8A%A4+1',
      'https://placehold.co/960x540/9d0208/ffffff?text=%EB%8F%8C%EC%8A%A4+2',
    ],
  },
  {
    id: 'youth-korean-dance',
    title: '예술단(한국무용)',
    intro: '문화부 주관 한국무용 수업입니다.',
    group: '유년',
    target: '6세~초6',
    department: '문화부',
    day: '목/금, 토',
    time: '16:30~18:30 / 10:00~11:30',
    capacity: 20,
    material: '한복 또는 편한 복장',
    fee: '33,000원',
    status: '신청가능',
    thumbnail: 'https://placehold.co/640x360/6a4c93/ffffff?text=%ED%95%9C%EA%B5%AD%EB%AC%B4%EC%9A%A9',
    images: [
      'https://placehold.co/960x540/6a4c93/ffffff?text=%ED%95%9C%EA%B5%AD%EB%AC%B4%EC%9A%A9+1',
      'https://placehold.co/960x540/4361ee/ffffff?text=%ED%95%9C%EA%B5%AD%EB%AC%B4%EC%9A%A9+2',
    ],
  },
  { id: 'youth-cheer', title: '응원단', intro: '문화부 주관 유년회 응원단 활동입니다.', group: '유년', target: '6세~초6', department: '문화부', day: '목, 토', time: '17:00~18:30 / 13:00~14:30', capacity: 30, material: '운동화', fee: '24,000원', status: '신청가능' },
  { id: 'youth-webtoon', title: '웹툰그리기', intro: '문화부 주관 초등학생 대상 웹툰 수업입니다.', group: '유년', target: '초1~초6', department: '문화부', day: '월/금', time: '16:00~17:00', capacity: 20, material: '스케치북, 필기도구', fee: '20,000원', status: '신청가능' },
  { id: 'youth-choir', title: '합창, 찬양대 (Summer Choir)', intro: '찬양부 주관 유년회 합창 및 찬양대 수업입니다.', group: '유년', target: '6세~초6', department: '찬양부', day: '화/일', time: '20:00~21:00 / 13:30~14:30', capacity: 15, material: '필기도구', fee: '20,000원', status: '신청가능' },
  { id: 'youth-violin', title: '관현악(바이올린)', intro: '찬양부 주관 바이올린 기초 수업입니다.', group: '유년', target: '6세~초6', department: '찬양부', day: '토', time: '13:00~15:30', capacity: 6, material: '악기 준비', fee: '30,000원', status: '신청가능' },
  { id: 'youth-flute', title: '관현악(플룻)', intro: '찬양부 주관 플룻 연주 기초 수업입니다.', group: '유년', target: '6세~초6', department: '찬양부', day: '토', time: '13:00~15:30', capacity: 3, material: '악기 준비', fee: '30,000원', status: '신청가능' },
  { id: 'youth-soccer-weekday', title: '축구(평일)', intro: '체육부 주관 초등학생 대상 평일 축구 수업입니다.', group: '유년', target: '초1~초6', department: '체육부', day: '화/목', time: '19:00~20:30', capacity: 10, material: '운동화, 축구공', fee: '20,000원', status: '신청가능' },
  { id: 'youth-soccer-sunday-am', title: '축구(주일) 오전', intro: '체육부 주관 주일 오전 축구 수업입니다.', group: '유년', target: '6세~초6', department: '체육부', day: '일', time: '12:00~13:00', capacity: 10, material: '운동화, 축구공', fee: '20,000원', status: '신청가능' },
  { id: 'youth-soccer-sunday-pm', title: '축구(주일) 오후', intro: '체육부 주관 주일 오후 축구 수업입니다.', group: '유년', target: '6세~초6', department: '체육부', day: '일', time: '14:00~15:00', capacity: 10, material: '운동화, 축구공', fee: '20,000원', status: '신청가능' },
  { id: 'youth-coding', title: '마블코딩스(블록코딩)', intro: '정보통신부 주관 유년회 블록 코딩 수업입니다.', group: '유년', target: '6세~초6', department: '정보통신부', day: '화/금', time: '13:00~15:00', capacity: 10, material: '노트북(권장)', fee: '36,000원', status: '신청가능' },
  { id: 'student-martial-arts', title: '무예단 태권도 & 기계체조', intro: '문화부 주관 학생회 대상 태권도 및 기계체조 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '화/목, 일', time: '15:00~17:00 / 14:30~16:30', capacity: 20, material: '편한 복장', fee: '30,000원', status: '신청가능' },
  { id: 'student-sign-language', title: '수화단', intro: '문화부 주관 학생회 대상 수화 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '화/목, 일', time: '10:30~12:00 / 16:00~17:30', capacity: 30, material: '필기도구', fee: '30,000원', status: '신청가능' },
  { id: 'student-heaven-dance', title: '하늘문화 댄스', intro: '문화부 주관 학생회 대상 댄스 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '월/목', time: '19:30~21:00', capacity: 20, material: '운동화', fee: '30,000원', status: '신청가능' },
  { id: 'student-cheer', title: '응원단', intro: '문화부 주관 학생회 대상 응원단 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '화, 토', time: '17:00~18:30 / 13:00~14:30', capacity: 30, material: '운동화', fee: '21,000원', status: '신청가능' },
  { id: 'student-nongak', title: '신천지 농악단', intro: '문화부 주관 학생회 대상 농악 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '목, 토', time: '19:00~20:30 / 17:30~19:00', capacity: 20, material: '편한 복장', fee: '24,000원', status: '신청가능' },
  { id: 'student-korean-dance', title: '예술단(한국무용)', intro: '문화부 주관 학생회 대상 한국무용 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '월/화', time: '19:30~21:30', capacity: 20, material: '한복 또는 편한 복장', fee: '25,000원', status: '신청가능' },
  { id: 'student-modeumbuk', title: '예술단(모듬북)', intro: '문화부 주관 학생회 대상 모듬북 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '월/화, 토', time: '19:30~21:30 / 14:00~16:00', capacity: 15, material: '편한 복장', fee: '19,000원', status: '신청가능' },
  { id: 'student-honor-guard', title: '의장단', intro: '문화부 주관 고등학생 대상 의장단 수업입니다.', group: '학생', target: '고1~고3', department: '문화부', day: '토/일', time: '13:30~15:30', capacity: 10, material: '정복 또는 단체복', fee: '24,000원', status: '신청가능' },
  { id: 'student-guitar', title: '기타', intro: '문화부 주관 학생회 대상 기타 연주 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '토', time: '13:00~15:00', capacity: 30, material: '기타', fee: '12,000원', status: '신청가능' },
  { id: 'student-broadcasting', title: '하늘 방송인 아카데미', intro: '문화부 주관 방송인 아카데미 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '월/금', time: '10:30~12:00', capacity: 30, material: '필기도구', fee: '12,000원', status: '신청가능' },
  { id: 'student-ani', title: '하늘문화 만화, 애니작가', intro: '문화부 주관 학생회 대상 만화·애니 작가 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '월/금', time: '17:00~18:00', capacity: 20, material: '스케치북, 필기도구', fee: '30,000원', status: '신청가능' },
  { id: 'student-photo', title: '나도 신천지 사진작가', intro: '문화부 주관 학생회 대상 사진 수업입니다.', group: '학생', target: '중1~고3', department: '문화부', day: '토/일', time: '16:00~17:30', capacity: 15, material: '카메라 또는 스마트폰', fee: '25,000원', status: '신청가능' },
  { id: 'student-choir', title: '합창, 찬양대 (Summer Choir)', intro: '찬양부 주관 학생회 대상 합창 및 찬양대 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '토', time: '13:00~14:30', capacity: 25, material: '필기도구', fee: '20,000원', status: '신청가능' },
  { id: 'student-violin', title: '관현악(바이올린)', intro: '찬양부 주관 학생회 대상 바이올린 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '토', time: '13:00~15:30', capacity: 6, material: '악기 준비', fee: '30,000원', status: '신청가능' },
  { id: 'student-flute', title: '관현악(플룻)', intro: '찬양부 주관 학생회 대상 플룻 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '토', time: '13:00~15:30', capacity: 3, material: '악기 준비', fee: '30,000원', status: '신청가능' },
  { id: 'student-cello', title: '관현악(첼로)', intro: '찬양부 주관 학생회 대상 첼로 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '토', time: '13:00~15:30', capacity: 4, material: '악기 준비', fee: '30,000원', status: '신청가능' },
  { id: 'student-horn', title: '관현악(호른)', intro: '찬양부 주관 학생회 대상 호른 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '토', time: '13:00~15:30', capacity: 1, material: '악기 준비', fee: '30,000원', status: '신청가능' },
  { id: 'student-piano', title: '피아노', intro: '찬양부 주관 학생회 대상 피아노 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '월/목', time: '10:30~11:30 / 19:00~20:00', capacity: 8, material: '악기 준비', fee: '20,000원', status: '신청가능' },
  { id: 'student-military-band', title: '군악대', intro: '찬양부 주관 학생회 대상 군악대 수업입니다.', group: '학생', target: '중1~고3', department: '찬양부', day: '월/화/금', time: '19:00~20:30', capacity: 8, material: '편한 복장', fee: '30,000원', status: '신청가능' },
  { id: 'student-soccer', title: '축구', intro: '체육부 주관 학생회 동아리 축구 수업입니다.', group: '학생', target: '중1~고3', department: '체육부', day: '토', time: '12:00~14:00', capacity: 20, material: '운동화, 축구공', fee: '학생회 동아리로 운영', status: '신청가능' },
  { id: 'student-basketball', title: '농구', intro: '체육부 주관 학생회 동아리 농구 수업입니다.', group: '학생', target: '중1~고3', department: '체육부', day: '토', time: '13:30~15:00', capacity: 12, material: '운동화', fee: '학생회 동아리로 운영', status: '신청가능' },
  { id: 'student-docent', title: '피터 도슨트', intro: '홍보부 주관 학생회 대상 도슨트 수업입니다.', group: '학생', target: '중1~고3', department: '홍보부', day: '화, 토', time: '19:00~20:00 / 14:00~16:00', capacity: 20, material: '필기도구', fee: '35,000원', status: '신청가능' },
  { id: 'student-pen', title: '피터 PEN', intro: '홍보부 주관 학생회 대상 뉴스 크리에이터 수업입니다.', group: '학생', target: '중1~고3', department: '홍보부', day: '화, 토', time: '19:00~20:00 / 14:00~16:00', capacity: 10, material: '필기도구', fee: '30,000원', status: '신청가능' },
  { id: 'student-coding', title: '마블코딩스', intro: '정보통신부 주관 중학생 대상 블록 코딩 수업입니다.', group: '학생', target: '중1~중3', department: '정보통신부', day: '화/금', time: '13:00~15:00', capacity: 10, material: '노트북(권장)', fee: '32,000원', status: '신청가능' },
];

const COURSE_IMAGE_PLACEHOLDER = '/images/courses/placeholder.svg';

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9가-힣\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

const defaultNotice = [
  '납부하신 후원금은 강좌 운영에 사용되며, 교육 시작 후 7일 이후에는 환불이 어렵습니다.',
  '교육 시간과 장소는 내부 운영 상황에 따라 부득이하게 변경될 수 있습니다.',
  '최종 수강 배정 결과는 [신청 확인] 페이지에서 간편하게 조회하실 수 있습니다.',
];

const createCourse = (course) => {
  const id = typeof course.id === 'string' ? course.id : slugify(course.title);
  const group = course.group || (course.target === '유년' ? '유년' : '학생');
  const available = course.status !== '마감';
  const summary = course.summary || course.intro;
  const description = course.description || `${course.intro} 기초부터 체계적으로 배우며 실전 감각을 함께 갖추는 수업입니다.`;
  const recommendedFor = course.recommendedFor || [
    group === '유년' ? '활동적인 수업을 좋아하는 친구' : '창의적인 도전을 즐기는 친구',
    '새로운 취미를 경험하고 싶은 친구',
    group === '유년' ? '친구들과 함께 활동하며 즐겁게 배우고 싶은 친구' : '팀워크와 표현력을 기르고 싶은 친구',
  ];
  const curriculum = course.curriculum || [
    `기본 ${course.title} 기술 익히기`,
    '기본기 연습 및 집중력 강화',
    '실전 활동과 발표 준비',
    '팀워크 기반 프로젝트 활동',
  ];

  return {
    ...course,
    generationId: currentGeneration.id,
    id,
    name: course.title,
    group,
    target: course.target || group,
    days: course.day,
    times: course.time,
    capacity: `${course.capacity}명`,
    supplies: course.material,
    donation: course.fee,
    available,
    thumbnail: course.thumbnail || COURSE_IMAGE_PLACEHOLDER,
    images: course.images || [],
    summary,
    description,
    recommendedFor,
    curriculum,
    notice: course.notice || defaultNotice,
  };
};

const MOCK_COURSES = RAW_COURSES.map(createCourse);

// --- [DB Initialization] ---
const initializeDB = () => {
  if (!localStorage.getItem('phcaCurrentGeneration')) localStorage.setItem('phcaCurrentGeneration', JSON.stringify(currentGeneration));
  const storedCourses = JSON.parse(localStorage.getItem('phcaCourses') || '[]');
  if (storedCourses.length === 0 || storedCourses[0].target === '유년' || storedCourses[0].target === '학생') {
    localStorage.setItem('phcaCourses', JSON.stringify(MOCK_COURSES));
  }
  if (!localStorage.getItem('phcaNotices')) localStorage.setItem('phcaNotices', JSON.stringify(noticeData));
  if (!localStorage.getItem('phcaFaqs')) localStorage.setItem('phcaFaqs', JSON.stringify(faqData));
  if (!localStorage.getItem('phcaApplications')) localStorage.setItem('phcaApplications', '[]');
};
initializeDB();
// --- [Generation Helpers] ---
const DEFAULT_GENERATIONS = [
  {
    id: 'phca-1',
    label: '1기',
    name: 'PHCA 1기',
    number: 1,
    year: 2024,
    season: '겨울방학',
    status: '종료',
    isCurrent: false,
    startDate: '',
    endDate: '',
    memo: '',
  },
  {
    id: 'phca-2',
    label: '2기',
    name: 'PHCA 2기',
    number: 2,
    year: 2025,
    season: '여름방학',
    status: '종료',
    isCurrent: false,
    startDate: '',
    endDate: '',
    memo: '',
  },
  {
    id: 'phca-3',
    label: '3기',
    name: 'PHCA 3기',
    number: 3,
    year: 2026,
    season: '겨울방학',
    status: '종료',
    isCurrent: false,
    startDate: '',
    endDate: '',
    memo: '',
  },
  {
    id: 'phca-4',
    label: '4기',
    name: 'PHCA 4기',
    number: 4,
    year: 2026,
    season: '여름방학',
    status: '운영중',
    isCurrent: true,
    startDate: '',
    endDate: '',
    memo: '',
  },
];

const getGenerations = () => {
  try {
    const saved = localStorage.getItem('phcaGenerations');

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    localStorage.setItem('phcaGenerations', JSON.stringify(DEFAULT_GENERATIONS));
    localStorage.setItem('phcaCurrentGenerationId', 'phca-4');

    if (!localStorage.getItem('phcaSelectedGenerationId')) {
      localStorage.setItem('phcaSelectedGenerationId', 'phca-4');
    }

    return DEFAULT_GENERATIONS;
  } catch (error) {
    console.error('기수 데이터를 불러오는 중 오류 발생:', error);
    return DEFAULT_GENERATIONS;
  }
};

const saveGenerations = (generations) => {
  localStorage.setItem('phcaGenerations', JSON.stringify(generations));
};

const getSelectedGenerationId = () => {
  return (
    localStorage.getItem('phcaSelectedGenerationId') ||
    localStorage.getItem('phcaCurrentGenerationId') ||
    'phca-4'
  );
};

const setSelectedGenerationId = (generationId) => {
  localStorage.setItem('phcaSelectedGenerationId', generationId);
};

const StatusBadge = ({ status }) => {
  const styles = {
    '접수 완료': 'bg-blue-100 text-blue-700 border border-blue-200',
    '확인 중': 'bg-amber-100 text-amber-700 border border-amber-200',
    '배정 완료': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    '대기': 'bg-slate-100 text-slate-600 border border-slate-200',
    '반려': 'bg-red-100 text-red-700 border border-red-200',
    '신청가능': 'bg-sky-100 text-sky-700 border border-sky-200',
    '마감임박': 'bg-gradient-to-r from-orange-400 to-rose-400 text-white font-bold shadow-sm',
    '마감': 'bg-slate-200 text-slate-500 border border-slate-300',
    '신청마감': 'bg-slate-200 text-slate-500 border border-slate-300',
    '비노출': 'bg-slate-700 text-slate-300 border border-slate-800',
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
    { path: '/notices', label: '공지사항' },
    { path: '/faq', label: 'FAQ' },
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
  <img src="/logo.png" alt="PHCA 로고" className="h-16 w-auto hover:opacity-80 transition-opacity" />
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

const Footer = ({ navigate }) => (
  <footer className="bg-white border-t border-slate-200 pt-16 pb-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <span className="text-2xl font-black text-slate-800 tracking-tighter">PHCA<span className="text-sky-500">.</span></span>
        <p className="text-slate-500 text-sm mt-2">{currentGeneration.name} 피터 하늘 문화 아카데미<br/>신천지예수교 증거장막성전 베드로지파 광주교회</p>
      </div>
      <div className="text-slate-400 text-sm font-medium">
        © 2026 PHCA. All rights reserved. <button onClick={() => navigate('/admin')} className="ml-2 hover:text-sky-500"><Lock size={12} className="inline"/></button>
      </div>
    </div>
  </footer>
);

const AuthPage = ({ type, navigate, onAuthSuccess }) => {
  const isLogin = type === 'login';
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', church: '광주 교회', department: '학생회', grade: '중1', age: '14세', gender: '남' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 부서별 학년/나이 데이터
  const gradeOptions = {
    '유년회': ['유치부', '1학년', '2학년', '3학년', '4학년', '5학년', '6학년'],
    '학생회': ['중1', '중2', '중3', '고1', '고2', '고3']
  };

  const ageOptions = {
    '유년회': ['6세', '7세', '8세', '9세', '10세', '11세', '12세', '13세'],
    '학생회': ['14세', '15세', '16세', '17세', '18세', '19세']
  };

  const gradePlaceholder = gradeOptions[formData.department]?.[0] || '학년을 선택해주세요';
  const agePlaceholder = ageOptions[formData.department]?.[0] || '나이를 선택해주세요';

  // 연락처 자동 포맷팅 (010-nnnn-nnnn)
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else if (name === 'department' && !isLogin) {
      // 부서 변경 시 학년과 나이 초기화
      setFormData({ ...formData, [name]: value, grade: '', age: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

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
      if (!formData.name || !formData.phone || !formData.password || !formData.grade || !formData.age || !formData.gender) return setError('모든 필수 항목을 입력해주세요.');
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
          
          <label className={labelClass}>연락처 (- 포함) *</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} placeholder="010-0000-0000" />
          
          <label className={labelClass}>비밀번호 *</label>
          <div className="relative mt-2 mb-4">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className={inputClass.replace(' mt-2 mb-4', '')} 
              placeholder="비밀번호 입력" 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {!isLogin && (
            <>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className={labelClass}>소속 교회 *</label>
                  <input type="text" name="church" value={formData.church} readOnly className={inputClass + ' bg-slate-100 cursor-not-allowed'} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>부서 *</label>
                  <select name="department" value={formData.department} onChange={handleChange} className={inputClass}>
                    <option value="유년회">유년회</option>
                    <option value="학생회">학생회</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <label className={labelClass}>학년 *</label>
                  <select name="grade" value={formData.grade} onChange={handleChange} className={inputClass}>
                    <option value="" disabled hidden>{gradePlaceholder}</option>
                    {gradeOptions[formData.department].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>나이 *</label>
                  <select name="age" value={formData.age} onChange={handleChange} className={inputClass}>
                    <option value="" disabled hidden>{agePlaceholder}</option>
                    {ageOptions[formData.department].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>성별 *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                    <option value="" disabled hidden>선택해 주세요</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
              </div>
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

const NoticeItem = ({ notice, isOpen, onToggle }) => {
  return (
    <div className="flex flex-col border-b border-slate-100 last:border-b-0 group">
      <div 
        onClick={() => onToggle(notice.id)}
        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-5 cursor-pointer hover:bg-slate-50 transition-colors px-2 sm:px-4"
      >
        <div className="flex items-center gap-2 sm:w-24 flex-shrink-0">
          {notice.category === '필수' ? (
            <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-1 rounded-md">필수</span>
          ) : (
            <span className="text-slate-500 text-[11px] font-bold border border-slate-200 px-2 py-1 rounded-md bg-white">{notice.category}</span>
          )}
          {/* Mobile Date */}
          <span className="text-slate-400 text-xs font-medium sm:hidden ml-auto">
            {notice.date}
          </span>
        </div>
        <div className="flex-grow flex items-start sm:items-center gap-2 min-w-0">
          <span className={`font-bold transition-colors text-sm sm:text-base leading-snug ${isOpen ? 'text-sky-600' : 'text-slate-800 group-hover:text-sky-600'}`}>
            {notice.title}
          </span>
        </div>
        {/* Desktop Date */}
        <div className="hidden sm:flex flex-shrink-0 items-center gap-4 text-slate-400 text-sm font-medium w-32 justify-end">
          <span>{notice.date}</span>
          <span className={`transform transition-transform text-xs ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
        <div className="sm:hidden flex justify-end w-full mt-1">
          <span className={`text-slate-400 text-[10px] transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>
      
      {isOpen && (
        <div className="px-4 sm:px-6 py-6 bg-slate-50/50 border-t border-slate-100">
          <h4 className="text-lg font-black text-slate-800 mb-4">{notice.title}</h4>
          <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
            {notice.content}
          </div>
        </div>
      )}
    </div>
  );
};

const NoticeList = ({ notices, openId, onToggle }) => {
  if (notices.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500 font-bold">
        조건에 맞는 공지사항이 없습니다.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {notices.map(notice => (
        <NoticeItem 
          key={notice.id} 
          notice={notice} 
          isOpen={openId === notice.id} 
          onToggle={onToggle} 
        />
      ))}
    </div>
  );
};

const NoticeCategoryFilter = ({ categories, selectedCategory, onSelect }) => (
  <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${selectedCategory === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
      >
        {cat}
      </button>
    ))}
  </div>
);

const NoticeSearch = ({ searchQuery, onSearch }) => (
  <div className="w-full md:w-72 relative mt-4 md:mt-0">
    <input
      type="text"
      placeholder="공지 제목 또는 내용을 검색해보세요."
      value={searchQuery}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
    />
    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
  </div>
);

const NoticePreview = ({ navigate }) => {
  const [openId, setOpenId] = useState(null);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    setNotices(JSON.parse(localStorage.getItem('phcaNotices')) || []);
  }, []);

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.category === '필수' && b.category !== '필수') return -1;
    if (a.category !== '필수' && b.category === '필수') return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const previewNotices = sortedNotices.slice(0, 5);

  return (
    <section className="py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-10">
          <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
            <div>
              <p className="text-sky-500 font-black tracking-widest uppercase text-xs mb-1">Notice</p>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">공지사항</h2>
            </div>
            <button 
              onClick={() => navigate('/notices')} 
              className="text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1 pb-1"
            >
              전체보기 <ChevronRight size={16} />
            </button>
          </div>
          <NoticeList 
            notices={previewNotices} 
            openId={openId} 
            onToggle={(id) => setOpenId(openId === id ? null : id)} 
          />
        </div>
      </div>
    </section>
  );
};

const NoticePage = ({ navigate }) => {
  const [openId, setOpenId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    setNotices(JSON.parse(localStorage.getItem('phcaNotices')) || []);
  }, []);

  const categories = ['전체', '필수', '모집', '강좌', '운영', '안내'];

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.category === '필수' && b.category !== '필수') return -1;
    if (a.category !== '필수' && b.category === '필수') return 1;
    return new Date(b.date) - new Date(a.date);
  });

  const filteredNotices = sortedNotices.filter(notice => {
    const matchesCategory = filterCategory === '전체' || notice.category === filterCategory;
    const matchesSearch = notice.title.includes(searchQuery) || notice.content.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 animate-fadeIn bg-slate-50">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <p className="text-sky-500 font-black tracking-[0.3em] uppercase text-sm mb-3">NOTICE</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">공지사항</h1>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">PHCA 운영과 신청에 필요한 주요 안내사항을 확인해보세요.</p>
      </div>

      <div className="max-w-5xl mx-auto mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <NoticeCategoryFilter 
            categories={categories} 
            selectedCategory={filterCategory} 
            onSelect={setFilterCategory} 
          />
          <NoticeSearch 
            searchQuery={searchQuery} 
            onSearch={setSearchQuery} 
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden p-2 sm:p-6">
          <NoticeList 
            notices={filteredNotices} 
            openId={openId} 
            onToggle={(id) => setOpenId(openId === id ? null : id)} 
          />
        </div>
      </div>
    </div>
  );
};

const HomePage = ({ navigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mainVisual, setMainVisual] = useState({
    recruitSchedule: '7월 12일(일) ~ 7월 22일(수)',
    operationSchedule: '7월 25일(토) ~ 8월 23일(토)',
    recruitTarget: '유년 회원',
    operationLocation: '베드로지파 광주교회 각 층'
  });
  const slides = [
    '/images/img_01.jpg',
    '/images/img_02.jpg',
    '/images/img_03.jpg'
  ];

  useEffect(() => {
    const visuals = JSON.parse(localStorage.getItem('phcaMainVisuals')) || [];
    const currentVisual = visuals.find(v => v.generationId === currentGeneration.id);
    if (currentVisual) {
      setMainVisual(prev => ({ ...prev, ...currentVisual }));
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="animate-fadeIn pb-10">
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Slider Backgrounds */}
        {slides.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
          >
            <img src={img} alt={`Main Banner ${index + 1}`} className="w-full h-full object-cover" />
          </div>
        ))}
        
        {/* Bright Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-sky-50/60 backdrop-blur-sm z-0"></div>

        {/* Decorative Blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] rounded-full bg-yellow-300/30 blur-[100px]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[600px] h-[600px] rounded-full bg-sky-400/20 blur-[100px]"></div>
        </div>
        
        {/* Slider Controls */}
        <div className="absolute inset-0 z-20 flex items-center justify-between px-4 sm:px-8 pointer-events-none">
          <button onClick={() => setCurrentSlide(prev => prev === 0 ? slides.length - 1 : prev - 1)} className="pointer-events-auto p-2 sm:p-3 rounded-full bg-white/50 text-slate-800 hover:bg-white/80 border border-slate-200 transition-colors backdrop-blur-sm shadow-sm">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => setCurrentSlide(prev => prev === slides.length - 1 ? 0 : prev + 1)} className="pointer-events-auto p-2 sm:p-3 rounded-full bg-white/50 text-slate-800 hover:bg-white/80 border border-slate-200 transition-colors backdrop-blur-sm shadow-sm">
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Slider Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all shadow-sm ${index === currentSlide ? 'bg-sky-500 w-8' : 'bg-slate-300/80 w-2.5 hover:bg-sky-400'}`}
            />
          ))}
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
          <p className="text-lg md:text-2xl text-slate-800 font-bold mb-10 max-w-2xl mx-auto leading-relaxed">
            여름방학을 배움과 성장의 시간으로!<br className="hidden md:block"/> 
            {currentGeneration.name} 피터하늘문화 아카데미에 초대합니다!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <button onClick={() => navigate('/apply')} className="bg-sky-500 text-white font-black px-10 py-4 rounded-full hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30 transition-all transform hover:-translate-y-1 text-lg">
              수강 신청하기
            </button>
            <button onClick={() => navigate('/courses')} className="bg-white/90 backdrop-blur-sm text-slate-800 font-black px-10 py-4 rounded-full hover:bg-white shadow-lg hover:shadow-xl transition-all border border-slate-100 text-lg">
              강좌 둘러보기
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500 mb-6 group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">모집 일정</h3>
            <p className="text-slate-500 font-medium">{mainVisual.recruitSchedule}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform"><Calendar size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">운영 일정</h3>
            <p className="text-slate-500 font-medium">{mainVisual.operationSchedule}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform"><User size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">모집 대상</h3>
            <p className="text-slate-500 font-medium">{mainVisual.recruitTarget}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-1 transition-transform group">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform"><MapPin size={28} /></div>
            <h3 className="text-xl font-black text-slate-800 mb-2">운영 장소</h3>
            <p className="text-slate-500 font-medium">{mainVisual.operationLocation}</p>
          </div>
        </div>
      </section>

      <NoticePreview navigate={navigate} />

      <section className="py-12 md:py-20 relative">
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
  const [filterGroup, setFilterGroup] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('phcaCourses')) || MOCK_COURSES);
  }, []);

  // 비노출 강좌 제외
  const visibleCourses = courses.filter(c => c.status !== '비노출');

  // 전체 통계
  const totalCourses = visibleCourses.length;
  const youthCount = visibleCourses.filter(c => c.group === '유년').length;
  const studentCount = visibleCourses.filter(c => c.group === '학생').length;
  const availableCount = visibleCourses.filter(c => c.status === '신청가능').length;
  const closedCount = visibleCourses.filter(c => c.status === '마감' || c.status === '신청마감').length;

  const getDeptStats = (deptName) => {
    const deptCourses = deptName === '전체' ? visibleCourses : visibleCourses.filter(c => c.department === deptName);
    return {
      total: deptCourses.length,
      youth: deptCourses.filter(c => c.group === '유년').length,
      student: deptCourses.filter(c => c.group === '학생').length,
      available: deptCourses.filter(c => c.status === '신청가능').length,
    };
  };

  const depts = ['전체', '문화부', '찬양부', '체육부', '홍보부', '정보통신부'];

  // 필터 적용
  const filteredCourses = visibleCourses.filter(course => {
    if (filterDept !== '전체' && course.department !== filterDept) return false;
    if (filterGroup !== '전체' && course.group !== filterGroup) return false;
    if (filterStatus === '신청가능' && course.status !== '신청가능') return false;
    if (filterStatus === '신청마감' && course.status !== '마감' && course.status !== '신청마감') return false;
    return true;
  });

  const handleDirectApply = (courseId) => {
    if (!user) {
      navigate(`/login`, { redirect: `/apply?courseId=${courseId}` });
    } else {
      navigate(`/apply?courseId=${courseId}`);
    }
  };

  const StatCard = ({ label, value, color }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center hover:border-sky-200 hover:shadow-md transition-all">
      <p className="text-slate-500 text-xs font-bold mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 animate-fadeIn bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-amber-500 font-black tracking-widest uppercase text-sm mb-2">Explore</p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{currentGeneration.name} 강좌 안내</h2>
          <p className="text-slate-600 mt-4 max-w-2xl mx-auto font-medium leading-relaxed">부서별 강좌를 한눈에 확인하고 원하는 강좌를 선택해보세요.</p>
        </div>
        
        {/* 전체 현황 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          <StatCard label="전체 강좌 수" value={totalCourses} color="text-slate-800" />
          <StatCard label="유년회 강좌 수" value={youthCount} color="text-amber-500" />
          <StatCard label="학생회 강좌 수" value={studentCount} color="text-indigo-500" />
          <StatCard label="신청 가능" value={availableCount} color="text-emerald-500" />
          <StatCard label="마감" value={closedCount} color="text-rose-500" />
        </div>

        {/* 부서별 선택 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {depts.map(dept => {
            const stats = getDeptStats(dept);
            const isSelected = filterDept === dept;
            return (
              <div key={dept} onClick={() => setFilterDept(dept)} className={`cursor-pointer rounded-2xl p-4 border transition-all flex flex-col h-full ${isSelected ? 'border-sky-500 bg-sky-50 shadow-md ring-1 ring-sky-500' : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'}`}>
                <h3 className={`text-lg font-black mb-3 text-center ${isSelected ? 'text-sky-700' : 'text-slate-800'}`}>{dept}</h3>
                <div className="space-y-1.5 text-xs text-slate-600 mb-4 flex-grow px-1">
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">전체</span><span className="font-black text-sm">{stats.total}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">유년</span><span className="font-black text-sm">{stats.youth}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">학생</span><span className="font-black text-sm">{stats.student}</span></div>
                  <div className="flex justify-between items-center pt-1 mt-1 border-t border-slate-100"><span className="text-sky-600 font-bold">신청가능</span><span className="font-black text-sky-600 text-sm">{stats.available}</span></div>
                </div>
                <button className={`w-full py-2.5 rounded-xl text-xs font-bold transition-colors mt-auto ${isSelected ? 'bg-sky-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>강좌 보기</button>
              </div>
            )
          })}
        </div>

        {/* 추가 필터 및 목록 헤더 */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 gap-4">
          <h3 className="font-black text-slate-800 text-lg">
            {filterDept === '전체' ? '전체 강좌 목록' : `${filterDept} 강좌 목록`} 
            <span className="text-sky-500 ml-2">{filteredCourses.length}</span>건
          </h3>
          <div className="flex gap-3 w-full sm:w-auto">
            <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="flex-1 sm:w-32 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 p-2.5 outline-none text-sm font-bold">
              <option value="전체">전체 (회)</option>
              <option value="유년">유년회</option>
              <option value="학생">학생회</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 sm:w-36 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 p-2.5 outline-none text-sm font-bold">
              <option value="전체">상태 전체</option>
              <option value="신청가능">신청가능</option>
              <option value="신청마감">신청마감</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full table-fixed text-left text-[13px] whitespace-nowrap">
            <colgroup>
              <col className="w-[7%]" />
              <col className="w-[19%]" />
              <col className="w-[6%]" />
              <col className="w-[10%]" />
              <col className="w-[8%]" />
              <col className="w-[13%]" />
              <col className="w-[5%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-3 py-3 rounded-tl-2xl">부서</th>
                <th className="px-3 py-3">강좌명</th>
                <th className="px-3 py-3">회</th>
                <th className="px-3 py-3">대상</th>
                <th className="px-3 py-3">교육일</th>
                <th className="px-3 py-3">교육시간</th>
                <th className="px-3 py-3">정원</th>
                <th className="px-3 py-3">후원금</th>
                <th className="px-3 py-3">상태</th>
                <th className="px-3 py-3 text-left rounded-tr-2xl">보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredCourses.map(course => (
                <tr key={course.id} className="hover:bg-sky-50/50 transition-colors group">
                  <td className="px-3 py-3 font-bold text-slate-500">{course.department}</td>
                  <td className="px-3 py-3">
                    <button onClick={() => navigate(`/courses/${course.id}`)} className="font-black text-slate-900 group-hover:text-sky-600 transition-colors text-left truncate w-full">
                      {course.name}
                    </button>
                  </td>
                  <td className="px-3 py-3"><span className={`px-2.5 py-1 rounded-lg text-xs font-black ${course.group==='유년'?'bg-amber-100 text-amber-700':'bg-indigo-100 text-indigo-700'}`}>{course.group}</span></td>
                  <td className="px-3 py-3 truncate">{course.target}</td>
                  <td className="px-3 py-3 truncate">{course.days}</td>
                  <td className="px-3 py-3 truncate">{course.times}</td>
                  <td className="px-3 py-3">{course.capacity}</td>
                  <td className="px-3 py-3 font-black text-rose-500">{course.donation}</td>
                  <td className="px-3 py-3"><StatusBadge status={course.status} /></td>
                  <td className="px-3 py-3">
                    <div className="flex justify-start items-center gap-1.5">
                      <button 
                        onClick={() => navigate(`/courses/${course.id}`)}
                        className="px-2.5 py-2 rounded-xl font-bold text-[12px] transition-colors shadow-sm bg-white text-slate-600 border border-slate-200 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200"
                      >
                        강좌 소개
                      </button>
                      <button 
                        onClick={() => handleDirectApply(course.id)}
                        disabled={course.status === '마감' || course.status === '신청마감'}
                        className={`px-2.5 py-2 rounded-xl font-bold text-[12px] transition-colors shadow-sm flex items-center justify-center gap-1 ${course.status === '마감' || course.status === '신청마감' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600'}`}
                      >
                        <Ticket size={14} /> 신청하기
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && (
                <tr><td colSpan="10" className="px-3 py-12 text-center text-slate-500 font-bold text-base">조건에 맞는 강좌가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Compact Cards View */}
        <div className="md:hidden space-y-4">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-black text-sky-700 bg-sky-100 px-2.5 py-1 rounded-lg">{course.department}</span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${course.group==='유년'?'bg-amber-100 text-amber-700':'bg-indigo-100 text-indigo-700'}`}>{course.group}</span>
                </div>
                <StatusBadge status={course.status} />
              </div>
              <h3 onClick={() => navigate(`/courses/${course.id}`)} className="text-lg font-black text-slate-800 mb-3 cursor-pointer hover:text-sky-600 transition-colors leading-snug">{course.name}</h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex flex-col col-span-2"><span className="text-[10px] font-bold text-slate-400 mb-0.5">교육일시</span><span className="font-bold text-slate-700">{course.days} {course.times}</span></div>
                <div className="flex flex-col col-span-2 pt-2 mt-1 border-t border-slate-200/60 flex-row justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">후원금</span><span className="font-black text-rose-500">{course.donation}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => navigate(`/courses/${course.id}`)} className="flex-1 py-3.5 font-bold rounded-xl transition-colors text-sm border bg-white text-slate-700 border-slate-300 hover:bg-slate-50">
                  강좌 소개
                </button>
                <button onClick={() => handleDirectApply(course.id)} disabled={course.status === '마감' || course.status === '신청마감'} className={`flex-1 py-3.5 font-bold rounded-xl transition-colors shadow-sm text-sm flex items-center justify-center gap-1.5 ${course.status === '마감' || course.status === '신청마감' ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-sky-500 text-white hover:bg-sky-600'}`}>
                  <Ticket size={16} /> 신청하기
                </button>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500 font-bold shadow-sm">조건에 맞는 강좌가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const CourseInfoTable = ({ rows }) => (
  <div className="grid grid-cols-1 gap-4">
    {rows.map((row) => (
      <div key={row.label} className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">{row.label}</p>
        <p className="font-bold text-slate-700 leading-relaxed">{row.value}</p>
      </div>
    ))}
  </div>
);

const CourseImage = ({ src, alt, className }) => (
  <div className={`overflow-hidden rounded-[2rem] bg-slate-100 ${className || ''}`}>
    <img
      src={src || COURSE_IMAGE_PLACEHOLDER}
      alt={alt}
      onError={(e) => { e.currentTarget.src = COURSE_IMAGE_PLACEHOLDER; }}
      className="w-full h-full object-cover"
    />
  </div>
);

const CourseGallery = ({ images, onSelectImage }) => {
  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center text-slate-500">
        등록된 강좌 사진이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((src) => (
        <button
          key={src}
          type="button"
          onClick={() => onSelectImage(src)}
          className="overflow-hidden rounded-[2rem] bg-slate-100 border border-slate-100 hover:shadow-lg hover:shadow-sky-100 transition-all"
        >
          <img
            src={src}
            alt="강좌 사진"
            onError={(e) => { e.currentTarget.src = COURSE_IMAGE_PLACEHOLDER; }}
            className="w-full h-52 object-cover"
          />
        </button>
      ))}
    </div>
  );
};

const ImageModal = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="relative w-full max-w-4xl rounded-[2rem] overflow-hidden bg-white shadow-2xl">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white p-3 text-slate-700 shadow hover:bg-slate-100"
      >
        닫기
      </button>
      <img
        src={src}
        alt={alt}
        onError={(e) => { e.currentTarget.src = COURSE_IMAGE_PLACEHOLDER; }}
        className="w-full max-h-[80vh] object-contain bg-slate-900"
      />
    </div>
  </div>
);

const CourseNoticeBox = ({ notices }) => (
  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
    <h3 className="text-xl font-black text-slate-800 mb-4">유의사항</h3>
    <ul className="list-disc list-inside space-y-3 text-slate-600">
      {notices.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  </div>
);

const CourseDetailPage = ({ courseId, navigate }) => {
  const courses = JSON.parse(localStorage.getItem('phcaCourses')) || MOCK_COURSES;
  const course = courses.find((item) => item.id === courseId);
  const [selectedImage, setSelectedImage] = useState(course?.images?.[0] || course?.thumbnail);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (course) {
      setSelectedImage(course.images?.[0] || course.thumbnail);
    }
  }, [course]);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 animate-fadeIn flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 text-center">
          <p className="text-2xl font-black text-slate-800 mb-4">강좌를 찾을 수 없습니다.</p>
          <p className="text-slate-500 mb-8">다시 목록에서 강좌를 선택해주세요.</p>
          <button onClick={() => navigate('/courses')} className="px-8 py-4 bg-slate-800 text-white rounded-full font-black hover:bg-sky-500 transition-all">목록으로 돌아가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-10">
          <div className="space-y-4">
            <p className="text-amber-500 font-black tracking-widest uppercase text-sm">{currentGeneration.name} Course Detail</p>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">{course.name}</h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className="px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 font-bold text-xs">{course.department}</span>
              <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">{course.group}</span>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">{course.target}</span>
              <StatusBadge status={course.status} />
            </div>
          </div>
          <button onClick={() => navigate('/courses')} className="px-6 py-3 bg-white text-slate-700 font-bold rounded-full border border-slate-200 hover:bg-slate-50 transition-all">목록으로 돌아가기</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
                <CourseImage src={selectedImage} alt={course.name} className="h-[420px]" />
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-5">강좌 소개</h2>
                    <p className="text-slate-700 text-lg font-bold mb-5">{course.summary}</p>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{course.description}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <span className="font-bold text-slate-700">교육일</span>
                      <span className="text-slate-600">{course.days}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <span className="font-bold text-slate-700">교육시간</span>
                      <span className="text-slate-600">{course.times}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-black text-slate-800 mb-5">사진 갤러리</h3>
                <CourseGallery images={course.images} onSelectImage={(src) => setModalImage(src)} />
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-5">추천 대상</h2>
              <ul className="list-disc list-inside space-y-3 text-slate-600">
                {course.recommendedFor.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-5">수업 내용</h2>
              <ul className="list-disc list-inside space-y-3 text-slate-600">
                {course.curriculum.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <CourseNoticeBox notices={course.notice} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-6">운영 정보</h2>
              <CourseInfoTable
                rows={[
                  { label: '교육일', value: course.days },
                  { label: '교육시간', value: course.times },
                  { label: '모집정원', value: course.capacity },
                  { label: '대상', value: course.target },
                  { label: '준비물', value: course.supplies },
                  { label: '후원금', value: course.donation },
                  { label: '부서', value: course.department },
                ]}
              />
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-2xl font-black text-slate-800 mb-5">추가 정보</h2>
              <div className="space-y-4 text-slate-600">
                <div><span className="font-bold text-slate-800">강좌명: </span>{course.name}</div>
                <div><span className="font-bold text-slate-800">그룹: </span>{course.group}</div>
                <div><span className="font-bold text-slate-800">신청 가능: </span>{course.available ? '신청 가능' : '마감'}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button onClick={() => navigate(`/apply?courseId=${course.id}`)} disabled={!course.available} className={`w-full px-8 py-4 text-white font-black rounded-full transition-all shadow-md ${course.available ? 'bg-sky-500 hover:bg-sky-600 hover:-translate-y-0.5' : 'bg-slate-300 cursor-not-allowed'}`}>{course.available ? '신청하기' : '마감된 강좌입니다'}</button>
              <button onClick={() => navigate('/courses')} className="w-full px-8 py-4 bg-white text-slate-700 font-bold rounded-full border border-slate-200 hover:bg-slate-50 transition-all">목록으로 돌아가기</button>
            </div>
          </div>
        </div>
      </div>
      {modalImage && <ImageModal src={modalImage} alt={course.name} onClose={() => setModalImage(null)} />}
    </div>
  );
};

const FAQItem = ({ faq, isOpen, onToggle }) => (
  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
    <button
      type="button"
      onClick={() => onToggle(faq.id)}
      className="w-full flex items-center justify-between gap-4 px-6 py-6 text-left"
    >
      <div>
        <p className="text-base font-black text-slate-900">{faq.question}</p>
      </div>
      <span className={`text-slate-500 text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>&#x25BC;</span>
    </button>
    {isOpen && (
      <div className="px-6 pb-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-200">
        {faq.answer}
      </div>
    )}
  </div>
);

const FAQAccordion = ({ faqs, openId, onToggle }) => (
  <div className="space-y-4">
    {faqs.map((faq) => (
      <FAQItem key={faq.id} faq={faq} isOpen={openId === faq.id} onToggle={onToggle} />
    ))}
  </div>
);

const FAQPage = ({ navigate }) => {
  const [openId, setOpenId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setFaqs(JSON.parse(localStorage.getItem('phcaFaqs')) || []);
  }, []);

  const categories = ['전체', '신청', '강좌', '후원금', '운영', '계정', '문의'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = filterCategory === '전체' || faq.category === filterCategory;
    const matchesSearch = faq.question.includes(searchQuery) || faq.answer.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 animate-fadeIn bg-slate-50">
      <div className="max-w-5xl mx-auto text-center mb-14">
        <p className="text-sky-500 font-black tracking-[0.3em] uppercase text-sm mb-3">HELP CENTER</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">자주 묻는 질문</h1>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed">PHCA 신청 전 자주 묻는 내용을 확인해보세요.</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <NoticeCategoryFilter 
            categories={categories} 
            selectedCategory={filterCategory} 
            onSelect={setFilterCategory} 
          />
          <NoticeSearch 
            searchQuery={searchQuery} 
            onSearch={setSearchQuery} 
          />
        </div>

        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            <FAQAccordion faqs={filteredFaqs} openId={openId} onToggle={(id) => setOpenId(openId === id ? null : id)} />
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-12 text-center text-slate-600 shadow-sm">
              조건에 맞는 FAQ가 없습니다.
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-10 shadow-xl shadow-slate-200/50">
          <div className="md:flex md:items-center md:justify-between gap-6">
            <div>
              <p className="text-2xl font-black text-slate-900 mb-3">원하는 답변을 찾지 못하셨나요?</p>
              <p className="text-slate-600 leading-relaxed">담당자에게 문의해 주세요.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-0">
              <a href="https://t.me/your_telegram_id_yunyoung" target="_blank" rel="noreferrer" className="rounded-full bg-sky-600 px-8 py-4 text-white font-black hover:bg-sky-700 transition text-center">
                유년회 문의하기
              </a>
              <a href="https://t.me/your_telegram_id_student" target="_blank" rel="noreferrer" className="rounded-full bg-slate-100 px-8 py-4 text-slate-700 font-bold hover:bg-slate-200 transition text-center">
                학생회 문의하기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ApplyPage = ({ navigate, routeState, user }) => {
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  
  // URL에서 선택한 강좌 ID를 가져옵니다.
  const courses = JSON.parse(localStorage.getItem('phcaCourses')) || MOCK_COURSES;
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId') || routeState?.courseId;
  const selectedCourse = courses.find(c => c.id === courseId);

  if (!selectedCourse) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-20 animate-fadeIn px-4 text-center">
        <p className="text-2xl text-slate-800 font-black mb-6">신청할 강좌를 먼저 선택해 주세요.</p>
        <button onClick={() => navigate('/courses')} className="px-8 py-4 bg-sky-500 text-white rounded-full font-black hover:bg-sky-600 shadow-lg shadow-sky-200 transition-all transform hover:-translate-y-1">강좌 안내 보러가기</button>
      </div>
    );
  }

  // 부서별 학년/나이 데이터
  const gradeOptions = {
    '유년회': ['유치부', '1학년', '2학년', '3학년', '4학년', '5학년', '6학년'],
    '학생회': ['중1', '중2', '중3', '고1', '고2', '고3']
  };

  const ageOptions = {
    '유년회': ['6세', '7세', '8세', '9세', '10세', '11세', '12세', '13세'],
    '학생회': ['14세', '15세', '16세', '17세', '18세', '19세']
  };
  
  const [formData, setFormData] = useState({
    applicantName: user?.name || '', 
    church: user?.church || '광주 교회', 
    group: user?.department || '유년회', 
    grade: user?.grade || '', 
    age: user?.age || '',
    gender: user?.gender || '', 
    guardianName: '', 
    guardianPhone: '', 
    guardianRelation: '',
    guardianRelationEtc: '',
    phone: user?.phone || '',
    notes: '',
    agreePrivacy: false, 
    agreeGuardian: false
  });

  const gradePlaceholder =
    formData.group === "유년회"
      ? "예: 초3"
      : formData.group === "학생회"
      ? "예: 중2"
      : "학년을 입력해 주세요";

  const agePlaceholder =
    formData.group === "유년회"
      ? "예: 9세"
      : formData.group === "학생회"
      ? "예: 15세"
      : "나이를 입력해 주세요";

  // 연락처 자동 포맷팅 (010-nnnn-nnnn)
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (name === 'phone' || name === 'guardianPhone') {
      finalValue = formatPhone(value);
    }

    if (name === 'group') {
      setFormData(prev => ({ ...prev, [name]: finalValue, grade: '', age: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
    setErrorMsg('');
  };

  const nextStep = () => {
    setErrorMsg('');
    if (step === 1 && (!formData.applicantName || !formData.church || !formData.phone || !formData.grade || !formData.age)) {
      setErrorMsg('필수 정보를 모두 입력해주세요.'); return;
    }
    if (step === 3) {
      if (!formData.guardianName || !formData.guardianPhone || !formData.guardianRelation) {
        setErrorMsg('보호자 필수 정보를 모두 입력해주세요.'); return;
      }
      if (formData.guardianRelation === '기타' && !formData.guardianRelationEtc) {
        setErrorMsg('보호자 관계를 직접 입력해주세요.'); return;
      }
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
    const newApp = { 
      ...formData, 
      generationId: currentGeneration.id,
      generationName: currentGeneration.name,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      courseDepartment: selectedCourse.department,
      courseGroup: selectedCourse.group,
      courseTarget: selectedCourse.target,
      courseDays: selectedCourse.days,
      courseTimes: selectedCourse.times,
      courseDonation: selectedCourse.donation,
      userId: user?.id || 'guest', 
      id: Date.now(), 
      status: '접수 완료', 
      date: new Date().toLocaleDateString() 
    };
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
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{currentGeneration.name} 수강 신청</h2>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-400 px-2 mb-4">
            <span className={step >= 1 ? 'text-sky-500' : ''}>1. 기본 정보</span>
            <span className={step >= 2 ? 'text-sky-500' : ''}>2. 신청 강좌 확인</span>
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
              <div className="bg-amber-50 p-4 rounded-xl text-amber-700 font-bold text-sm mb-4">
                기본정보는 회원가입 정보 기준으로 자동 입력됩니다. 수정이 필요한 경우 관리자에게 문의해 주세요.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div><label className={labelClass}>이름 *</label><input type="text" name="applicantName" value={formData.applicantName} readOnly className={inputClass + ' bg-slate-100 cursor-not-allowed'} placeholder="홍길동" /></div>
                <div><label className={labelClass}>소속 교회 *</label><input type="text" name="church" value={formData.church} readOnly className={inputClass + ' bg-slate-100 cursor-not-allowed'} /></div>
                <div>
                  <label className={labelClass}>부서 구분 *</label>
                  <select name="group" value={formData.group} disabled className={inputClass + ' bg-slate-100 cursor-not-allowed'}>
                    <option value="유년회">유년회</option>
                    <option value="학생회">학생회</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>학년 *</label>
                  <select name="grade" value={formData.grade} disabled className={inputClass + ' bg-slate-100 cursor-not-allowed'}>
                    <option value="" disabled hidden>{gradePlaceholder}</option>
                    {gradeOptions[formData.group].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>나이 *</label>
                  <select name="age" value={formData.age} disabled className={inputClass + ' bg-slate-100 cursor-not-allowed'}>
                    <option value="" disabled hidden>{agePlaceholder}</option>
                    {ageOptions[formData.group].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>성별</label>
                  <select name="gender" value={formData.gender} disabled className={inputClass + ' bg-slate-100 cursor-not-allowed'}>
                    <option value="" disabled hidden>선택해 주세요</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                <div><label className={labelClass}>본인 연락처 *</label><input type="tel" name="phone" value={formData.phone} readOnly className={inputClass + ' bg-slate-100 cursor-not-allowed'} placeholder="010-0000-0000" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fadeIn relative z-10">
               <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><span className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-sm mr-3">2</span>신청 강좌 확인</h3>
               <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200">
                  <h4 className="text-lg font-black text-slate-800 mb-4 border-b border-slate-200 pb-4">신청 강좌</h4>
                  <div className="space-y-3 text-slate-600 font-medium">
                    <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-400 font-bold">강좌명</span><span className="font-black text-sky-600">[{selectedCourse.department}] {selectedCourse.name}</span></div>
                    <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-400 font-bold">구분/대상</span><span>{selectedCourse.group} / {selectedCourse.target}</span></div>
                    <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-400 font-bold">교육일시</span><span>{selectedCourse.days} {selectedCourse.times}</span></div>
                    <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-400 font-bold">모집정원</span><span>{selectedCourse.capacity}</span></div>
                    <div className="flex flex-col sm:flex-row"><span className="w-24 text-slate-400 font-bold">후원금</span><span className="font-bold text-rose-500">{selectedCourse.donation}</span></div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                    <button onClick={() => navigate('/courses')} className="px-6 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-100 transition-all text-sm shadow-sm">강좌 다시 선택하기</button>
                  </div>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fadeIn relative z-10">
               <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center"><span className="w-8 h-8 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center text-sm mr-3">3</span>보호자 정보</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className={labelClass}>보호자 이름 *</label><input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className={inputClass} placeholder="홍길동" /></div>
                  <div><label className={labelClass}>보호자 연락처 *</label><input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} className={inputClass} placeholder="010-0000-0000" /></div>
                  <div>
                    <label className={labelClass}>보호자 관계 *</label>
                    <select name="guardianRelation" value={formData.guardianRelation} onChange={handleChange} className={inputClass}>
                      <option value="" disabled hidden>선택해 주세요</option>
                      <option value="부">부</option>
                      <option value="모">모</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>
                  {formData.guardianRelation === '기타' && (
                    <div><label className={labelClass}>관계 직접 입력 *</label><input type="text" name="guardianRelationEtc" value={formData.guardianRelationEtc} onChange={handleChange} className={inputClass} placeholder="예: 조부모, 형제, 보호자 등" /></div>
                  )}
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">신청 기수</span><span className="font-bold text-slate-600">{submitData.generationName || currentGeneration.name}</span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">신청자</span><span className="font-black text-slate-800 text-lg">{submitData.applicantName} <span className="text-slate-500 text-sm font-medium">({submitData.courseGroup})</span></span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">신청 강좌</span><span className="font-black text-sky-600 text-xl">[{submitData.courseDepartment}] {submitData.courseName}</span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">대상</span><span className="font-bold text-slate-600">{submitData.courseTarget}</span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">교육일시</span><span className="font-bold text-slate-600">{submitData.courseDays} {submitData.courseTimes}</span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">후원금</span><span className="font-bold text-rose-500">{submitData.courseDonation}</span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">보호자 이름 / 관계</span><span className="font-bold text-slate-600">{submitData.guardianName} / {submitData.guardianRelation === '기타' ? (submitData.guardianRelationEtc || '기타') : submitData.guardianRelation}</span></div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2"><span className="text-slate-400 font-bold text-sm mb-1 sm:mb-0">보호자 연락처</span><span className="font-bold text-slate-600">{submitData.guardianPhone}</span></div>
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
  const [searchParams, setSearchParams] = useState({ applicantName: user?.name || '', phone: user?.phone || '' });
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 연락처 자동 포맷팅 (010-nnnn-nnnn)
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!searchParams.applicantName || !searchParams.phone) {
      setErrorMsg('이름과 연락처를 모두 입력해주세요.'); return;
    }

    const applications = JSON.parse(localStorage.getItem('phca_applications') || '[]');
    const found = applications.find(app => 
      app.applicantName === searchParams.applicantName && 
      (app.phone === searchParams.phone || app.guardianPhone === searchParams.phone)
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
              <input type="text" placeholder="신청자 이름" value={searchParams.applicantName} onChange={e => setSearchParams({...searchParams, applicantName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold" />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">연락처 (- 포함)</label>
              <input type="tel" placeholder="010-0000-0000" value={searchParams.phone} onChange={e => setSearchParams({...searchParams, phone: formatPhone(e.target.value)})} className="w-full p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold" />
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
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">신청 기수</span><span className="font-bold text-slate-600 text-lg">{result.generationName || currentGeneration.name}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">신청자명</span><span className="font-black text-slate-800 text-xl">{result.applicantName}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">소속</span><span className="font-bold text-slate-600 text-lg">{result.church} / {result.courseGroup}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">학년 / 나이 / 성별</span><span className="font-bold text-slate-600 text-lg">{result.grade} / {result.age} / {result.gender || '-'}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">본인 연락처</span><span className="font-bold text-slate-600 text-lg">{result.phone}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">접수일</span><span className="font-bold text-slate-600 text-lg">{result.date}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">보호자 이름 / 관계</span><span className="font-bold text-slate-600 text-lg">{result.guardianName} / {result.guardianRelation === '기타' ? (result.guardianRelationEtc || '기타') : result.guardianRelation}</span></div>
                  <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold mb-2">보호자 연락처</span><span className="font-bold text-slate-600 text-lg">{result.guardianPhone}</span></div>
                  
                  <div className="sm:col-span-2 bg-sky-50 p-6 sm:p-8 rounded-3xl mt-4 border border-sky-100">
                    <div className="flex flex-col"><span className="text-slate-500 text-xs font-bold mb-2">신청 강좌</span><span className="font-black text-sky-600 text-2xl">[{result.courseDepartment}] {result.courseName}</span></div>
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

// --- [Admin Components] ---
const AdminLayout = ({ children, navigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentGen = JSON.parse(localStorage.getItem('phcaCurrentGeneration'));
  
const menuItems = [
  { path: '/admin', label: '대시보드', icon: LayoutDashboard },
  { path: '/admin/applications', label: '신청자 관리', icon: Users },
  { path: '/admin/courses', label: '강좌 관리', icon: BookOpen },
  { path: '/admin/notices', label: '공지사항 관리', icon: Bell },
  { path: '/admin/faqs', label: 'FAQ 관리', icon: MessageSquare },
  { path: '/admin/advanced', label: '심화반 관리', icon: FileText },

  // 추가
  { path: '/admin/main-visual', label: '메인 관리', icon: Sparkles },

  { path: '/admin/generation', label: '기수 설정', icon: Settings },
];

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          <span className="text-xl font-black text-white tracking-tight">PHCA Admin</span>
          <button className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="p-5 border-b border-slate-800 flex-shrink-0">
          <div className="bg-slate-800 rounded-xl p-4 shadow-inner">
            <p className="text-xs font-bold text-slate-400 mb-1">현재 운영 기수</p>
            <p className="font-black text-sky-400 text-sm">{currentGen?.name || 'PHCA 4기'}</p>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = window.location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button key={item.path} onClick={() => { navigate(item.path); setIsSidebarOpen(false); }} className={`w-full flex items-center px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${isActive ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Icon size={20} className={`mr-3 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm border border-slate-700 hover:border-slate-600">
            <ArrowRight size={18} className="mr-2" /> 사용자 화면으로
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between flex-shrink-0 z-30 shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 lg:hidden text-slate-500 hover:text-sky-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <Menu size={24} />
            </button>
            <h1 className="font-black text-xl text-slate-800 hidden sm:block tracking-tight">관리자 시스템</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full flex items-center border border-slate-200 shadow-sm">
              <ShieldCheck size={16} className="mr-1.5 text-sky-500" />
              <span>관리자 접속중</span>
            </div>
            <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
            <button onClick={onLogout} className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50 flex items-center group" title="로그아웃">
              <LogOut size={20} className="sm:mr-1.5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:block text-sm font-bold">로그아웃</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto bg-slate-50/50">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const AdminLoginPage = ({ navigate }) => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (id === 'admin' && pw === 'phca2026') {
      localStorage.setItem('phcaAdminAuth', 'true');
      navigate('/admin');
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-sky-500"></div>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-500"><Lock size={32}/></div>
          <h2 className="text-2xl font-black text-slate-800">PHCA 관리자 로그인</h2>
          <p className="text-slate-500 text-sm font-medium mt-2">운영자 전용 시스템입니다.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">아이디</label>
            <input type="text" value={id} onChange={e=>setId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium" placeholder="admin" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">비밀번호</label>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-medium" placeholder="••••••••" />
          </div>
          {error && <p className="text-rose-500 text-sm font-bold text-center">{error}</p>}
          <button type="submit" className="w-full bg-slate-800 text-white font-black py-4 rounded-xl hover:bg-slate-900 transition-all mt-4">로그인</button>
        </form>
      </div>
    </div>
  );
};

const AdminStatCard = ({ title, value, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
    <p className="text-slate-500 text-sm font-bold mb-2">{title}</p>
    <p className={`text-4xl font-black ${colorClass}`}>{value}</p>
  </div>
);

const AdminModal = ({ title, onClose, children, maxWidthClass = 'max-w-lg' }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
    <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidthClass} overflow-hidden animate-fadeIn flex flex-col max-h-[90vh]`}>
      <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
        <h3 className="text-xl font-black text-slate-800">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
      </div>
      <div className="p-6 overflow-y-auto flex-1 text-slate-600">
        {children}
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ title, message, targetInfo, onCancel, onConfirm, confirmText = '확인', cancelText = '취소', confirmClass = 'bg-sky-500 hover:bg-sky-600' }) => (
  <AdminModal title={title} onClose={onCancel}>
    <div className="mb-6">
      <p className="text-slate-700 font-medium mb-4 whitespace-pre-line">{message}</p>
      {targetInfo && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
          <p className="font-bold text-slate-500 mb-1">삭제 대상:</p>
          <p className="font-black text-slate-800">{targetInfo.name} / {targetInfo.course} / {targetInfo.phone}</p>
        </div>
      )}
    </div>
    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
      <button onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">{cancelText}</button>
      <button onClick={onConfirm} className={`px-6 py-2.5 rounded-xl font-bold text-white transition-colors shadow-sm ${confirmClass}`}>{confirmText}</button>
    </div>
  </AdminModal>
);

const ApplicationEditModal = ({ app, onCancel, onSave }) => {
  const [formData, setFormData] = useState({ ...app });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1";

  return (
    <AdminModal title="신청자 정보 수정" onClose={onCancel}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass}>신청기수</label><input type="text" name="generationName" value={formData.generationName || ''} onChange={handleChange} className={inputClass} /></div>
          <div>
            <label className={labelClass}>신청 상태</label>
            <select name="status" value={formData.status || '접수 완료'} onChange={handleChange} className={inputClass}>
              <option value="접수 완료">접수 완료</option>
              <option value="확인 중">확인 중</option>
              <option value="배정 완료">배정 완료</option>
              <option value="대기">대기</option>
              <option value="반려">반려</option>
            </select>
          </div>
          <div><label className={labelClass}>이름</label><input type="text" name="applicantName" value={formData.applicantName || ''} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>신청부서</label><input type="text" name="courseDepartment" value={formData.courseDepartment || ''} onChange={handleChange} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass}>강좌명</label><input type="text" name="courseName" value={formData.courseName || ''} onChange={handleChange} className={inputClass} /></div>
          <div>
            <label className={labelClass}>회</label>
            <input type="text" name="courseGroup" value={formData.courseGroup || formData.group || ''} onChange={(e) => {
                setFormData(prev => ({ ...prev, courseGroup: e.target.value, group: e.target.value }));
            }} className={inputClass} />
          </div>
          <div><label className={labelClass}>학년</label><input type="text" name="grade" value={formData.grade || ''} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>나이</label><input type="text" name="age" value={formData.age || ''} onChange={handleChange} className={inputClass} /></div>
          <div>
            <label className={labelClass}>성별</label>
            <select name="gender" value={formData.gender || ''} onChange={handleChange} className={inputClass}>
              <option value="">-</option>
              <option value="남">남</option>
              <option value="여">여</option>
            </select>
          </div>
          <div><label className={labelClass}>연락처</label><input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>부모님</label><input type="text" name="guardianName" value={formData.guardianName || ''} onChange={handleChange} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass}>부모님 연락처</label><input type="text" name="guardianPhone" value={formData.guardianPhone || ''} onChange={handleChange} className={inputClass} /></div>
          <div className="col-span-2"><label className={labelClass}>특이사항</label><textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={inputClass} rows="2"></textarea></div>
        </div>
        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">취소</button>
          <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm">저장</button>
        </div>
      </form>
    </AdminModal>
  );
};

// 이미지 업로드 및 Base64 압축 변환 (localStorage 용량 제한 대비)
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const max_size = 1200; // 최대 너비 또는 높이 제한

      if (width > height) {
        if (width > max_size) {
          height *= max_size / width;
          width = max_size;
        }
      } else {
        if (height > max_size) {
          width *= max_size / height;
          height = max_size;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8)); // 80% 화질로 압축
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const ImageUploadBox = ({ label, images, onChange, multiple }) => {
  const fileInputRef = useRef(null);

  const processFiles = async (files) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const base64Images = await Promise.all(imageFiles.map(fileToBase64));
    
    if (multiple) {
      onChange([...images, ...base64Images]);
    } else {
      onChange([base64Images[0]]);
    }
  };

  const handlePaste = (e) => {
    if (e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(e.clipboardData.files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-bold text-slate-600 mb-2">{label}</label>
      <div 
        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors focus-within:ring-2 focus-within:ring-sky-500 outline-none cursor-pointer"
        onClick={() => fileInputRef.current.click()}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        tabIndex={0}
      >
        <input type="file" multiple={multiple} accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => processFiles(e.target.files)} />
        <div className="text-slate-500 mb-2 flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3"><Plus size={24} /></div>
          <p><span className="font-bold text-sky-500">클릭하여 이미지 업로드</span> 또는 파일 드래그 & 드롭</p>
          <p className="text-xs text-slate-400 mt-1">클립보드 이미지 복사 후 여기에 붙여넣기(Ctrl+V) 지원</p>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-6 justify-center" onClick={e => e.stopPropagation()}>
            {images.map((img, idx) => (
              <div key={idx} className="relative group shadow-sm rounded-xl overflow-hidden border border-slate-200 bg-white">
                <img src={img} alt={`preview-${idx}`} className="h-28 w-auto object-cover" />
                <button type="button" onClick={(e) => { e.stopPropagation(); const newImages = [...images]; newImages.splice(idx, 1); onChange(newImages); }} className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600 shadow-sm"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- [Admin Course Form Component] ---
const AdminCourseForm = ({ isEdit, initialData, onCancel, onSave }) => {
  const [formData, setFormData] = useState(() => {
    const c = initialData || {};
    return {
      id: c.id || `course-${Date.now()}`,
      generationId: c.generationId || currentGeneration.id,
      generationName: c.generationName || currentGeneration.name,
      department: c.department || '문화부',
      name: c.name || '',
      subTitle: c.subTitle || '',
      group: c.group || '유년',
      target: c.target || '',
      capacity: c.capacity || '',
      donation: c.donation || '',
      status: c.status || '신청가능',
      days: c.days || '',
      times: c.times || '',
      location: c.location || '추후 안내',
      supplies: c.supplies || '',
      summary: c.summary || c.intro || '',
      description: c.description || '',
      recommendedFor: (c.recommendedFor || []).join('\n'),
      curriculum: (c.curriculum || []).join('\n'),
      notice: (c.notice || []).join('\n'),
      thumbnail: c.thumbnail || '',
      images: c.images || [],
      eligibleGroup: c.eligibleGroup || (c.group === '유년' ? '유년회' : c.group === '학생' ? '학생회' : '전체'),
      eligibleTargetStart: c.eligibleTargetStart || '',
      eligibleTargetEnd: c.eligibleTargetEnd || '',
      eligibleTargetText: c.eligibleTargetText || '',
    };
  });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTargetChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'eligibleTargetStart' || name === 'eligibleTargetEnd') {
        const start = next.eligibleTargetStart;
        const end = next.eligibleTargetEnd;
        let text = '';
        if (start && end) text = start === end ? start : `${start}~${end}`;
        else if (start) text = start;
        else if (end) text = end;
        
        next.eligibleTargetText = text;
        next.target = text;
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    const startVal = normalizeTargetValue(formData.eligibleTargetStart);
    const endVal = normalizeTargetValue(formData.eligibleTargetEnd);
    
    if (startVal !== null && endVal !== null && startVal > endVal) {
      alert("대상 시작은 대상 종료보다 앞선 단계여야 합니다.");
      setShowConfirm(false);
      return;
    }

    const parsed = {
      ...formData,
      available: formData.status === '신청가능',
      recommendedFor: typeof formData.recommendedFor === 'string' ? formData.recommendedFor.split('\n').map(s=>s.trim()).filter(Boolean) : [],
      curriculum: typeof formData.curriculum === 'string' ? formData.curriculum.split('\n').map(s=>s.trim()).filter(Boolean) : [],
      notice: typeof formData.notice === 'string' ? formData.notice.split('\n').map(s=>s.trim()).filter(Boolean) : [],
      images: Array.isArray(formData.images) ? formData.images : [],
    };
    onSave(parsed);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium mt-1";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1 mt-4";
  const sectionClass = "font-black text-slate-800 mb-4 mt-10 border-b border-slate-200 pb-2 text-lg";

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{isEdit ? "강좌 수정" : "강좌 추가"}</h2>
          <p className="text-slate-500 mt-1">{isEdit ? "등록된 강좌 정보를 수정합니다." : `PHCA ${currentGeneration.name}에 운영할 새 강좌 정보를 입력합니다.`}</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center">
          목록으로 돌아가기
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
        <form onSubmit={handleSubmit}>
          <h4 className={`${sectionClass} mt-0`}>A. 기본 정보</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div><label className={labelClass}>신청기수 (ID)</label><input type="text" name="generationId" value={formData.generationId} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>신청기수명</label><input type="text" name="generationName" value={formData.generationName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>부서</label><input type="text" name="department" value={formData.department} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>회 (그룹)</label>
              <select name="group" value={formData.group} onChange={handleChange} className={inputClass} required>
                <option value="유년">유년</option>
                <option value="학생">학생</option>
              </select>
            </div>
            <div className="sm:col-span-2"><label className={labelClass}>강좌명 *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required /></div>
            <div className="sm:col-span-2"><label className={labelClass}>세부과목</label><input type="text" name="subTitle" value={formData.subTitle} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2">
              <label className={labelClass}>대상</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  name="eligibleTargetStart"
                  value={formData.eligibleTargetStart}
                  onChange={handleTargetChange}
                  className={inputClass}
                  required
                >
                  <option value="">대상 시작 선택</option>
                  <option value="6세">6세</option>
                  <option value="7세">7세</option>
                  <option value="8세">8세</option>
                  <option value="9세">9세</option>
                  <option value="10세">10세</option>
                  <option value="11세">11세</option>
                  <option value="12세">12세</option>
                  <option value="13세">13세</option>
                  <option value="초1">초1</option>
                  <option value="초2">초2</option>
                  <option value="초3">초3</option>
                  <option value="초4">초4</option>
                  <option value="초5">초5</option>
                  <option value="초6">초6</option>
                  <option value="중1">중1</option>
                  <option value="중2">중2</option>
                  <option value="중3">중3</option>
                  <option value="고1">고1</option>
                  <option value="고2">고2</option>
                  <option value="고3">고3</option>
                </select>
                <select
                  name="eligibleTargetEnd"
                  value={formData.eligibleTargetEnd}
                  onChange={handleTargetChange}
                  className={inputClass}
                  required
                >
                  <option value="">대상 종료 선택</option>
                  <option value="6세">6세</option>
                  <option value="7세">7세</option>
                  <option value="8세">8세</option>
                  <option value="9세">9세</option>
                  <option value="10세">10세</option>
                  <option value="11세">11세</option>
                  <option value="12세">12세</option>
                  <option value="13세">13세</option>
                  <option value="초1">초1</option>
                  <option value="초2">초2</option>
                  <option value="초3">초3</option>
                  <option value="초4">초4</option>
                  <option value="초5">초5</option>
                  <option value="초6">초6</option>
                  <option value="중1">중1</option>
                  <option value="중2">중2</option>
                  <option value="중3">중3</option>
                  <option value="고1">고1</option>
                  <option value="고2">고2</option>
                  <option value="고3">고3</option>
                </select>
              </div>
            </div>
            <div><label className={labelClass}>정원</label><input type="text" name="capacity" value={formData.capacity} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>후원금</label><input type="text" name="donation" value={formData.donation} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>신청 상태</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="신청가능">신청가능</option>
                <option value="신청마감">신청마감</option>
                <option value="비노출">비노출</option>
              </select>
            </div>
          </div>
          <h4 className={sectionClass}>B. 운영 정보</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div><label className={labelClass}>교육일</label><input type="text" name="days" value={formData.days} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>교육시간</label><input type="text" name="times" value={formData.times} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>장소</label><input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>준비물</label><input type="text" name="supplies" value={formData.supplies} onChange={handleChange} className={inputClass} /></div>
          </div>
          <h4 className={sectionClass}>C. 강좌 소개</h4>
          <div><label className={labelClass}>한 줄 소개</label><input type="text" name="summary" value={formData.summary} onChange={handleChange} className={inputClass} /></div>
          <div><label className={labelClass}>상세 설명</label><textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={inputClass}></textarea></div>
          <div><label className={labelClass}>추천 대상 (줄바꿈 구분)</label><textarea name="recommendedFor" value={formData.recommendedFor} onChange={handleChange} rows="3" className={inputClass}></textarea></div>
          <div><label className={labelClass}>수업 내용 (줄바꿈 구분)</label><textarea name="curriculum" value={formData.curriculum} onChange={handleChange} rows="4" className={inputClass}></textarea></div>
          <div><label className={labelClass}>유의사항 (줄바꿈 구분)</label><textarea name="notice" value={formData.notice} onChange={handleChange} rows="3" className={inputClass}></textarea></div>
          <h4 className={sectionClass}>D. 이미지 정보</h4>
          <ImageUploadBox 
            label="대표 이미지 (1장)" 
            multiple={false} 
            images={formData.thumbnail ? [formData.thumbnail] : []} 
            onChange={(newImages) => setFormData(prev => ({ ...prev, thumbnail: newImages[0] || '' }))} 
          />
          <ImageUploadBox 
            label="갤러리 이미지 (여러 장 가능)" 
            multiple={true} 
            images={formData.images || []} 
            onChange={(newImages) => setFormData(prev => ({ ...prev, images: newImages }))} 
          />
          <div className="flex justify-end gap-3 pt-8 mt-10 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-8 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">취소</button>
            <button type="submit" className="px-8 py-3.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm">{isEdit ? '수정하기' : '저장하기'}</button>
          </div>
        </form>
      </div>
      {showConfirm && (
        <ConfirmModal
          title={isEdit ? "강좌 수정" : "강좌 추가"}
          message={isEdit ? "강좌 정보를 수정하시겠습니까?" : "새 강좌를 추가하시겠습니까?"}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirm(false)}
          confirmText={isEdit ? "수정하기" : "추가하기"}
        />
      )}
    </div>
  );
};

const AdminCourseCreatePage = ({ navigate }) => {
  const handleSave = (parsedData) => {
    const courses = JSON.parse(localStorage.getItem('phcaCourses')) || MOCK_COURSES;
    const updated = [parsedData, ...courses];
    localStorage.setItem('phcaCourses', JSON.stringify(updated));
    navigate('/admin/courses');
  };
  return <AdminCourseForm isEdit={false} initialData={{}} onCancel={() => navigate('/admin/courses')} onSave={handleSave} />;
};

const AdminCourseEditPage = ({ courseId, navigate }) => {
  const courses = JSON.parse(localStorage.getItem('phcaCourses')) || MOCK_COURSES;
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-10">
        <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">해당 강좌를 찾을 수 없습니다.</h2>
        <p className="text-slate-500 mb-8 font-medium">강좌가 삭제되었거나 잘못된 접근입니다.</p>
        <button onClick={() => navigate('/admin/courses')} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-sm">강좌 목록으로 돌아가기</button>
      </div>
    );
  }

  const handleSave = (parsedData) => {
    const updated = courses.map(c => c.id === parsedData.id ? parsedData : c);
    localStorage.setItem('phcaCourses', JSON.stringify(updated));
    navigate('/admin/courses');
  };

  return <AdminCourseForm isEdit={true} initialData={course} onCancel={() => navigate('/admin/courses')} onSave={handleSave} />;
};

const AdminDashboardPage = () => {
  const apps = JSON.parse(localStorage.getItem('phcaApplications') || '[]');
  const courses = JSON.parse(localStorage.getItem('phcaCourses') || '[]');
  const notices = JSON.parse(localStorage.getItem('phcaNotices') || '[]');
  const faqs = JSON.parse(localStorage.getItem('phcaFaqs') || '[]');

  return (
    <div className="animate-fadeIn space-y-6">
      <h2 className="text-2xl font-black text-slate-800 mb-6">운영 현황 요약</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AdminStatCard title="전체 신청" value={apps.length} colorClass="text-slate-800" />
        <AdminStatCard title="접수 완료" value={apps.filter(a=>a.status==='접수 완료').length} colorClass="text-blue-500" />
        <AdminStatCard title="배정 완료" value={apps.filter(a=>a.status==='배정 완료').length} colorClass="text-emerald-500" />
        <AdminStatCard title="확인 중" value={apps.filter(a=>a.status==='확인 중').length} colorClass="text-amber-500" />
        <AdminStatCard title="전체 강좌" value={courses.length} colorClass="text-slate-800" />
        <AdminStatCard title="신청 가능 강좌" value={courses.filter(c=>c.available).length} colorClass="text-sky-500" />
        <AdminStatCard title="등록된 공지" value={notices.length} colorClass="text-slate-800" />
        <AdminStatCard title="등록된 FAQ" value={faqs.length} colorClass="text-slate-800" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4">최근 신청내역</h3>
          <div className="space-y-3">
            {apps.slice(-5).reverse().map((app, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="text-sm"><span className="font-bold">{app.applicantName}</span> <span className="text-slate-500">({app.courseName})</span></div>
                <StatusBadge status={app.status} />
              </div>
            ))}
            {apps.length === 0 && <p className="text-slate-500 text-sm">신청 내역이 없습니다.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-black text-slate-800 mb-4">최근 공지사항</h3>
          <div className="space-y-3">
            {notices.slice(0,5).map((n, i) => (
              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm font-bold text-slate-700 truncate">
                {n.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminApplicationsPage = () => {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  
  const [filterGen, setFilterGen] = useState('전체');
  const [filterDept, setFilterDept] = useState('전체');
  const [filterCourse, setFilterCourse] = useState('전체');
  const [filterGroup, setFilterGroup] = useState('전체');
  const [filterGrade, setFilterGrade] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [editApp, setEditApp] = useState(null);
  const [pendingSaveApp, setPendingSaveApp] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    // 신청 데이터는 사용자 폼에서 phca_applications로 저장됨
    setApps(JSON.parse(localStorage.getItem('phca_applications') || '[]'));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterGen, filterDept, filterCourse, filterGroup, filterGrade, filterStatus]);

  // 필터링 및 검색 로직
  const filtered = apps.filter(app => {
    const matchSearch = !search || 
      app.applicantName?.includes(search) || 
      app.courseName?.includes(search) || 
      app.courseDepartment?.includes(search) || 
      app.phone?.includes(search) || 
      app.guardianName?.includes(search) || 
      app.guardianPhone?.includes(search) || 
      app.notes?.includes(search);

    const matchGen = filterGen === '전체' || app.generationName === filterGen;
    const matchDept = filterDept === '전체' || app.courseDepartment === filterDept;
    const matchCourse = filterCourse === '전체' || app.courseName === filterCourse;
    
    // "유년회" -> "유년", "학생회" -> "학생" 변환 매칭
    const appGroup = app.courseGroup ? app.courseGroup.replace('회', '') : (app.group ? app.group.replace('회', '') : '');
    const matchGroup = filterGroup === '전체' || appGroup === filterGroup;
    const matchGrade = filterGrade === '전체' || app.grade === filterGrade;
    const matchStatus = filterStatus === '전체' || app.status === filterStatus;

    return matchSearch && matchGen && matchDept && matchCourse && matchGroup && matchGrade && matchStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const totalApps = apps.length;
  const youthApps = apps.filter(a => a.courseGroup?.includes('유년') || a.group?.includes('유년')).length;
  const studentApps = apps.filter(a => a.courseGroup?.includes('학생') || a.group?.includes('학생')).length;
  const completedApps = apps.filter(a => a.status === '접수 완료').length;
  const assignedApps = apps.filter(a => a.status === '배정 완료').length;

  // 동적 필터 옵션
  const genOptions = ['전체', ...new Set(apps.map(a => a.generationName).filter(Boolean))];
  const deptOptions = ['전체', ...new Set(apps.map(a => a.courseDepartment).filter(Boolean))];
  const courseOptions = ['전체', ...new Set(apps.map(a => a.courseName).filter(Boolean))];
  const groupOptions = ['전체', '유년', '학생'];
  const gradeOptions = ['전체', ...new Set(apps.map(a => a.grade).filter(Boolean))];
  const statusOptions = ['전체', '접수 완료', '확인 중', '배정 완료', '대기', '반려'];

  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handleEditClick = (app) => setEditApp(app);
  const handleEditSaveRequest = (updatedApp) => setPendingSaveApp(updatedApp);
  const confirmEdit = () => {
    if (!pendingSaveApp) return;
    const updatedApps = apps.map(app => app.id === pendingSaveApp.id ? pendingSaveApp : app);
    setApps(updatedApps);
    localStorage.setItem('phca_applications', JSON.stringify(updatedApps));
    setEditApp(null);
    setPendingSaveApp(null);
    alert('수정이 완료되었습니다.');
  };
  const cancelEditConfirm = () => setPendingSaveApp(null);
  const cancelEdit = () => setEditApp(null);

  const handleDeleteClick = (app) => setDeleteTarget(app);
  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updatedApps = apps.filter(app => app.id !== deleteTarget.id);
    setApps(updatedApps);
    localStorage.setItem('phca_applications', JSON.stringify(updatedApps));
    setDeleteTarget(null);
  };
  const cancelDelete = () => setDeleteTarget(null);

  // 엑셀 다운로드 (화면에 필터링된 결과 기준)
  const handleExcelDownload = () => {
    if (filtered.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const formatData = (item, index) => ({
      번호: index + 1,
      신청기수: item.generationName || '4기',
      이름: item.applicantName,
      신청부서: item.courseDepartment,
      강좌명: item.courseName,
      회: item.courseGroup ? item.courseGroup.replace('회', '') : (item.group ? item.group.replace('회', '') : ''),
      학년: item.grade,
      나이: item.age,
      성별: item.gender || "-",
      연락처: item.phone,
      부모님: item.guardianName,
      부모님연락처: item.guardianPhone,
      특이사항: item.notes || '',
    });

    downloadExcelByDepartment(filtered, formatData, "PHCA_부서별_신청자명단", "courseDepartment");
  };

  const selectClass = "w-full p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium";

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">PHCA 신청관리</h2>
        <p className="text-slate-500 mt-1">PHCA 4기 신청자 현황을 확인하고 관리합니다.</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard title="전체 신청자 수" value={totalApps} colorClass="text-slate-800" />
        <AdminStatCard title="유년 신청자 수" value={youthApps} colorClass="text-amber-500" />
        <AdminStatCard title="학생 신청자 수" value={studentApps} colorClass="text-indigo-500" />
        <AdminStatCard title="접수 완료 수" value={completedApps} colorClass="text-blue-500" />
        <AdminStatCard title="배정 완료 수" value={assignedApps} colorClass="text-emerald-500" />
      </div>

      {/* 검색 및 필터 영역 */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">신청기수</label>
            <select value={filterGen} onChange={e=>setFilterGen(e.target.value)} className={selectClass}>
              {genOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">신청부서</label>
            <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className={selectClass}>
              {deptOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">강좌명</label>
            <select value={filterCourse} onChange={e=>setFilterCourse(e.target.value)} className={selectClass}>
              {courseOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">회</label>
            <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} className={selectClass}>
              {groupOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">학년</label>
            <select value={filterGrade} onChange={e=>setFilterGrade(e.target.value)} className={selectClass}>
              {gradeOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">상태</label>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className={selectClass}>
              {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
          <div className="relative w-full sm:w-96">
            <input 
              type="text" 
              placeholder="이름, 강좌, 부서, 연락처, 부모님 검색" 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition-all font-medium" 
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <button onClick={handleExcelDownload} className="w-full sm:w-auto bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center shadow-sm hover:bg-emerald-600 transition-colors">
            <Download size={18} className="mr-2"/> 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-max">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs">
            <tr>
              <th className="p-4">신청기수</th>
              <th className="p-4">이름</th>
              <th className="p-4">신청부서</th>
              <th className="p-4">강좌명</th>
              <th className="p-4">회</th>
              <th className="p-4">학년</th>
              <th className="p-4">나이</th>
              <th className="p-4">성별</th>
              <th className="p-4">연락처</th>
              <th className="p-4">부모님</th>
              <th className="p-4">부모님 연락처</th>
              <th className="p-4">특이사항</th>
              <th className="p-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {paginated.map(app => (
              <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500">{app.generationName || '4기'}</td>
                <td className="p-4 font-black text-slate-900">{app.applicantName}</td>
                <td className="p-4">{app.courseDepartment}</td>
                <td className="p-4 font-bold text-sky-600">{app.courseName}</td>
                <td className="p-4">{app.courseGroup ? app.courseGroup.replace('회', '') : (app.group ? app.group.replace('회', '') : '')}</td>
                <td className="p-4">{app.grade}</td>
                <td className="p-4">{app.age}</td>
                <td className="p-4">{app.gender || '-'}</td>
                <td className="p-4">{app.phone}</td>
                <td className="p-4">{app.guardianName}</td>
                <td className="p-4">{app.guardianPhone}</td>
                <td className="p-4 truncate max-w-[150px]" title={app.notes}>{app.notes}</td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEditClick(app)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors" title="수정"><Edit2 size={16}/></button>
                  <button onClick={() => handleDeleteClick(app)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="삭제"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="12" className="p-8 text-center text-slate-500 font-bold">
                  조건에 맞는 신청 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4">
        <div className="text-sm font-medium text-slate-500">
          총 {totalItems}명 중 {totalItems > 0 ? startItem : 0}~{endItem}명 표시
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-4 py-2 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">이전</button>
          <span className="text-sm font-bold text-slate-700">{currentPage} / {totalPages} 페이지</span>
          <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">다음</button>
        </div>
      </div>

      {editApp && (
        <ApplicationEditModal app={editApp} onCancel={cancelEdit} onSave={handleEditSaveRequest} />
      )}
      {pendingSaveApp && (
        <ConfirmModal 
          title="수정 확인" 
          message="신청자 정보를 수정하시겠습니까?" 
          onConfirm={confirmEdit} 
          onCancel={cancelEditConfirm} 
          confirmText="수정하기"
        />
      )}
      {deleteTarget && (
        <ConfirmModal 
          title="신청자 삭제" 
          message="해당 신청자 정보를 삭제하시겠습니까? 삭제한 데이터는 복구할 수 없습니다."
          targetInfo={{ name: deleteTarget.applicantName, course: deleteTarget.courseName, phone: deleteTarget.phone }}
          onConfirm={confirmDelete} 
          onCancel={cancelDelete} 
          confirmText="삭제하기"
          confirmClass="bg-rose-500 hover:bg-rose-600"
        />
      )}
    </div>
  );
};

const AdminCoursesPage = ({ navigate }) => {
  const [courses, setCourses] = useState([]);
  const [apps, setApps] = useState([]);

  const [search, setSearch] = useState('');
  const [filterGen, setFilterGen] = useState('전체');
  const [filterDept, setFilterDept] = useState('전체');
  const [filterGroup, setFilterGroup] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setCourses(JSON.parse(localStorage.getItem('phcaCourses')) || MOCK_COURSES);
    setApps(JSON.parse(localStorage.getItem('phca_applications') || '[]'));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterGen, filterDept, filterGroup, filterStatus]);

  const filtered = courses.filter(course => {
    const matchSearch = !search || 
      course.name?.includes(search) || 
      course.department?.includes(search) || 
      course.target?.includes(search) || 
      course.days?.includes(search) || 
      course.times?.includes(search);

    const matchGen = filterGen === '전체' || course.generationName === filterGen || course.generationId === filterGen;
    const matchDept = filterDept === '전체' || course.department === filterDept;
    const matchGroup = filterGroup === '전체' || course.group === filterGroup;
    const matchStatus = filterStatus === '전체' || course.status === filterStatus;

    return matchSearch && matchGen && matchDept && matchGroup && matchStatus;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const genOptions = ['전체', ...new Set(courses.map(c => c.generationName || c.generationId).filter(Boolean))];
  const deptOptions = ['전체', ...new Set(courses.map(c => c.department).filter(Boolean))];
  const groupOptions = ['전체', ...new Set(courses.map(c => c.group).filter(Boolean))];
  const statusOptions = ['전체', '신청가능', '신청마감', '비노출'];

  const handleDeleteClick = (course) => {
    const applicantsCount = apps.filter(a => a.courseId === course.id).length;
    setDeleteTarget({ ...course, applicantsCount });
  };

  const handleDeleteConfirm = () => {
    const updated = courses.filter(c => c.id !== deleteTarget.id);
    setCourses(updated);
    localStorage.setItem('phcaCourses', JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleCourseExcelDownload = () => {
    if (filtered.length === 0) {
      alert("다운로드할 강좌 데이터가 없습니다.");
      return;
    }

    const formatData = (course, index) => ({
      번호: index + 1,
      신청기수: course.generationName || course.generationLabel || "4기",
      부서: course.department || "",
      강좌명: course.name || "",
      세부과목: course.subTitle || "",
      회: course.group || "",
      대상: course.target || "",
      교육일: course.days || "",
      교육시간: course.times || "",
      장소: course.location || "",
      정원: course.capacity || "",
      준비물: course.supplies || "",
      후원금: course.donation || "",
      상태: course.status || (course.available ? "신청가능" : "신청마감"),
      "한 줄 소개": course.summary || "",
      "상세 설명": course.description || "",
      "추천 대상": Array.isArray(course.recommendedFor) ? course.recommendedFor.join("\n") : course.recommendedFor || "",
      "수업 내용": Array.isArray(course.curriculum) ? course.curriculum.join("\n") : course.curriculum || "",
      유의사항: Array.isArray(course.notice) ? course.notice.join("\n") : course.notice || "",
      "대표 이미지": course.thumbnail || "",
      "갤러리 이미지": Array.isArray(course.images) ? course.images.join("\n") : course.images || "",
    });

    downloadExcelByDepartment(filtered, formatData, "PHCA_부서별_강좌목록", "department");
  };

  const selectClass = "w-full p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-medium";

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">강좌 관리</h2>
          <p className="text-slate-500 mt-1">PHCA 강좌 정보를 등록하고 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleCourseExcelDownload} className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-emerald-600 transition-colors">
            <Download size={18} className="mr-2" /> 엑셀 다운로드
          </button>
          <button onClick={() => navigate('/admin/courses/new')} className="bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-sky-600 transition-colors">
            <Plus size={18} className="mr-2"/> 강좌 추가
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">신청기수</label>
            <select value={filterGen} onChange={e=>setFilterGen(e.target.value)} className={selectClass}>
              {genOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">부서</label>
            <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className={selectClass}>
              {deptOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">회</label>
            <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} className={selectClass}>
              {groupOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">상태</label>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className={selectClass}>
              {statusOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-100">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="강좌명, 부서, 대상, 교육일, 교육시간 검색" 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500 transition-all font-medium" 
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">부서</th>
              <th className="p-4">강좌명</th>
              <th className="p-4">대상</th>
              <th className="p-4">정원</th>
              <th className="p-4">상태</th>
              <th className="p-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {paginated.map(course => (
              <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">{course.department}</td>
                <td className="p-4 font-bold text-slate-900">{course.name}</td>
                <td className="p-4">{course.group} / {course.target}</td>
                <td className="p-4">{course.capacity}</td>
                <td className="p-4"><StatusBadge status={course.status} /></td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => navigate(`/admin/courses/${course.id}/edit`)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => handleDeleteClick(course)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 font-bold">조건에 맞는 강좌가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mt-4">
        <div className="text-sm font-medium text-slate-500">
          총 {totalItems}개 중 {totalItems > 0 ? startItem : 0}~{endItem}개 표시
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">이전</button>
          <span className="text-sm font-bold text-slate-700">{currentPage} / {totalPages} 페이지</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">다음</button>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="강좌 삭제"
          message={deleteTarget.applicantsCount > 0 ? `이 강좌에 신청자가 ${deleteTarget.applicantsCount}명 있습니다. 삭제 시 신청관리 데이터와 연결이 끊길 수 있습니다.\n\n해당 강좌를 삭제하시겠습니까? 삭제한 강좌는 복구할 수 없습니다.` : `해당 강좌를 삭제하시겠습니까? 삭제한 강좌는 복구할 수 없습니다.`}
          targetInfo={{ name: deleteTarget.name, course: deleteTarget.department, phone: `${deleteTarget.group} / ${deleteTarget.target}` }}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="삭제하기"
          confirmClass="bg-rose-500 hover:bg-rose-600"
        />
      )}
    </div>
  );
};

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const today = new Date().toISOString().slice(0, 10);
  const initialFormState = { title: '', category: '필수', date: today, content: '' };
  
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  
  useEffect(() => {
    setNotices(JSON.parse(localStorage.getItem('phcaNotices')) || []);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    let updatedNotices;
    if (isEditing) {
      updatedNotices = notices.map(n => n.id === formData.id ? { ...n, ...formData } : n);
    } else {
      const newNotice = {
        ...formData,
        id: `notice-${Date.now()}`,
        generationId: currentGeneration.id,
        generationLabel: currentGeneration.name,
      };
      updatedNotices = [newNotice, ...notices];
    }

    setNotices(updatedNotices);
    localStorage.setItem('phcaNotices', JSON.stringify(updatedNotices));
    handleReset();
  };

  const handleEdit = (notice) => {
    setFormData(notice);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    const updated = notices.filter(n => n.id !== deleteTarget.id);
    setNotices(updated);
    localStorage.setItem('phcaNotices', JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1 mt-4";

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">공지사항 관리</h2>
        <p className="text-slate-500 mt-1">공지사항을 등록하고 관리합니다.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div className="sm:col-span-2">
              <label className={labelClass} style={{marginTop: 0}}>제목</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className={inputClass} required placeholder="공지사항 제목을 입력하세요" />
            </div>
            <div>
              <label className={labelClass}>구분</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value="필수">필수</option>
                <option value="모집">모집</option>
                <option value="강좌">강좌</option>
                <option value="운영">운영</option>
                <option value="안내">안내</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>등록일</label>
              <input type="text" name="date" value={formData.date} onChange={handleChange} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>내용</label>
            <textarea name="content" value={formData.content} onChange={handleChange} rows="5" className={inputClass} required placeholder="공지사항 내용을 입력하세요"></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button type="button" onClick={handleReset} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">초기화</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm">{isEditing ? '공지 수정' : '공지 등록'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4 w-24">구분</th>
              <th className="p-4 w-full">제목</th>
              <th className="p-4 w-32">등록일</th>
              <th className="p-4 text-center w-24">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {notices.map(notice => (
              <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  {notice.category === '필수' ? (
                    <span className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-xs font-bold">필수</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{notice.category}</span>
                  )}
                </td>
                <td className="p-4 font-bold text-slate-900 truncate max-w-xs sm:max-w-md cursor-pointer hover:text-sky-600" onClick={() => handleEdit(notice)}>{notice.title}</td>
                <td className="p-4">{notice.date}</td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEdit(notice)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors" title="수정"><Edit2 size={16}/></button>
                  <button onClick={() => setDeleteTarget(notice)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {notices.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500 font-bold">등록된 공지사항이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="공지 삭제"
          message="해당 공지사항을 삭제하시겠습니까?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="삭제하기"
          confirmClass="bg-rose-500 hover:bg-rose-600"
        />
      )}
    </div>
  );
};

const AdminFaqsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const initialFormState = { category: '신청', question: '', answer: '' };
  
  const [formData, setFormData] = useState(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  
  useEffect(() => {
    setFaqs(JSON.parse(localStorage.getItem('phcaFaqs')) || []);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      alert('질문과 답변을 입력해주세요.');
      return;
    }

    let updatedFaqs;
    if (isEditing) {
      updatedFaqs = faqs.map(f => f.id === formData.id ? { ...f, ...formData } : f);
    } else {
      const newFaq = {
        ...formData,
        id: `faq-${Date.now()}`,
        generationId: currentGeneration.id,
        generationLabel: currentGeneration.name,
      };
      updatedFaqs = [newFaq, ...faqs];
    }

    setFaqs(updatedFaqs);
    localStorage.setItem('phcaFaqs', JSON.stringify(updatedFaqs));
    handleReset();
  };

  const handleEdit = (faq) => {
    setFormData(faq);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    const updated = faqs.filter(f => f.id !== deleteTarget.id);
    setFaqs(updated);
    localStorage.setItem('phcaFaqs', JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1 mt-4";

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-800">FAQ 관리</h2>
        <p className="text-slate-500 mt-1">자주 묻는 질문을 등록하고 관리합니다.</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-x-4 gap-y-2">
            <div className="sm:col-span-1">
              <label className={labelClass} style={{marginTop: 0}}>구분</label>
              <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                <option value="신청">신청</option>
                <option value="강좌">강좌</option>
                <option value="후원금">후원금</option>
                <option value="운영">운영</option>
                <option value="계정">계정</option>
                <option value="문의">문의</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className={labelClass} style={{marginTop: 0}}>질문</label>
              <input type="text" name="question" value={formData.question} onChange={handleChange} className={inputClass} required placeholder="질문을 입력하세요" />
            </div>
          </div>
          <div>
            <label className={labelClass}>답변</label>
            <textarea name="answer" value={formData.answer} onChange={handleChange} rows="5" className={inputClass} required placeholder="답변을 입력하세요"></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-100">
            <button type="button" onClick={handleReset} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">초기화</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm">{isEditing ? 'FAQ 수정' : 'FAQ 등록'}</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4 w-24">구분</th>
              <th className="p-4 w-full">질문</th>
              <th className="p-4 text-center w-24">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {faqs.map(faq => (
              <tr key={faq.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">{faq.category}</span></td>
                <td className="p-4 font-bold text-slate-900 truncate max-w-xs sm:max-w-md cursor-pointer hover:text-sky-600" onClick={() => handleEdit(faq)}>{faq.question}</td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => handleEdit(faq)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors" title="수정"><Edit2 size={16}/></button>
                  <button onClick={() => setDeleteTarget(faq)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500 font-bold">등록된 FAQ가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="FAQ 삭제"
          message="해당 FAQ를 삭제하시겠습니까?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="삭제하기"
          confirmClass="bg-rose-500 hover:bg-rose-600"
        />
      )}
    </div>
  );
};

const AdminAdvancedParticipantPage = ({ advancedId, navigate }) => {
  const classes = JSON.parse(localStorage.getItem('phcaAdvancedClasses')) || [];
  const targetClass = classes.find(c => c.id === advancedId);

  if (!targetClass) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-10">
        <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">해당 심화반을 찾을 수 없습니다.</h2>
        <p className="text-slate-500 mb-8 font-medium">정보가 삭제되었거나 잘못된 접근입니다.</p>
        <button onClick={() => navigate('/admin/advanced')} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-sm">목록으로 돌아가기</button>
      </div>
    );
  }

  const [participants, setParticipants] = useState(targetClass.participants || []);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const initialFormState = {
    id: '', name: '', group: '', grade: '', age: '', gender: '',
    phone: '', guardianName: '', guardianPhone: '', originalCourseName: '',
    status: '참여중', memo: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone' || name === 'guardianPhone') {
      const formatted = formatPhone(value);
      setFormData(prev => {
        const next = { ...prev, [name]: formatted };
        
        // 연락처(phone) 13자리(010-0000-0000) 입력 시 자동완성 로직 수행 (추가 모드일 때만)
        if (name === 'phone' && formatted.length === 13 && !isEditing) {
          const apps = JSON.parse(localStorage.getItem('phca_applications') || '[]');
          const users = JSON.parse(localStorage.getItem('phca_users') || '[]');
          
          // 1. 기존 신청 내역 우선 검색 (보호자 정보, 기존 강좌 등 상세 정보 포함)
          const foundApp = apps.slice().reverse().find(a => a.phone === formatted);
          if (foundApp) {
            return {
              ...next,
              name: next.name || foundApp.applicantName || '',
              group: next.group || (foundApp.courseGroup ? foundApp.courseGroup.replace('회', '') : (foundApp.group ? foundApp.group.replace('회', '') : '')),
              grade: next.grade || foundApp.grade || '',
              age: next.age || foundApp.age || '',
              gender: next.gender || foundApp.gender || '',
              guardianName: next.guardianName || foundApp.guardianName || '',
              guardianPhone: next.guardianPhone || foundApp.guardianPhone || '',
              originalCourseName: next.originalCourseName || foundApp.courseName || ''
            };
          }
          
          // 2. 신청 내역이 없다면 단순 회원가입 정보 검색
          const foundUser = users.slice().reverse().find(u => u.phone === formatted);
          if (foundUser) {
            return {
              ...next,
              name: next.name || foundUser.name || '',
              group: next.group || (foundUser.department ? foundUser.department.replace('회', '') : ''),
              grade: next.grade || foundUser.grade || '',
              age: next.age || foundUser.age || '',
              gender: next.gender || foundUser.gender || ''
            };
          }
        }
        return next;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const saveToStorage = (updatedParticipants) => {
    const updatedClass = { ...targetClass, participants: updatedParticipants };
    const updatedClasses = classes.map(c => c.id === targetClass.id ? updatedClass : c);
    localStorage.setItem('phcaAdvancedClasses', JSON.stringify(updatedClasses));
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    let updated;
    if (isEditing) {
      updated = participants.map(p => p.id === formData.id ? formData : p);
    } else {
      updated = [...participants, { ...formData, id: `p-${Date.now()}` }];
    }
    setParticipants(updated);
    saveToStorage(updated);
    setShowForm(false);
    setIsEditing(false);
    setFormData(initialFormState);
  };

  const handleEdit = (p) => {
    setFormData(p);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteConfirm = () => {
    const updated = participants.filter(p => p.id !== deleteTarget.id);
    setParticipants(updated);
    saveToStorage(updated);
    setDeleteTarget(null);
  };

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">[{targetClass.className}] 참여자 명단</h2>
          <p className="text-slate-500 mt-1">해당 심화반의 참여자를 관리합니다.</p>
        </div>
        <button onClick={() => navigate('/admin/advanced')} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center">
          목록으로 돌아가기
        </button>
      </div>

      <div className="space-y-6">
        {!showForm && (
          <div className="flex justify-end">
            <button onClick={() => { setFormData(initialFormState); setIsEditing(false); setShowForm(true); }} className="bg-sky-500 text-white px-4 py-2 rounded-xl font-bold flex items-center shadow-sm hover:bg-sky-600 transition-colors text-sm">
              <Plus size={16} className="mr-1" /> 참여자 추가
            </button>
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-black text-slate-800 mb-4">{isEditing ? '참여자 수정' : '참여자 추가'}</h4>
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs font-black text-sky-600 mb-1">연락처 (자동완성)</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 bg-sky-50/50 border border-sky-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all" placeholder="010-0000-0000" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">이름</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" required /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">회</label><input type="text" name="group" value={formData.group} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">학년</label><input type="text" name="grade" value={formData.grade} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">나이</label><input type="text" name="age" value={formData.age} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">성별</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm">
                    <option value="">-</option>
                    <option value="남">남</option>
                    <option value="여">여</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">보호자</label><input type="text" name="guardianName" value={formData.guardianName} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">보호자 연락처</label><input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">기존 신청 강좌</label><input type="text" name="originalCourseName" value={formData.originalCourseName} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">상태</label>
                  <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm">
                    <option value="참여중">참여중</option>
                    <option value="수료">수료</option>
                    <option value="중단">중단</option>
                    <option value="보류">보류</option>
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-4"><label className="block text-xs font-bold text-slate-600 mb-1">메모</label><input type="text" name="memo" value={formData.memo} onChange={handleChange} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm" /></div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setShowForm(false); setIsEditing(false); }} className="px-4 py-2 rounded-lg font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 text-sm transition-colors">취소</button>
                <button type="submit" className="px-4 py-2 rounded-lg font-bold bg-sky-500 text-white hover:bg-sky-600 text-sm transition-colors shadow-sm">저장</button>
              </div>
            </form>
          </div>
        )}

        <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-xs">
              <tr>
                <th className="p-3">번호</th>
                <th className="p-3">이름</th>
                <th className="p-3">회</th>
                <th className="p-3">학년</th>
                <th className="p-3">나이</th>
                <th className="p-3">성별</th>
                <th className="p-3">연락처</th>
                <th className="p-3">보호자</th>
                <th className="p-3">보호자 연락처</th>
                <th className="p-3">기존 신청 강좌</th>
                <th className="p-3">상태</th>
                <th className="p-3">메모</th>
                <th className="p-3 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {participants.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-bold text-slate-900">{p.name}</td>
                  <td className="p-3">{p.group}</td>
                  <td className="p-3">{p.grade}</td>
                  <td className="p-3">{p.age}</td>
                  <td className="p-3">{p.gender}</td>
                  <td className="p-3">{p.phone}</td>
                  <td className="p-3">{p.guardianName}</td>
                  <td className="p-3">{p.guardianPhone}</td>
                  <td className="p-3">{p.originalCourseName}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                      p.status === '참여중' ? 'bg-sky-100 text-sky-700' :
                      p.status === '수료' ? 'bg-emerald-100 text-emerald-700' :
                      p.status === '중단' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-3 truncate max-w-[100px]" title={p.memo}>{p.memo}</td>
                  <td className="p-3 text-center flex justify-center gap-1">
                    <button onClick={() => handleEdit(p)} className="text-sky-600 hover:bg-sky-50 p-1.5 rounded transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => setDeleteTarget(p)} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr>
                  <td colSpan="13" className="p-6 text-center text-slate-500 font-bold">등록된 참여자가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="참여자 삭제"
          message="해당 참여자를 심화반 명단에서 삭제하시겠습니까?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="삭제하기"
          confirmClass="bg-rose-500 hover:bg-rose-600"
        />
      )}
    </div>
  );
};

const AdminAdvancedPage = ({ navigate }) => {
  const [classes, setClasses] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterDept, setFilterDept] = useState('전체');
  const selectedGenId = getSelectedGenerationId();

  useEffect(() => {
    setClasses(JSON.parse(localStorage.getItem('phcaAdvancedClasses')) || []);
  }, []);

  const genFiltered = classes.filter(c => c.generationId === selectedGenId);
  const filtered = genFiltered.filter(c => filterDept === '전체' || c.department === filterDept);

  const totalClasses = genFiltered.length;
  const activeClasses = genFiltered.filter(c => c.status === '운영중').length;
  const endedClasses = genFiltered.filter(c => c.status === '종료').length;
  const totalParticipants = genFiltered.reduce((sum, item) => sum + (item.participants?.length || 0), 0);
  const deptCount = new Set(genFiltered.map(c => c.department).filter(Boolean)).size;

  const deptOptions = ['전체', ...new Set(genFiltered.map(c => c.department).filter(Boolean))];

  const handleDeleteConfirm = () => {
    const updated = classes.filter(c => c.id !== deleteTarget.id);
    setClasses(updated);
    localStorage.setItem('phcaAdvancedClasses', JSON.stringify(updated));
    setDeleteTarget(null);
  };

  const handleAdvancedExcelDownload = () => {
    if (filtered.length === 0) {
      alert("다운로드할 데이터가 없습니다.");
      return;
    }

    const flatData = [];
    filtered.forEach(cls => {
      const parts = cls.participants || [];
      if (parts.length === 0) {
        flatData.push({
          기수: cls.generationLabel || '',
          부서: cls.department || '',
          과: cls.section || '',
          심화반명: cls.className || '',
          담당자: cls.instructor || '',
          '담당자 연락처': cls.contact || '',
          회: cls.group || '',
          대상: cls.target || '',
          일정: cls.schedule || '',
          장소: cls.location || '',
          참여자명: '',
          학년: '',
          나이: '',
          성별: '',
          연락처: '',
          보호자: '',
          '보호자 연락처': '',
          '기존 신청 강좌': '',
          '참여 상태': '',
          메모: ''
        });
      } else {
        parts.forEach(p => {
          flatData.push({
            기수: cls.generationLabel || '',
            부서: cls.department || '',
            과: cls.section || '',
            심화반명: cls.className || '',
            담당자: cls.instructor || '',
            '담당자 연락처': cls.contact || '',
            회: cls.group || '',
            대상: cls.target || '',
            일정: cls.schedule || '',
            장소: cls.location || '',
            참여자명: p.name || '',
            학년: p.grade || '',
            나이: p.age || '',
            성별: p.gender || '',
            연락처: p.phone || '',
            보호자: p.guardianName || '',
            '보호자 연락처': p.guardianPhone || '',
            '기존 신청 강좌': p.originalCourseName || '',
            '참여 상태': p.status || '',
            메모: p.memo || ''
          });
        });
      }
    });

    const formatData = (item, index) => ({
      번호: index + 1,
      ...item
    });

    downloadExcelByDepartment(flatData, formatData, "PHCA_부서별_심화반_참여자명단", "부서");
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">심화반 관리</h2>
          <p className="text-slate-500 mt-1">PHCA 본 과정 이후 운영되는 심화반을 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAdvancedExcelDownload} className="bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-emerald-600 transition-colors">
            <Download size={18} className="mr-2" /> 엑셀 다운로드
          </button>
          <button onClick={() => navigate('/admin/advanced/new')} className="bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-sky-600 transition-colors">
            <Plus size={18} className="mr-2"/> 심화반 추가
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <AdminStatCard title="전체 심화반 수" value={totalClasses} colorClass="text-slate-800" />
        <AdminStatCard title="운영중 심화반 수" value={activeClasses} colorClass="text-blue-500" />
        <AdminStatCard title="종료 심화반 수" value={endedClasses} colorClass="text-rose-500" />
        <AdminStatCard title="총 참여 인원" value={`${totalParticipants}명`} colorClass="text-emerald-500" />
        <AdminStatCard title="부서 수" value={`${deptCount}개`} colorClass="text-amber-500" />
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label className="text-sm font-bold text-slate-500 whitespace-nowrap">부서 필터</label>
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className="w-full sm:w-48 p-2.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm font-bold">
          {deptOptions.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">기수</th>
              <th className="p-4">부서</th>
              <th className="p-4">과</th>
              <th className="p-4">심화반명</th>
              <th className="p-4">담당자</th>
              <th className="p-4">연락처</th>
              <th className="p-4">회</th>
              <th className="p-4">대상</th>
              <th className="p-4">일정</th>
              <th className="p-4">장소</th>
              <th className="p-4">참여 인원</th>
              <th className="p-4">상태</th>
              <th className="p-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filtered.map(cls => (
              <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-500">{cls.generationLabel}</td>
                <td className="p-4">{cls.department}</td>
                <td className="p-4">{cls.section}</td>
                <td className="p-4 font-bold text-slate-900">{cls.className}</td>
                <td className="p-4 text-sky-600">{cls.instructor}</td>
                <td className="p-4">{cls.contact}</td>
                <td className="p-4">{cls.group}</td>
                <td className="p-4">{cls.target}</td>
                <td className="p-4">{cls.schedule}</td>
                <td className="p-4">{cls.location}</td>
                <td className="p-4"><span className="font-bold text-sky-600">{cls.participants?.length || 0}명</span></td>
                <td className="p-4"><StatusBadge status={cls.status} /></td>
                <td className="p-4 text-center flex justify-center gap-2 items-center">
                  <button onClick={() => navigate(`/admin/advanced/${cls.id}/participants`)} className="bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-slate-200">참여자 보기</button>
                  <button onClick={() => navigate(`/admin/advanced/${cls.id}/edit`)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => setDeleteTarget(cls)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="13" className="p-8 text-center text-slate-500 font-bold">등록된 심화반이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <ConfirmModal
          title="심화반 삭제"
          message="해당 심화반 정보를 삭제하시겠습니까?"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          confirmText="삭제하기"
          confirmClass="bg-rose-500 hover:bg-rose-600"
        />
      )}
    </div>
  );
};

const AdminAdvancedForm = ({ isEdit, initialData, onCancel, onSave }) => {
  const gens = getGenerations();
  const selectedGenId = getSelectedGenerationId();
  const defaultGen = gens.find(g => g.id === selectedGenId) || gens[0];

  const [formData, setFormData] = useState(() => {
    const c = initialData || {};
    return {
      id: c.id || `advanced-${Date.now()}`,
      generationId: c.generationId || defaultGen.id,
      generationLabel: c.generationLabel || defaultGen.label,
      generationName: c.generationName || defaultGen.name,
      department: c.department || '',
      section: c.section || '',
      className: c.className || '',
      group: c.group || '',
      target: c.target || '',
      instructor: c.instructor || c.relatedCourseName || '',
      contact: c.contact || '',
      schedule: c.schedule || '',
      location: c.location || '',
      status: c.status || '운영예정',
      startDate: c.startDate || '',
      endDate: c.endDate || '',
      memo: c.memo || ''
    };
  });
  const [showConfirm, setShowConfirm] = useState(false);

  // 연락처 자동 포맷팅 (010-nnnn-nnnn)
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'contact') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenChange = (e) => {
    const gen = gens.find(g => g.id === e.target.value);
    if (gen) {
      setFormData(prev => ({ ...prev, generationId: gen.id, generationLabel: gen.label, generationName: gen.name }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    onSave(formData);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium mt-1";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1 mt-4";
  const sectionClass = "font-black text-slate-800 mb-4 mt-10 border-b border-slate-200 pb-2 text-lg";

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">{isEdit ? "심화반 수정" : "심화반 추가"}</h2>
          <p className="text-slate-500 mt-1">{isEdit ? "등록된 심화반 정보를 수정합니다." : "PHCA 수료 후 진행되는 심화반 정보를 등록합니다."}</p>
        </div>
        <button onClick={onCancel} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm flex items-center">
          목록으로 돌아가기
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
        <form onSubmit={handleSubmit}>
          <h4 className={`${sectionClass} mt-0`}>기본 정보</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <label className={labelClass}>기수 *</label>
              <select name="generationId" value={formData.generationId} onChange={handleGenChange} className={inputClass} required>
                {gens.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>상태 *</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass} required>
                <option value="운영중">운영중</option>
                <option value="운영예정">운영예정</option>
                <option value="종료">종료</option>
                <option value="보류">보류</option>
              </select>
            </div>
            <div><label className={labelClass}>부서</label><input type="text" name="department" value={formData.department} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>과</label><input type="text" name="section" value={formData.section} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>심화반명 *</label><input type="text" name="className" value={formData.className} onChange={handleChange} className={inputClass} required /></div>
            <div><label className={labelClass}>담당자</label><input type="text" name="instructor" value={formData.instructor} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>연락처</label><input type="tel" name="contact" value={formData.contact} onChange={handleChange} className={inputClass} placeholder="010-0000-0000" /></div>
          </div>
          
          <h4 className={sectionClass}>운영 정보</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            <div><label className={labelClass}>회</label><input type="text" name="group" value={formData.group} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>대상</label><input type="text" name="target" value={formData.target} onChange={handleChange} className={inputClass} placeholder="예: 중1~고3 누구나 (자유롭게 입력)" /></div>
            <div><label className={labelClass}>일정</label><input type="text" name="schedule" value={formData.schedule} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>장소</label><input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2 hidden sm:block"></div>
            <div><label className={labelClass}>시작일</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>종료일</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={inputClass} /></div>
            <div className="sm:col-span-2"><label className={labelClass}>메모</label><textarea name="memo" value={formData.memo} onChange={handleChange} rows="3" className={inputClass}></textarea></div>
          </div>
          
          <div className="flex justify-end gap-3 pt-8 mt-10 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-8 py-3.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">취소</button>
            <button type="submit" className="px-8 py-3.5 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm">{isEdit ? '수정하기' : '저장하기'}</button>
          </div>
        </form>
      </div>
      {showConfirm && (
        <ConfirmModal
          title={isEdit ? "심화반 수정" : "심화반 추가"}
          message={isEdit ? "심화반 정보를 수정하시겠습니까?" : "새 심화반을 추가하시겠습니까?"}
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirm(false)}
          confirmText={isEdit ? "수정하기" : "추가하기"}
        />
      )}
    </div>
  );
};

const AdminAdvancedCreatePage = ({ navigate }) => {
  const handleSave = (parsedData) => {
    const classes = JSON.parse(localStorage.getItem('phcaAdvancedClasses')) || [];
    const updated = [parsedData, ...classes];
    localStorage.setItem('phcaAdvancedClasses', JSON.stringify(updated));
    navigate('/admin/advanced');
  };
  return <AdminAdvancedForm isEdit={false} initialData={{}} onCancel={() => navigate('/admin/advanced')} onSave={handleSave} />;
};

const AdminAdvancedEditPage = ({ advancedId, navigate }) => {
  const classes = JSON.parse(localStorage.getItem('phcaAdvancedClasses')) || [];
  const advClass = classes.find(c => c.id === advancedId);

  if (!advClass) {
    return (
      <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto mt-10">
        <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">해당 심화반을 찾을 수 없습니다.</h2>
        <p className="text-slate-500 mb-8 font-medium">정보가 삭제되었거나 잘못된 접근입니다.</p>
        <button onClick={() => navigate('/admin/advanced')} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-sm">목록으로 돌아가기</button>
      </div>
    );
  }

  const handleSave = (parsedData) => {
    const updated = classes.map(c => c.id === parsedData.id ? parsedData : c);
    localStorage.setItem('phcaAdvancedClasses', JSON.stringify(updated));
    navigate('/admin/advanced');
  };

  return <AdminAdvancedForm isEdit={true} initialData={advClass} onCancel={() => navigate('/admin/advanced')} onSave={handleSave} />;
};

const AdminMainVisualPage = () => {
  const selectedGenId = getSelectedGenerationId();
  const gens = getGenerations();
  const selectedGen = gens.find(g => g.id === selectedGenId) || gens[0];

  const defaultState = {
    generationId: selectedGen.id,
    title: `PETER HEAVENLY \n CULTURE ACADEMY`,
    subtitle: `여름방학을 배움과 성장의 시간으로!\n${selectedGen.name} 피터하늘문화 아카데미에 초대합니다!`,
    imageUrl: '/images/img_01.jpg',
    imageAlt: 'PHCA 메인 이미지',
    recruitSchedule: '7월 12일(일) ~ 7월 22일(수)',
    operationSchedule: '7월 25일(토) ~ 8월 23일(토)',
    recruitTarget: '유년 회원',
    operationLocation: '베드로지파 광주교회 각 층'
  };

  const [formData, setFormData] = useState(defaultState);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const visuals = JSON.parse(localStorage.getItem('phcaMainVisuals')) || [];
    const currentVisual = visuals.find(v => v.generationId === selectedGen.id);
    if (currentVisual) {
      setFormData({
        ...defaultState,
        ...currentVisual
      });
    } else {
      setFormData({
        ...defaultState,
        generationId: selectedGen.id,
        subtitle: `여름방학을 배움과 성장의 시간으로!\n${selectedGen.name} 피터하늘문화 아카데미에 초대합니다!`
      });
    }
  }, [selectedGen.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData({
      ...defaultState,
      generationId: selectedGen.id,
      subtitle: `여름방학을 배움과 성장의 시간으로!\n${selectedGen.name} 피터하늘문화 아카데미에 초대합니다!`
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    const visuals = JSON.parse(localStorage.getItem('phcaMainVisuals')) || [];
    const existingIndex = visuals.findIndex(v => v.generationId === formData.generationId);
    if (existingIndex >= 0) {
      visuals[existingIndex] = formData;
    } else {
      visuals.push(formData);
    }
    localStorage.setItem('phcaMainVisuals', JSON.stringify(visuals));
    setShowConfirm(false);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium mt-1";
  const labelClass = "block text-sm font-bold text-slate-600 mb-1 mt-4";
  const sectionClass = "font-black text-slate-800 mb-4 mt-8 border-b border-slate-200 pb-2 text-lg";

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">메인 관리</h2>
          <p className="text-slate-500 mt-1">[{selectedGen.name}] 사용자 메인 화면의 정보와 이미지를 관리합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="sticky top-24">
            <h4 className="font-black text-slate-800 mb-4 text-lg">미리보기</h4>
            <div className="rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 relative h-[450px] flex items-center justify-center">
              <img src={formData.imageUrl || '/images/img_01.jpg'} alt={formData.imageAlt} className="absolute inset-0 w-full h-full object-cover z-0" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-sky-50/60 backdrop-blur-[2px] z-10"></div>
              
              <div className="relative z-20 text-center px-4 w-full">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-tight mb-4 whitespace-pre-line drop-shadow-sm">
                  {formData.title || '제목'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-800 font-bold mb-6 whitespace-pre-line leading-relaxed">
                  {formData.subtitle || '서브 문구'}
                </p>
                <div className="flex flex-col gap-2 px-8">
                  <button className="bg-sky-500 text-white font-black py-3 rounded-full text-xs shadow-md pointer-events-none">
                    수강 신청하기
                  </button>
                  <button className="bg-white/90 backdrop-blur-sm text-slate-800 font-black py-3 rounded-full text-xs border border-slate-100 shadow-md pointer-events-none">
                    강좌 둘러보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <h4 className={`${sectionClass} mt-0`}>텍스트 설정</h4>
            <div>
              <label className={labelClass} style={{marginTop: 0}}>메인 제목</label>
              <textarea name="title" value={formData.title} onChange={handleChange} rows="2" className={inputClass} required></textarea>
            </div>
            <div>
              <label className={labelClass}>서브 문구</label>
              <textarea name="subtitle" value={formData.subtitle} onChange={handleChange} rows="3" className={inputClass} required></textarea>
            </div>

            <h4 className={sectionClass}>이미지 설정</h4>
            <div className="mb-6">
              <ImageUploadBox 
                label="메인 이미지 (파일 업로드 또는 붙여넣기)" 
                multiple={false} 
                images={formData.imageUrl ? [formData.imageUrl] : []} 
                onChange={(newImages) => setFormData(prev => ({ ...prev, imageUrl: newImages[0] || '' }))} 
              />
              <p className="text-xs text-slate-400 mt-2">* 이미지를 업로드하지 않으면 기본 이미지가 노출됩니다.</p>
            </div>
            <div>
              <label className={labelClass}>이미지 설명 문구 (Alt)</label>
              <input type="text" name="imageAlt" value={formData.imageAlt} onChange={handleChange} className={inputClass} required />
            </div>

            <h4 className={sectionClass}>운영 정보 설정</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{marginTop: 0}}>모집 일정</label>
                <input type="text" name="recruitSchedule" value={formData.recruitSchedule} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} style={{marginTop: 0}}>운영 일정</label>
                <input type="text" name="operationSchedule" value={formData.operationSchedule} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} style={{marginTop: 0}}>모집 대상</label>
                <input type="text" name="recruitTarget" value={formData.recruitTarget} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass} style={{marginTop: 0}}>운영 장소</label>
                <input type="text" name="operationLocation" value={formData.operationLocation} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 mt-8 border-t border-slate-100">
              <button type="button" onClick={handleReset} className="px-6 py-3 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm">초기화</button>
              <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm text-sm">저장하기</button>
            </div>
          </form>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="메인 사진 저장"
          message="메인 페이지 사진 정보를 저장하시겠습니까?"
          onConfirm={handleConfirmSave}
          onCancel={() => setShowConfirm(false)}
          confirmText="저장하기"
        />
      )}
    </div>
  );
};

const AdminGenerationPage = () => {
  const [gens, setGens] = useState(getGenerations());
  const [selectedId, setSelectedId] = useState(getSelectedGenerationId());
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const apps = JSON.parse(localStorage.getItem('phca_applications') || '[]');
  const courses = JSON.parse(localStorage.getItem('phcaCourses') || '[]');

  const getStats = (genId) => {
    return {
      appsCount: apps.filter(a => a.generationId === genId || (!a.generationId && genId === 'phca-4')).length,
      coursesCount: courses.filter(c => c.generationId === genId || (!c.generationId && genId === 'phca-4')).length
    };
  };

  const handleSelect = (id) => {
    setSelectedId(id);
    setSelectedGenerationId(id);
    window.dispatchEvent(new Event('phca-generation-changed'));
  };

  const handleSetCurrent = (id) => {
    localStorage.setItem('phcaCurrentGenerationId', id);
    const updated = gens.map(g => ({ ...g, isCurrent: g.id === id }));
    setGens(updated);
    saveGenerations(updated);
    window.dispatchEvent(new Event('phca-generation-changed'));
  };

  const handleEdit = (gen) => {
    setFormData(gen);
    setIsEditing(true);
  };

  const handleNew = () => {
    setFormData({
      id: `phca-${gens.length + 1}`,
      label: `${gens.length + 1}기`,
      name: `PHCA ${gens.length + 1}기`,
      number: gens.length + 1,
      year: new Date().getFullYear(),
      season: '여름방학',
      status: '운영예정',
      isCurrent: false,
      startDate: '',
      endDate: '',
      memo: ''
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    let updated;
    if (gens.find(g => g.id === formData.id)) {
      updated = gens.map(g => g.id === formData.id ? formData : g);
    } else {
      updated = [...gens, formData];
    }
    setGens(updated);
    saveGenerations(updated);
    setIsEditing(false);
    setShowConfirm(false);
  };

  const inputClass = "w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-medium mt-1";
  const todayDate = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 10}, (_, i) => currentYear - 3 + i);

  if (isEditing) {
    return (
      <div className="animate-fadeIn max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800">{formData.id.startsWith(`phca-${gens.length + 1}`) ? "새 기수 추가" : "기수 정보 수정"}</h2>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-bold text-slate-600">기수 ID</label><input type="text" value={formData.id} disabled className={inputClass + ' opacity-60'} /></div>
              <div><label className="text-sm font-bold text-slate-600">Label (예: 4기)</label><input type="text" name="label" value={formData.label} onChange={handleChange} className={inputClass} required /></div>
            </div>
            <div><label className="text-sm font-bold text-slate-600">기수명 (사용자 화면 노출)</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClass} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-slate-600">연도</label>
                <select name="year" value={formData.year} onChange={handleChange} className={inputClass} required>
                  {yearOptions.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-600">시즌</label>
                <select name="season" value={formData.season} onChange={handleChange} className={inputClass}>
                  <option value="여름방학">여름방학</option>
                  <option value="겨울방학">겨울방학</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-bold text-slate-600">시작일</label><input type="date" name="startDate" value={formData.startDate} min={todayDate} onChange={handleChange} className={inputClass} /></div>
              <div><label className="text-sm font-bold text-slate-600">종료일</label><input type="date" name="endDate" value={formData.endDate} min={formData.startDate || todayDate} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div>
              <label className="text-sm font-bold text-slate-600">상태</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="모집예정">모집예정</option>
                <option value="모집중">모집중</option>
                <option value="운영중">운영중</option>
                <option value="종료">종료</option>
                <option value="운영예정">운영예정</option>
              </select>
            </div>
            <div><label className="text-sm font-bold text-slate-600">메모</label><textarea name="memo" value={formData.memo} onChange={handleChange} rows="2" className={inputClass}></textarea></div>
            
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">취소</button>
              <button type="submit" className="bg-sky-500 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-sky-600 transition-all shadow-sm">저장하기</button>
            </div>
          </form>
        </div>
        {showConfirm && (
          <ConfirmModal
            title={formData.id.startsWith(`phca-${gens.length + 1}`) ? "기수 추가" : "기수 정보 수정"}
            message="입력한 기수 정보를 저장하시겠습니까?"
            onConfirm={handleConfirmSave}
            onCancel={() => setShowConfirm(false)}
            confirmText="저장하기"
          />
        )}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">기수 설정</h2>
          <p className="text-slate-500 mt-1">운영 중인 기수를 관리하고 선택합니다.</p>
        </div>
        <button onClick={handleNew} className="bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold flex items-center shadow-sm hover:bg-sky-600 transition-colors">
          <Plus size={18} className="mr-2"/> 새 기수 추가
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-4">기수</th>
              <th className="p-4">연도</th>
              <th className="p-4">시즌</th>
              <th className="p-4">상태</th>
              <th className="p-4">신청자 수</th>
              <th className="p-4">강좌 수</th>
              <th className="p-4">현재 기수</th>
              <th className="p-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {gens.map(g => {
              const stats = getStats(g.id);
              const isSelected = g.id === selectedId;
              return (
                <tr key={g.id} onClick={() => handleSelect(g.id)} className={`cursor-pointer transition-colors ${isSelected ? 'bg-sky-50' : 'hover:bg-slate-50'}`}>
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                    {g.label}
                    {isSelected && <span className="bg-sky-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">선택됨</span>}
                  </td>
                  <td className="p-4">{g.year}</td>
                  <td className="p-4">{g.season}</td>
                  <td className="p-4">{g.status}</td>
                  <td className="p-4">{stats.appsCount}명</td>
                  <td className="p-4">{stats.coursesCount}개</td>
                  <td className="p-4">
                    {g.isCurrent ? <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded text-xs font-bold">현재 기수</span> : '-'}
                  </td>
                  <td className="p-4 text-center flex justify-center gap-2" onClick={e => e.stopPropagation()}>
                    {!g.isCurrent && (
                      <button onClick={() => handleSetCurrent(g.id)} className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors text-xs font-bold border border-emerald-200">현재기수로 설정</button>
                    )}
                    <button onClick={() => handleEdit(g)} className="text-sky-600 hover:bg-sky-50 p-2 rounded-lg transition-colors" title="수정"><Edit2 size={16}/></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500">
        * 행을 클릭하면 해당 기수가 선택되어 모든 관리자 페이지에 반영됩니다.
      </p>
    </div>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [routeState, setRouteState] = useState(window.history.state || {});
  const [user, setUser] = useState(null);

  // Load user from session/storage on mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem('phca_current_user');
    if (loggedInUser) setUser(JSON.parse(loggedInUser));

    const handlePopState = (event) => {
      setCurrentPath(window.location.pathname);
      setRouteState(event.state || {});
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path, state = {}) => {
    window.history.pushState(state, '', path);
    setCurrentPath(path.split('?')[0]);
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
    // Admin Routes Handling
    if (currentPath.startsWith('/admin')) {
      if (currentPath === '/admin/login') return <AdminLoginPage navigate={navigate} />;
      if (!localStorage.getItem('phcaAdminAuth')) return <AdminLoginPage navigate={navigate} />;
      
      const adminCourseEditMatch = currentPath.match(/^\/admin\/courses\/([^\/]+)\/edit$/);
      const adminAdvancedEditMatch = currentPath.match(/^\/admin\/advanced\/([^\/]+)\/edit$/);
      const adminAdvancedParticipantsMatch = currentPath.match(/^\/admin\/advanced\/([^\/]+)\/participants$/);

      return (
        <AdminLayout navigate={navigate} onLogout={() => { localStorage.removeItem('phcaAdminAuth'); navigate('/admin/login'); }}>
          {currentPath === '/admin' && <AdminDashboardPage />}
          {currentPath === '/admin/applications' && <AdminApplicationsPage />}
          {currentPath === '/admin/courses' && <AdminCoursesPage navigate={navigate} />}
          {currentPath === '/admin/courses/new' && <AdminCourseCreatePage navigate={navigate} />}
          {adminCourseEditMatch && <AdminCourseEditPage courseId={adminCourseEditMatch[1]} navigate={navigate} />}
          {currentPath === '/admin/notices' && <AdminNoticesPage />}
          {currentPath === '/admin/faqs' && <AdminFaqsPage />}
          {currentPath === '/admin/advanced' && <AdminAdvancedPage navigate={navigate} />}
          {currentPath === '/admin/advanced/new' && <AdminAdvancedCreatePage navigate={navigate} />}
          {adminAdvancedEditMatch && <AdminAdvancedEditPage advancedId={adminAdvancedEditMatch[1]} navigate={navigate} />}
          {adminAdvancedParticipantsMatch && <AdminAdvancedParticipantPage advancedId={adminAdvancedParticipantsMatch[1]} navigate={navigate} />}
          {currentPath === '/admin/main-visual' && <AdminMainVisualPage />}
          {currentPath === '/admin/generation' && <AdminGenerationPage />}
        </AdminLayout>
      );
    }

    const courseDetailMatch = currentPath.match(/^\/courses\/([^\/]+)$/);
    if (courseDetailMatch) {
      return <CourseDetailPage courseId={courseDetailMatch[1]} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/': return <HomePage navigate={navigate} />;
      case '/courses': return <CoursesPage navigate={navigate} user={user} />;
      case '/notices': return <NoticePage navigate={navigate} />;
      case '/apply': return <ApplyPage navigate={navigate} routeState={routeState} user={user} />;
      case '/apply/complete': return <ApplyCompletePage navigate={navigate} />;
      case '/check': return <ApplicationCheckPage user={user} />;
      case '/faq': return <FAQPage navigate={navigate} />;
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
      
      {!currentPath.startsWith('/admin') && (
        <Header currentPath={currentPath} navigate={navigate} user={user} onLogout={handleLogout} />
      )}
      
      <main className="flex-grow">
        {renderPage()}
      </main>
      {!currentPath.startsWith('/admin') && <Footer navigate={navigate} />}
    </div>
  );
}
