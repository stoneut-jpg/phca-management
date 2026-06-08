import { currentGeneration } from './generation';

const faqs = [
  {
    id: 'faq-1',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '신청',
    question: 'PHCA 강좌는 어떻게 신청하나요?',
    answer: '홈페이지에서 "강좌 안내" 페이지로 이동 후 원하는 강좌를 선택하고 신청서를 작성하여 제출하시면 됩니다. 로그인 후 신청하면 신청 상태를 확인할 수 있습니다.'
  },
  {
    id: 'faq-2',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '강좌',
    question: '강좌별 모집 정원은 어디에서 확인할 수 있나요?',
    answer: '각 강좌 카드의 세부 정보에서 모집 정원과 시간, 준비물, 후원금을 확인할 수 있습니다. 상세 페이지에서 더 많은 내용을 볼 수 있습니다.'
  },
  {
    id: 'faq-3',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '후원금',
    question: '후원금은 어떻게 납부하나요?',
    answer: '후원금 납부 방법은 신청 완료 후 안내 페이지에서 확인 가능합니다. 일반적으로 등록된 계좌로 송금하여 주시면 됩니다.'
  },
  {
    id: 'faq-4',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '운영',
    question: '강좌 시간이나 장소가 변경되면 어떻게 알 수 있나요?',
    answer: '교육 시간 및 장소 변경 시 등록된 연락처로 문자 또는 이메일 안내가 발송됩니다. 또한 사이트 공지 사항을 통해서도 확인할 수 있습니다.'
  },
  {
    id: 'faq-5',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '계정',
    question: '비밀번호를 잊어버렸을 때 어떻게 해야 하나요?',
    answer: '현재 버전에서는 비밀번호 재설정 기능을 지원하지 않습니다. 로그인에 문제가 있는 경우 운영 담당자에게 문의해 주세요.'
  },
  {
    id: 'faq-6',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '문의',
    question: '추가 질문이 있을 때는 어디로 문의하나요?',
    answer: '페이지 하단의 문의 안내 또는 담당자 정보로 연락하시면 됩니다. 필요 시 홈페이지 내 별도 문의 채널을 통해 요청해주세요.'
  },
  {
    id: 'faq-7',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '신청',
    question: '중복 신청이 가능한가요?',
    answer: '한 명당 동일한 강좌에 대한 중복 신청은 불가합니다. 다른 강좌는 별도로 신청 가능합니다.'
  },
  {
    id: 'faq-8',
    generationId: currentGeneration.id,
    generationLabel: currentGeneration.name,
    category: '강좌',
    question: '강좌 내용을 변경하고 싶은 경우 어떻게 하나요?',
    answer: '강좌 변경은 신청 마감 전까지만 가능합니다. 변경 요청은 운영팀에 문의해 주시기 바랍니다.'
  },
];

export default faqs;
