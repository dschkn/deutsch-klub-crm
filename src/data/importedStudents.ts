import type { Student } from '../types';
import { demoScheduleAugust2026 } from './demoScheduleAugust2026';

const levelCycle: Student['currentLevel'][] = ['A1', 'A1', 'A2', 'A2', 'B1', 'B1', 'B2', 'C1'];
const sources = ['instagram', 'vk', 'google', 'referral', 'website', 'yandex'];
const days = [
  ['Пн', 'Ср'],
  ['Вт', 'Чт'],
  ['Пн', 'Чт'],
  ['Ср', 'Пт'],
  ['Вт', 'Сб'],
];
const times = [['10:00'], ['12:00'], ['18:00'], ['19:00'], ['19:30']];
const motivations = [
  'Готовится к поступлению в Studienkolleg, планирует сдавать B2 весной.',
  'Живёт в Германии, нужен уверенный язык для работы и бытового общения.',
  'Переезжает по работе; важны разговорная практика и деловая переписка.',
  'Готовится к Goethe-Zertifikat, просит больше заданий на аудирование.',
  'Учится в университете, нужен немецкий для обменной программы.',
  'Хочет восстановить язык после перерыва и дойти до уровня B1.',
  'Занимается для себя; предпочитает спокойный темп и вечерние занятия.',
  'Планирует семейный переезд, нужна системная грамматика и разговорная практика.',
];
const adminNotes = [
  'Лучше писать в мессенджер после 17:00. Расписание подтверждает заранее.',
  'На первой консультации договорились начать с повторения предыдущего уровня.',
  'Иногда уезжает в командировки; при переносе предупреждает за два дня.',
  'Просит присылать счёт за неделю до начала следующего учебного блока.',
  'Пробное занятие прошло хорошо, формат группы подходит.',
  'Контакт для организационных вопросов — только вымышленный номер из карточки.',
];

const fillerFirstNames = [
  'Аделина', 'Алексей', 'Алиса', 'Андрей', 'Анна', 'Арина', 'Артём', 'Валерия',
  'Варвара', 'Вера', 'Виктор', 'Георгий', 'Дарья', 'Даниил', 'Ева', 'Егор',
  'Елена', 'Игорь', 'Инна', 'Кира', 'Константин', 'Лада', 'Леонид', 'Лидия',
  'Максим', 'Марина', 'Матвей', 'Михаил', 'Надежда', 'Никита', 'Нина', 'Олег',
];
const fillerLastNames = [
  'Агеева', 'Белов', 'Воронова', 'Гринев', 'Доброва', 'Ельцов', 'Журавлёва', 'Зверева',
  'Иволгин', 'Калинина', 'Лаврова', 'Мещерякова', 'Нечаев', 'Ольхов', 'Пермина', 'Ракитин',
  'Селиванова', 'Терехов', 'Уварова', 'Федин', 'Хвойная', 'Цветкова', 'Чернов', 'Шевцова',
  'Щеглов', 'Юдина', 'Яров', 'Баженов', 'Вересов', 'Горина', 'Дубов', 'Ермолаева',
];

function cleanScheduleName(value: string): string {
  return value
    .replace(/\s*\(\s*\d+\s*\/\s*\d+\s*\)\s*$/, '')
    .replace(/\s+(?:тест|проб\+конс)\s*$/i, '')
    .trim();
}

const scheduleIdentityMap = new Map<string, { id: string; name: string; language: Student['language'] }>();
demoScheduleAugust2026.forEach(item => {
  if (!item.studentId || !item.studentName || scheduleIdentityMap.has(item.studentId)) return;
  scheduleIdentityMap.set(item.studentId, {
    id: item.studentId,
    name: cleanScheduleName(item.studentName),
    language: item.groupLanguage === 'English' ? 'English' : 'German',
  });
});

const identities = Array.from(scheduleIdentityMap.values());
let fillerIndex = 0;
while (identities.length < 96) {
  const firstName = fillerFirstNames[fillerIndex % fillerFirstNames.length];
  const lastName = fillerLastNames[(fillerIndex * 7 + 3) % fillerLastNames.length];
  const name = `${firstName} ${lastName}`;
  if (!identities.some(identity => identity.name === name)) {
    identities.push({
      id: `student-demo-${String(identities.length + 1).padStart(3, '0')}`,
      name,
      language: fillerIndex % 9 === 0 ? 'English' : 'German',
    });
  }
  fillerIndex += 1;
}

// A deterministic, fully fictional cohort. Reserved 555 numbers and example.com
// addresses make it safe to keep this data in the public demo repository.
export const importedStudents: Student[] = identities.slice(0, 96).map((identity, index) => {
  const language = identity.language;
  const currentLevel = levelCycle[(index * 3 + (language === 'English' ? 1 : 0)) % levelCycle.length];
  const status: Student['status'] = index < 76
    ? 'active'
    : index < 84
      ? 'frozen'
      : index < 91
        ? 'inactive'
        : 'graduated';
  const paymentStatus: Student['paymentStatus'] = index % 11 === 0
    ? 'overdue'
    : index % 4 === 0
      ? 'pending'
      : 'paid';
  const joinMonth = index % 8;
  const joinDay = 2 + (index * 5) % 24;

  return {
    id: identity.id,
    name: identity.name,
    phone: `+1 202-555-${String(2000 + index).padStart(4, '0')}`,
    email: `student${String(index + 1).padStart(3, '0')}@example.com`,
    currentLevel,
    language,
    status,
    paymentStatus,
    joinDate: new Date(2026, joinMonth, joinDay),
    balance: paymentStatus === 'overdue' ? -12500 : paymentStatus === 'pending' ? -6500 : 0,
    notes: `${motivations[index % motivations.length]} ${adminNotes[(index * 3) % adminNotes.length]}`,
    birthDate: new Date(1988 + (index % 18), (index * 7) % 12, 1 + (index * 11) % 27),
    profession: ['Дизайнер', 'Инженер', 'Студент', 'Аналитик', 'Врач', 'Маркетолог'][index % 6],
    howDidYouKnow: sources[index % sources.length],
    discounts: index % 10 === 0 ? '5% по рекомендации' : '',
    days: days[index % days.length],
    times: times[index % times.length],
    format: index % 3 === 0 ? 'offline' : 'online',
    isFriendForFriend: index % 13 === 0,
    germanLevel: language === 'German' ? currentLevel : undefined,
    englishLevel: language === 'English' ? currentLevel : undefined,
    communications: [
      {
        id: `student-note-${index + 1}`,
        type: 'note',
        content: adminNotes[(index * 3) % adminNotes.length],
        createdAt: new Date(2026, 7, 4 + (index % 14), 11 + (index % 6), 15),
      },
    ],
  };
});
