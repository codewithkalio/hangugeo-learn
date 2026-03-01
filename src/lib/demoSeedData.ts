export interface DemoWord {
  korean: string;
  english: string;
  category: string;
  note: string;
}

export const DEMO_CATEGORIES = [
  'Greetings',
  'Food',
  'Travel',
  'Numbers',
  'Daily Life',
  'Verbs',
  'Modifiers',
];

export const DEMO_WORDS: DemoWord[] = [
  // ── Greetings (7) ──
  { korean: '안녕하세요', english: 'Hello', category: 'Greetings', note: 'Formal greeting, used in most situations' },
  { korean: '감사합니다', english: 'Thank you', category: 'Greetings', note: 'Formal, used with strangers & elders' },
  { korean: '죄송합니다', english: 'I\'m sorry', category: 'Greetings', note: 'Formal apology' },
  { korean: '안녕히 가세요', english: 'Goodbye (to someone leaving)', category: 'Greetings', note: 'Said by the person staying' },
  { korean: '안녕히 계세요', english: 'Goodbye (to someone staying)', category: 'Greetings', note: 'Said by the person leaving' },
  { korean: '만나서 반갑습니다', english: 'Nice to meet you', category: 'Greetings', note: 'Used when meeting someone for the first time' },
  { korean: '잘 지내세요?', english: 'How are you?', category: 'Greetings', note: 'Literally: Are you doing well?' },

  // ── Food (8) ──
  { korean: '밥', english: 'Rice / Meal', category: 'Food', note: 'Also used to mean "meal" in general' },
  { korean: '물', english: 'Water', category: 'Food', note: 'One of the most essential words' },
  { korean: '김치', english: 'Kimchi', category: 'Food', note: 'Fermented vegetable side dish, a staple' },
  { korean: '고기', english: 'Meat', category: 'Food', note: 'General word for meat' },
  { korean: '커피', english: 'Coffee', category: 'Food', note: 'Konglish (loan word from English)' },
  { korean: '맛있다', english: 'Delicious', category: 'Food', note: 'Dictionary form; 맛있어요 is polite' },
  { korean: '배고프다', english: 'To be hungry', category: 'Food', note: 'Dictionary form; 배고파요 is polite' },
  { korean: '식당', english: 'Restaurant', category: 'Food', note: 'A place to eat' },

  // ── Travel (7) ──
  { korean: '공항', english: 'Airport', category: 'Travel', note: 'Essential for travel conversations' },
  { korean: '호텔', english: 'Hotel', category: 'Travel', note: 'Konglish loan word' },
  { korean: '지하철', english: 'Subway', category: 'Travel', note: 'Main public transit in Korean cities' },
  { korean: '택시', english: 'Taxi', category: 'Travel', note: 'Konglish loan word' },
  { korean: '어디', english: 'Where', category: 'Travel', note: 'Question word for location' },
  { korean: '얼마예요?', english: 'How much is it?', category: 'Travel', note: 'Essential phrase for shopping' },
  { korean: '화장실', english: 'Bathroom / Restroom', category: 'Travel', note: 'Very useful to know!' },

  // ── Numbers (7) ──
  { korean: '하나', english: 'One (native)', category: 'Numbers', note: 'Native Korean number system' },
  { korean: '둘', english: 'Two (native)', category: 'Numbers', note: 'Native Korean number system' },
  { korean: '셋', english: 'Three (native)', category: 'Numbers', note: 'Native Korean number system' },
  { korean: '넷', english: 'Four (native)', category: 'Numbers', note: 'Native Korean number system' },
  { korean: '다섯', english: 'Five (native)', category: 'Numbers', note: 'Native Korean number system' },
  { korean: '일', english: 'One (Sino-Korean)', category: 'Numbers', note: 'Sino-Korean system, used for dates & money' },
  { korean: '십', english: 'Ten (Sino-Korean)', category: 'Numbers', note: 'Sino-Korean system' },

  // ── Daily Life (7) ──
  { korean: '집', english: 'House / Home', category: 'Daily Life', note: 'A very common word' },
  { korean: '학교', english: 'School', category: 'Daily Life', note: 'Hak-gyo' },
  { korean: '친구', english: 'Friend', category: 'Daily Life', note: 'Chin-gu' },
  { korean: '시간', english: 'Time', category: 'Daily Life', note: 'Also means "hour"' },
  { korean: '오늘', english: 'Today', category: 'Daily Life', note: 'Time-related vocabulary' },
  { korean: '내일', english: 'Tomorrow', category: 'Daily Life', note: 'Time-related vocabulary' },
  { korean: '전화', english: 'Phone / Phone call', category: 'Daily Life', note: 'Jeon-hwa' },

  // ── Verbs (7) ──
  { korean: '가다', english: 'To go', category: 'Verbs', note: 'One of the most common verbs' },
  { korean: '오다', english: 'To come', category: 'Verbs', note: 'Opposite of 가다' },
  { korean: '먹다', english: 'To eat', category: 'Verbs', note: 'Meok-da' },
  { korean: '마시다', english: 'To drink', category: 'Verbs', note: 'Ma-shi-da' },
  { korean: '하다', english: 'To do', category: 'Verbs', note: 'Extremely versatile verb' },
  { korean: '보다', english: 'To see / To watch', category: 'Verbs', note: 'Bo-da' },
  { korean: '알다', english: 'To know', category: 'Verbs', note: 'Al-da; 몰라요 means "I don\'t know"' },

  // ── Modifiers (7) ──
  { korean: '좋다', english: 'Good / To be good', category: 'Modifiers', note: 'Jo-ta; 좋아요 is polite form' },
  { korean: '크다', english: 'Big / To be big', category: 'Modifiers', note: 'Keu-da' },
  { korean: '작다', english: 'Small / To be small', category: 'Modifiers', note: 'Jak-da' },
  { korean: '많다', english: 'Many / A lot', category: 'Modifiers', note: 'Man-ta' },
  { korean: '새로운', english: 'New', category: 'Modifiers', note: 'Adjective modifier form' },
  { korean: '빠르다', english: 'Fast / To be fast', category: 'Modifiers', note: 'Ppa-reu-da' },
  { korean: '예쁘다', english: 'Pretty / To be pretty', category: 'Modifiers', note: 'Ye-ppeu-da' },
];
