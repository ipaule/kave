// jobs.js — canonical job list (EN, KO, extra aliases) + normalize() for free text.
// Shared by server (normalization) and browser (served as /jobs.json for autocomplete).

const RAW = [
  // tech
  ['Software Engineer', '소프트웨어 엔지니어', ['software developer', 'developer', 'programmer', 'coder', 'swe', 'sde', '개발자', '프로그래머', '소프트웨어 개발자']],
  ['Frontend Developer', '프론트엔드 개발자', ['front end', 'frontend engineer', 'web developer', '웹 개발자']],
  ['Backend Developer', '백엔드 개발자', ['back end', 'backend engineer', 'server developer']],
  ['Full-Stack Developer', '풀스택 개발자', ['full stack', 'fullstack']],
  ['Mobile App Developer', '모바일 앱 개발자', ['ios developer', 'android developer', 'app developer', '앱 개발자']],
  ['Game Developer', '게임 개발자', ['game designer', 'game programmer']],
  ['Data Scientist', '데이터 사이언티스트', ['data science', '데이터 과학자']],
  ['Data Analyst', '데이터 분석가', ['analyst', 'business analyst', 'bi analyst']],
  ['Data Engineer', '데이터 엔지니어', []],
  ['AI / ML Engineer', 'AI 엔지니어', ['machine learning engineer', 'ml engineer', 'ai engineer', '인공지능', '머신러닝']],
  ['DevOps Engineer', '데브옵스 엔지니어', ['sre', 'site reliability', 'cloud engineer', 'devops']],
  ['Cybersecurity Specialist', '보안 전문가', ['security engineer', 'cyber security', 'hacker', '정보보안']],
  ['IT Support', 'IT 지원', ['it technician', 'help desk', 'it', '전산']],
  ['Network Engineer', '네트워크 엔지니어', []],
  ['QA Engineer', 'QA 엔지니어', ['tester', 'quality assurance', '테스터']],
  ['Product Manager', '프로덕트 매니저', ['pm', 'product owner', '기획자', '서비스 기획']],
  ['Project Manager', '프로젝트 매니저', ['program manager', 'pmo']],
  ['UX / UI Designer', 'UX/UI 디자이너', ['ux designer', 'ui designer', 'product designer', 'web designer']],
  ['Graphic Designer', '그래픽 디자이너', ['designer', '디자이너']],
  ['Hardware Engineer', '하드웨어 엔지니어', ['electrical engineer', 'electronics engineer', '전자 엔지니어', '전기 엔지니어']],
  // engineering
  ['Mechanical Engineer', '기계 엔지니어', ['기계공학']],
  ['Civil Engineer', '토목 엔지니어', ['structural engineer', '토목']],
  ['Chemical Engineer', '화학 엔지니어', []],
  ['Aerospace Engineer', '항공우주 엔지니어', ['aeronautical engineer']],
  ['Biomedical Engineer', '의공학 엔지니어', ['bioengineer']],
  ['Industrial Engineer', '산업공학 엔지니어', ['manufacturing engineer']],
  ['Engineer', '엔지니어', ['엔지니어', '공학자']],
  ['Architect', '건축가', ['건축']],
  ['Interior Designer', '인테리어 디자이너', ['interior']],
  // health
  ['Doctor', '의사', ['physician', 'md', '의사']],
  ['Surgeon', '외과 의사', []],
  ['Nurse', '간호사', ['rn', 'registered nurse', 'nurse practitioner', 'np']],
  ['Pharmacist', '약사', ['pharmacy']],
  ['Dentist', '치과의사', ['dental']],
  ['Dental Hygienist', '치위생사', []],
  ['Physical Therapist', '물리치료사', ['pt', 'physiotherapist']],
  ['Occupational Therapist', '작업치료사', ['ot']],
  ['Psychologist', '심리학자', ['psychology']],
  ['Therapist / Counselor', '상담사', ['counselor', 'therapist', 'mental health', '상담', '심리상담사']],
  ['Veterinarian', '수의사', ['vet']],
  ['Optometrist', '검안사', []],
  ['Medical Researcher', '의학 연구원', ['researcher', 'scientist', '연구원']],
  ['Physician Assistant', 'PA', ['pa']],
  ['Paramedic / EMT', '응급구조사', ['emt', 'paramedic']],
  ['Healthcare Administrator', '병원 행정', ['hospital admin']],
  ['Caregiver', '요양보호사', ['care worker', 'home health aide', '간병인']],
  ['Medical Technician', '임상병리사', ['lab technician', 'radiology tech', '방사선사']],
  // education
  ['Teacher', '교사', ['선생님', 'educator', 'elementary teacher', 'high school teacher']],
  ['Professor', '교수', ['lecturer', 'faculty', '강사']],
  ['Tutor', '과외 선생님', ['학원 강사', 'instructor']],
  ['School Counselor', '학교 상담사', []],
  ['Principal / School Admin', '교장 / 교육 행정', ['principal']],
  ['Student', '학생', ['college student', 'grad student', 'undergrad', '대학생', '대학원생']],
  ['Researcher', '연구원', ['research scientist', 'phd', '박사']],
  ['Scientist', '과학자', ['biologist', 'chemist', 'physicist']],
  // business
  ['Accountant', '회계사', ['cpa', '회계', 'bookkeeper']],
  ['Financial Analyst', '재무 분석가', ['finance', '재무']],
  ['Investment Banker', '투자 은행가', ['ib', 'banker', '은행원']],
  ['Financial Advisor', '재무 설계사', ['financial planner', 'wealth manager']],
  ['Actuary', '보험계리사', []],
  ['Insurance Agent', '보험 설계사', ['insurance']],
  ['Real Estate Agent', '부동산 중개인', ['realtor', 'real estate', '부동산']],
  ['Consultant', '컨설턴트', ['management consultant', 'strategy consultant']],
  ['Marketing Manager', '마케터', ['marketing', 'marketer', 'digital marketing', '마케팅']],
  ['Sales', '영업', ['sales representative', 'account executive', 'salesperson', '세일즈']],
  ['Human Resources', '인사 담당자', ['hr', 'recruiter', 'talent acquisition', '인사', 'HR']],
  ['Operations Manager', '운영 매니저', ['operations', 'ops']],
  ['Supply Chain / Logistics', '물류 / 공급망', ['logistics', 'supply chain', '물류']],
  ['Administrative Assistant', '사무 보조', ['office manager', 'secretary', 'receptionist', '비서', '사무직']],
  ['Office Worker', '회사원', ['회사원', '직장인', 'employee']],
  ['Business Owner', '사업가', ['entrepreneur', 'founder', 'ceo', 'self-employed', '자영업', '창업가', '사장']],
  ['Startup Founder', '스타트업 창업자', ['startup']],
  ['Executive', '임원', ['director', 'vp', 'manager', '관리자']],
  ['Customer Service', '고객 서비스', ['customer support', 'call center', 'cs']],
  ['Retail', '판매직', ['cashier', 'store manager', 'retail associate', '매장']],
  ['Economist', '경제학자', []],
  // law & public
  ['Lawyer', '변호사', ['attorney', 'legal', 'counsel', '법조인']],
  ['Paralegal', '법률 보조원', []],
  ['Judge', '판사', []],
  ['Police Officer', '경찰관', ['police', 'cop', 'law enforcement', '경찰']],
  ['Firefighter', '소방관', []],
  ['Military', '군인', ['army', 'navy', 'air force', 'marine', 'soldier', '군']],
  ['Government / Public Servant', '공무원', ['civil servant', 'government', 'public sector', '공무원']],
  ['Social Worker', '사회복지사', ['social work', '사회복지']],
  ['Nonprofit', '비영리 단체', ['ngo', 'non-profit', 'charity']],
  ['Politician', '정치인', []],
  ['Diplomat', '외교관', []],
  // ministry
  ['Pastor', '목사', ['minister', 'reverend', '목회자', '전도사']],
  ['Missionary', '선교사', ['mission']],
  ['Worship Leader', '찬양 인도자', ['worship']],
  ['Church Staff', '교회 사역자', ['ministry', 'youth pastor', '간사', '사역자']],
  ['Chaplain', '군목 / 원목', []],
  // creative & media
  ['Artist', '예술가', ['painter', 'illustrator', '화가', '일러스트레이터']],
  ['Musician', '음악가', ['singer', 'composer', 'pianist', '가수', '작곡가']],
  ['Music Teacher', '음악 선생님', ['piano teacher']],
  ['Actor', '배우', ['actress', 'performer']],
  ['Dancer', '댄서', []],
  ['Writer / Author', '작가', ['author', 'writer', 'novelist', 'copywriter']],
  ['Journalist', '기자', ['reporter', 'news']],
  ['Editor', '편집자', []],
  ['Photographer', '사진작가', ['photo']],
  ['Videographer / Filmmaker', '영상 제작자', ['filmmaker', 'video editor', 'director', '영상', 'pd', '감독']],
  ['Content Creator', '콘텐츠 크리에이터', ['youtuber', 'influencer', 'streamer', '유튜버', '크리에이터']],
  ['Animator', '애니메이터', ['3d artist', 'motion designer']],
  ['Fashion Designer', '패션 디자이너', ['fashion']],
  ['Translator / Interpreter', '번역가 / 통역사', ['translator', 'interpreter', '번역', '통역']],
  ['Public Relations', '홍보', ['pr', 'communications']],
  // trades & service
  ['Chef / Cook', '요리사', ['chef', 'cook', '셰프']],
  ['Baker', '제빵사', ['pastry']],
  ['Barista', '바리스타', ['coffee']],
  ['Restaurant Owner', '식당 사장', ['restaurant']],
  ['Server / Hospitality', '서비스업', ['waiter', 'waitress', 'hotel', 'hospitality']],
  ['Flight Attendant', '승무원', ['cabin crew']],
  ['Pilot', '조종사', ['파일럿']],
  ['Electrician', '전기 기사', []],
  ['Plumber', '배관공', []],
  ['Carpenter', '목수', []],
  ['Construction', '건설업', ['contractor', 'construction worker', '건설']],
  ['Mechanic', '정비사', ['auto mechanic', 'technician']],
  ['Truck Driver', '운전기사', ['driver', 'delivery', '택배', '배달']],
  ['Hair Stylist', '미용사', ['hairdresser', 'barber', '헤어 디자이너']],
  ['Makeup Artist', '메이크업 아티스트', []],
  ['Nail Technician', '네일 아티스트', ['nail']],
  ['Esthetician', '피부 관리사', ['skincare']],
  ['Personal Trainer', '퍼스널 트레이너', ['fitness trainer', 'coach', 'trainer', '트레이너']],
  ['Athlete', '운동선수', ['sports', 'athlete', '선수']],
  ['Farmer', '농부', ['agriculture']],
  ['Florist', '플로리스트', []],
  ['Manufacturing', '제조업', ['factory', 'production']],
  // other
  ['Homemaker', '주부', ['stay at home parent', 'stay at home mom', 'housewife', '전업주부']],
  ['Retired', '은퇴', ['retiree', '은퇴자']],
  ['Job Seeker', '구직 중', ['unemployed', 'looking for work', '취준생', '취업 준비']],
  ['Freelancer', '프리랜서', ['freelance', 'contractor']],
  ['Volunteer', '봉사자', []],
];

const JOBS = RAW.map(([en, ko, aliases]) => ({ en, ko, aliases }));

const squash = (s) => String(s || '').toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

// alias/en/ko (squashed) -> canonical en
const INDEX = new Map();
for (const j of JOBS) for (const t of [j.en, j.ko, ...j.aliases]) {
  const k = squash(t);
  if (k && !INDEX.has(k)) INDEX.set(k, j.en);
}
const BY_EN = new Map(JOBS.map((j) => [j.en, j]));

function lev(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

const titleCase = (s) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

// Free text -> canonical key (EN name). Empty -> null.
function normalize(text) {
  const q = squash(text);
  if (!q) return null;
  if (INDEX.has(q)) return INDEX.get(q);
  // fuzzy: closest alias within ~20% edits (min 1, max 3)
  let best = null, bestD = Infinity;
  const limit = Math.min(3, Math.max(1, Math.floor(q.length * 0.2)));
  for (const [k, en] of INDEX) {
    if (Math.abs(k.length - q.length) > limit) continue;
    const d = lev(q, k);
    if (d < bestD) { bestD = d; best = en; }
  }
  if (best && bestD <= limit) return best;
  return titleCase(q).slice(0, 60);
}

module.exports = { JOBS, normalize, BY_EN };
