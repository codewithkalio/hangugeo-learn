/**
 * Korean Conjugation Engine — static data & conjugate() function
 *
 * Handles vowel harmony, consonant/vowel stem detection,
 * ㅂ/ㄷ/ㅅ/ㅎ/르/ㄹ irregulars via lookup table.
 */

// ─── Pattern definitions ────────────────────────────────────────────

export type PatternGroup = 'early' | 'intermediate' | 'advanced';

export interface PatternDef {
  key: string;
  label: string;       // English
  korean: string;      // Korean suffix description
  group: PatternGroup;
}

export const PATTERN_DEFS: PatternDef[] = [
  // Early
  { key: 'informal_polite_present',    label: 'Informal polite present',        korean: '-아/어요',        group: 'early' },
  { key: 'informal_polite_past',       label: 'Informal polite past',           korean: '-았/었어요',      group: 'early' },
  { key: 'informal_polite_future',     label: 'Informal polite future',         korean: '-ㄹ/을 거예요',   group: 'early' },
  { key: 'negative_present',           label: 'Negative (안)',                  korean: '안 + verb',      group: 'early' },
  { key: 'want_to',                    label: 'Want to (-고 싶다)',              korean: '-고 싶어요',     group: 'early' },
  { key: 'can_do',                     label: 'Can do (-ㄹ/을 수 있다)',         korean: '-ㄹ/을 수 있어요', group: 'early' },
  { key: 'progressive',               label: 'Progressive (-고 있다)',          korean: '-고 있어요',     group: 'early' },
  { key: 'imperative_polite',         label: 'Polite imperative',              korean: '-(으)세요',      group: 'early' },
  { key: 'lets_suggestive',           label: 'Let\'s (suggestive)',            korean: '-(으)ㅂ시다',    group: 'early' },

  // Intermediate
  { key: 'formal_present',            label: 'Formal present',                 korean: '-ㅂ/습니다',     group: 'intermediate' },
  { key: 'formal_past',               label: 'Formal past',                    korean: '-았/었습니다',   group: 'intermediate' },
  { key: 'because_reason',            label: 'Because (-아/어서)',              korean: '-아/어서',       group: 'intermediate' },
  { key: 'but_contrast',              label: 'But (-지만)',                     korean: '-지만',         group: 'intermediate' },
  { key: 'if_conditional',            label: 'If (-(으)면)',                    korean: '-(으)면',       group: 'intermediate' },
  { key: 'when_time',                 label: 'When (-(으)ㄹ 때)',               korean: '-(으)ㄹ 때',    group: 'intermediate' },
  { key: 'try_experience',            label: 'Try / experience (-아/어 보다)',  korean: '-아/어 봐요',    group: 'intermediate' },
  { key: 'must_obligation',           label: 'Must (-아/어야 하다)',            korean: '-아/어야 해요',  group: 'intermediate' },
  { key: 'should_not',                label: 'Should not (-면 안 되다)',        korean: '-(으)면 안 돼요', group: 'intermediate' },

  // Advanced
  { key: 'passive_voice',             label: 'Passive (-이/히/리/기)',          korean: '-이/히/리/기-',  group: 'advanced' },
  { key: 'causative',                 label: 'Causative (-이/히/리/기/우/추)',   korean: '-이/히/리/기-',  group: 'advanced' },
  { key: 'reported_speech',           label: 'Reported speech (-다고 하다)',    korean: '-다고 해요',     group: 'advanced' },
  { key: 'seems_like',                label: 'Seems like (-는 것 같다)',        korean: '-는 것 같아요',  group: 'advanced' },
  { key: 'plan_to',                   label: 'Plan to (-(으)려고 하다)',        korean: '-(으)려고 해요', group: 'advanced' },
  { key: 'while_doing',              label: 'While doing (-(으)면서)',         korean: '-(으)면서',     group: 'advanced' },
  { key: 'after_doing',              label: 'After doing (-고 나서)',          korean: '-고 나서',      group: 'advanced' },
  { key: 'despite',                   label: 'Despite (-는데도)',               korean: '-는데도',       group: 'advanced' },
];

export const PATTERN_MAP = Object.fromEntries(PATTERN_DEFS.map(p => [p.key, p]));

// ─── Korean character helpers ───────────────────────────────────────

const INITIAL_CONSONANTS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const MEDIAL_VOWELS = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
const FINAL_CONSONANTS = ' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';

/** Decompose a single Hangul syllable into [initial, medial, final] indices */
function decompose(char: string): [number, number, number] | null {
  const code = char.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return null;
  const offset = code - 0xAC00;
  const final = offset % 28;
  const medial = ((offset - final) / 28) % 21;
  const initial = Math.floor(offset / (28 * 21));
  return [initial, medial, final];
}

/** Compose a Hangul syllable from indices */
function compose(initial: number, medial: number, final: number): string {
  return String.fromCharCode(0xAC00 + initial * 21 * 28 + medial * 28 + final);
}

/** Get last character of a string */
function lastChar(s: string): string {
  return s[s.length - 1] || '';
}

/** Check if the last syllable has a final consonant (받침) */
export function hasBatchim(s: string): boolean {
  const d = decompose(lastChar(s));
  return d !== null && d[2] !== 0;
}

/** Check if the final vowel of stem is 아 or 오 (for vowel harmony) */
export function isYangVowel(stem: string): boolean {
  // Walk backwards to find the last vowel
  for (let i = stem.length - 1; i >= 0; i--) {
    const d = decompose(stem[i]);
    if (d) {
      const vowelChar = MEDIAL_VOWELS[d[1]];
      return vowelChar === 'ㅏ' || vowelChar === 'ㅗ';
    }
  }
  return false;
}

/** Remove 받침 from the last syllable */
function removeBatchim(s: string): string {
  const d = decompose(lastChar(s));
  if (!d || d[2] === 0) return s;
  return s.slice(0, -1) + compose(d[0], d[1], 0);
}

/** Get the 받침 character */
function getBatchim(s: string): string {
  const d = decompose(lastChar(s));
  if (!d || d[2] === 0) return '';
  return FINAL_CONSONANTS[d[2]];
}

// ─── Irregular verb handling ────────────────────────────────────────

/** Common irregular verb stems (dictionary form minus 다) */
const IRREGULAR_B: Record<string, string> = {
  // ㅂ irregulars: 받침 ㅂ -> 우/오 before vowel endings
  '돕': '도와', '곱': '고와', '눕': '누워', '줍': '주워',
  '덥': '더워', '춥': '추워', '무섭': '무서워', '어렵': '어려워',
  '쉽': '쉬워', '귀엽': '귀여워', '아름답': '아름다워', '맵': '매워',
};

const IRREGULAR_D: Record<string, string> = {
  // ㄷ irregulars: 받침 ㄷ -> ㄹ before vowel endings
  '듣': '들', '걷': '걸', '묻': '물', '싣': '실',
};

const IRREGULAR_S: Record<string, string> = {
  // ㅅ irregulars: 받침 ㅅ drops before vowel endings
  '짓': '지', '낫': '나', '잇': '이', '붓': '부',
};

const IRREGULAR_H: Record<string, string> = {
  // ㅎ irregulars
  '그렇': '그래', '이렇': '이래', '저렇': '저래', '어떻': '어때',
  '빨갛': '빨개', '노랗': '노래', '파랗': '파래', '하얗': '하얘', '까맣': '까매',
};

const IRREGULAR_REU: Record<string, string> = {
  // 르 irregulars
  '모르': '몰라', '빠르': '빨라', '다르': '달라', '부르': '불러',
  '자르': '잘라', '고르': '골라', '누르': '눌러', '흐르': '흘러',
};

/** Apply irregular stem change for vowel-starting endings. Returns [modifiedStem, connector] */
export function applyIrregular(stem: string): { stem: string; isIrregular: boolean } {
  if (IRREGULAR_B[stem]) return { stem: IRREGULAR_B[stem], isIrregular: true };
  if (IRREGULAR_D[stem]) return { stem: IRREGULAR_D[stem], isIrregular: true };
  if (IRREGULAR_S[stem]) return { stem: IRREGULAR_S[stem], isIrregular: true };
  if (IRREGULAR_H[stem]) return { stem: IRREGULAR_H[stem], isIrregular: true };
  if (IRREGULAR_REU[stem]) return { stem: IRREGULAR_REU[stem], isIrregular: true };

  // ㄹ irregular: drop ㄹ before ㄴ, ㅂ, ㅅ — handled at conjugation site
  return { stem, isIrregular: false };
}

// ─── Core conjugation ───────────────────────────────────────────────

/** Get 아/어 connected form of a stem */
export function getAeForm(stem: string): string {
  // 하다 -> 해
  if (stem === '하' || stem.endsWith('하')) {
    return stem.slice(0, -1) + '해';
  }

  const irr = applyIrregular(stem);
  if (irr.isIrregular) return irr.stem;

  // Regular: add 아 or 어
  if (isYangVowel(stem)) {
    // If stem ends in 아 vowel with no batchim, just use stem (e.g. 가 -> 가)
    const d = decompose(lastChar(stem));
    if (d && d[2] === 0 && MEDIAL_VOWELS[d[1]] === 'ㅏ') return stem;
    return stem + '아';
  } else {
    const d = decompose(lastChar(stem));
    if (d && d[2] === 0 && MEDIAL_VOWELS[d[1]] === 'ㅓ') return stem;
    if (d && d[2] === 0 && MEDIAL_VOWELS[d[1]] === 'ㅡ') {
      // ㅡ contraction: 크 -> 커, 쓰 -> 써
      return stem.slice(0, -1) + compose(d[0], MEDIAL_VOWELS.indexOf('ㅓ'), 0);
    }
    if (d && d[2] === 0 && MEDIAL_VOWELS[d[1]] === 'ㅣ') {
      // ㅣ -> 여 (but only for 하 which is already handled)
      return stem + '어';
    }
    return stem + '어';
  }
}

/** Add (으) type suffix to a stem */
function addEuSuffix(stem: string, suffix: string): string {
  // ㄹ batchim: drop ㄹ for certain suffixes, or use without 으
  const batchim = getBatchim(stem);
  if (batchim === 'ㄹ') {
    return removeBatchim(stem) + suffix;
  }
  if (hasBatchim(stem)) {
    return stem + '으' + suffix;
  }
  return stem + suffix;
}

/**
 * Conjugate a verb stem to a target pattern.
 * @param stem Korean verb stem (dictionary form minus 다)
 * @param patternKey one of the PATTERN_DEFS keys
 * @returns conjugated string (just the verb part, not full sentence)
 */
export function conjugate(stem: string, patternKey: string): string {
  const ae = () => getAeForm(stem);

  switch (patternKey) {
    case 'informal_polite_present':
      return ae() + '요';

    case 'informal_polite_past':
      return ae() + (isYangVowel(ae()) ? 'ㅆ어요' : 'ㅆ어요');
      // Simplified: attach 았/었 as separate tiles

    case 'informal_polite_future': {
      if (getBatchim(stem) === 'ㄹ') return removeBatchim(stem) + 'ㄹ 거예요';
      return hasBatchim(stem) ? stem + '을 거예요' : stem + 'ㄹ 거예요';
    }

    case 'negative_present':
      return '안 ' + ae() + '요';

    case 'want_to':
      return stem + '고 싶어요';

    case 'can_do': {
      if (getBatchim(stem) === 'ㄹ') return removeBatchim(stem) + 'ㄹ 수 있어요';
      return hasBatchim(stem) ? stem + '을 수 있어요' : stem + 'ㄹ 수 있어요';
    }

    case 'progressive':
      return stem + '고 있어요';

    case 'imperative_polite':
      return addEuSuffix(stem, '세요');

    case 'lets_suggestive':
      return addEuSuffix(stem, 'ㅂ시다');

    case 'formal_present':
      return hasBatchim(stem) && getBatchim(stem) !== 'ㄹ'
        ? stem + '습니다'
        : (getBatchim(stem) === 'ㄹ' ? removeBatchim(stem) : stem) + 'ㅂ니다';

    case 'formal_past':
      return ae() + 'ㅆ습니다';

    case 'because_reason':
      return ae() + '서';

    case 'but_contrast':
      return stem + '지만';

    case 'if_conditional':
      return addEuSuffix(stem, '면');

    case 'when_time':
      if (getBatchim(stem) === 'ㄹ') return removeBatchim(stem) + 'ㄹ 때';
      return hasBatchim(stem) ? stem + '을 때' : stem + 'ㄹ 때';

    case 'try_experience':
      return ae() + ' 봐요';

    case 'must_obligation':
      return ae() + '야 해요';

    case 'should_not':
      return addEuSuffix(stem, '면') + ' 안 돼요';

    case 'passive_voice':
      return stem + '이다'; // simplified placeholder

    case 'causative':
      return stem + '이다'; // simplified placeholder

    case 'reported_speech':
      return stem + '다고 해요';

    case 'seems_like':
      return stem + '는 것 같아요';

    case 'plan_to':
      return addEuSuffix(stem, '려고') + ' 해요';

    case 'while_doing':
      return addEuSuffix(stem, '면서');

    case 'after_doing':
      return stem + '고 나서';

    case 'despite':
      return stem + '는데도';

    default:
      return stem;
  }
}

// ─── Sentence templates ─────────────────────────────────────────────

export interface SentenceTemplate {
  template: string;          // e.g. "{noun}을/를 {verb}"
  englishTemplate: string;   // e.g. "to {verb} {noun}"
}

export const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  { template: '{noun}을/를 {verb}', englishTemplate: '{verb} {noun}' },
  { template: '{noun}에 {verb}', englishTemplate: '{verb} to {noun}' },
  { template: '{noun}을/를 {verb}', englishTemplate: '{verb} the {noun}' },
];

/** Pick the correct object particle (을/를) based on batchim */
export function objectParticle(noun: string): string {
  return hasBatchim(noun) ? '을' : '를';
}
