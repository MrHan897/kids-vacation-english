import { TimetableItem } from '../types';

export const DEFAULT_SCHEDULE: TimetableItem[] = [
  {
    id: 'slot-1',
    timeSlot: '08:30 - 09:30',
    title: '기상 & 아침 식사',
    category: 'meal',
    icon: 'Utensils',
    color: '#FDE047', // pastel yellow
    completed: false,
    notes: '상쾌한 아침 기상과 건강한 아침 밥 먹기!',
  },
  {
    id: 'slot-2',
    timeSlot: '09:30 - 10:30',
    title: '아침 공부 (방학 숙제)',
    category: 'study',
    icon: 'BookOpen',
    color: '#7DD3FC', // pastel blue
    completed: false,
    notes: '하루 30분 포모도로 타이머로 집중해서 공부해요.',
  },
  {
    id: 'slot-3',
    timeSlot: '10:30 - 12:00',
    title: '신나는 자유 놀이',
    category: 'play',
    icon: 'Gamepad2',
    color: '#FFB6C1', // pastel pink
    completed: false,
    notes: '블록 놀이나 그림 그리기를 하며 신나게 놀아요.',
  },
  {
    id: 'slot-4',
    timeSlot: '12:00 - 13:00',
    title: '맛있는 점심 식사',
    category: 'meal',
    icon: 'Sun',
    color: '#FDE047',
    completed: false,
    notes: '골고루 맛있게 점심을 먹어요.',
  },
  {
    id: 'slot-5',
    timeSlot: '13:00 - 14:00',
    title: '영어 파닉스 놀이',
    category: 'study',
    icon: 'Sparkles',
    color: '#D8B4F8', // pastel purple
    completed: false,
    notes: '알파벳 발음을 듣고 퀴즈를 풀어요!',
  },
  {
    id: 'slot-6',
    timeSlot: '14:00 - 16:00',
    title: '바깥 활동 & 운동',
    category: 'play',
    icon: 'Smile',
    color: '#6EE7B7', // pastel mint
    completed: false,
    notes: '자전거 타기나 줄넘기로 씽씽 달려요!',
  },
  {
    id: 'slot-7',
    timeSlot: '16:00 - 17:00',
    title: '달콤한 휴식 시간',
    category: 'rest',
    icon: 'Coffee',
    color: '#FDBA74', // pastel orange
    completed: false,
    notes: '간식 먹고 푹 쉬는 힐링 타임.',
  },
  {
    id: 'slot-8',
    timeSlot: '17:00 - 18:30',
    title: '저녁 식사 & 가족 대화',
    category: 'meal',
    icon: 'Heart',
    color: '#FDE047',
    completed: false,
    notes: '오늘 하루 있었던 즐거운 일을 이야기해요.',
  },
  {
    id: 'slot-9',
    timeSlot: '18:30 - 20:00',
    title: '방학 일기 & 독서',
    category: 'study',
    icon: 'Pencil',
    color: '#7DD3FC',
    completed: false,
    notes: '그림일기를 쓰고 재밌는 동화책을 읽어요.',
  },
  {
    id: 'slot-10',
    timeSlot: '20:00 - 21:00',
    title: '꿈나라 준비 (취침)',
    category: 'rest',
    icon: 'Bed',
    color: '#D8B4F8',
    completed: false,
    notes: '양치하고 잠자리에 들 준비를 해요.',
  },
];
