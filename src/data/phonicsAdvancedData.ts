import { GradeLevel } from '../types';

export interface Grade2BlendItem {
  id: string;
  blend: string; // e.g. "ST", "BL", "CH"
  sound: string; // e.g. "/st/ (스트)"
  word: string; // e.g. "Star"
  translation: string;
  icon: string;
  color: string;
  exampleSentence: string;
}

export interface Grade3DialogueItem {
  id: string;
  situation: string; // e.g. "친구와 인사 나누기"
  speaker: string; // e.g. "🐰 토끼"
  dialogue: string; // e.g. "How are you doing today?"
  translation: string; // e.g. "오늘 기분이 어때?"
  replyOption: string[];
  correctReplyIndex: number;
  icon: string;
}

// 2학년 이중자음/이중모음 Sight Words & Blends 데이터
export const GRADE2_BLENDS: Grade2BlendItem[] = [
  {
    id: 'b-st',
    blend: 'ST',
    sound: '/st/ (스트)',
    word: 'Star',
    translation: '별',
    icon: '⭐',
    color: '#FDE047',
    exampleSentence: 'Twinkle twinkle little star in the night sky.',
  },
  {
    id: 'b-bl',
    blend: 'BL',
    sound: '/bl/ (블)',
    word: 'Blue',
    translation: '파란색',
    icon: '💙',
    color: '#7DD3FC',
    exampleSentence: 'The sea is so beautiful and blue.',
  },
  {
    id: 'b-ch',
    blend: 'CH',
    sound: '/tʃ/ (치)',
    word: 'Chair',
    translation: '의자',
    icon: '🪑',
    color: '#FFB6C1',
    exampleSentence: 'Sit down comfortably on the wooden chair.',
  },
  {
    id: 'b-sh',
    blend: 'SH',
    sound: '/ʃ/ (쉬)',
    word: 'Ship',
    translation: '배/선박',
    icon: '🚢',
    color: '#6EE7B7',
    exampleSentence: 'The big ship sails across the ocean.',
  },
  {
    id: 'b-th',
    blend: 'TH',
    sound: '/θ/ (쓰)',
    word: 'Think',
    translation: '생각하다',
    icon: '💡',
    color: '#D8B4F8',
    exampleSentence: 'I think you did a great job today!',
  },
  {
    id: 'b-gr',
    blend: 'GR',
    sound: '/gr/ (그르)',
    word: 'Green',
    translation: '초록색',
    icon: '🌿',
    color: '#BBF7D0',
    exampleSentence: 'Green leaves sparkle in summer.',
  },
];

// 3학년 필수 회화 표현 Dialogue 데이터
export const GRADE3_DIALOGUES: Grade3DialogueItem[] = [
  {
    id: 'd-1',
    situation: '기분과 안부 묻기',
    speaker: '🐰 마법 토끼',
    dialogue: 'How are you feeling today?',
    translation: '오늘 기분이 어때?',
    replyOption: ["I am happy and great! 😊", "It is 3 o'clock. 🕒", "I like apples. 🍎"],
    correctReplyIndex: 0,
    icon: '😊',
  },
  {
    id: 'd-2',
    situation: '여름방학 계획 자랑하기',
    speaker: '🐥 꼬마 병아리',
    dialogue: 'What is your plan for summer vacation?',
    translation: '이번 여름방학에 어떤 계획이 있니?',
    replyOption: ["I will go swimming with my family! 🏊‍♂️", "My name is Jiwoo. 🐰", "Red is my favorite color. 🎨"],
    correctReplyIndex: 0,
    icon: '🏖️',
  },
  {
    id: 'd-3',
    situation: '도움 요청하고 감사하기',
    speaker: '🐻 아기 곰돌이',
    dialogue: 'Can you help me with this book?',
    translation: '이 책 보는 걸 도와줄 수 있니?',
    replyOption: ["Sure! Sure! Here you go! 📖", "No, I am sleeping. 😴", "Yesterday was Sunday. 📅"],
    correctReplyIndex: 0,
    icon: '📖',
  },
];
