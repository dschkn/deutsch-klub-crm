import { useSyncExternalStore } from 'react';
import { extractTemplateVariables, urlToBase64 } from '../lib/docxTemplate';

export type Lang = 'ru' | 'de' | 'en';
export type GroupCategory = 'standard' | 'mini' | 'special' | 'individual';
export type AgeBracket = 'child' | 'teen' | 'adult';

export interface ContractTemplate {
  id: string;
  name: string;
  fileName: string;
  language: Lang;
  groupCategories: GroupCategory[];
  ageBrackets: AgeBracket[];
  sortOrder: number;
  fileBase64?: string;
  fields: string[];
  loops: string[];
  createdAt: Date;
}

export const languageConfig: Record<Lang, { label: string; color: string }> = {
  ru: { label: 'Русский', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  de: { label: 'Немецкий', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  en: { label: 'Английский', color: 'bg-green-50 text-green-700 border-green-200' },
};

export const groupCategoryConfig: Record<GroupCategory, { label: string; color: string }> = {
  standard: { label: 'Стандартные', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  mini: { label: 'Мини', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  special: { label: 'Спецкурсы', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  individual: { label: 'Индивы', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export const ageBracketConfig: Record<AgeBracket, { label: string }> = {
  child: { label: 'До 14 лет' },
  teen: { label: '14-17 лет' },
  adult: { label: 'Взрослые' },
};

export const fieldLabels: Record<string, string> = {
  currentDate: 'Дата договора',
  number: 'Номер договора',
  studentFIO: 'ФИО ученика',
  studentDate: 'Дата рождения ученика',
  passport: 'Паспорт (серия, номер)',
  passportWho: 'Кем и когда выдан',
  address: 'Адрес регистрации',
  email: 'Email',
  phone: 'Телефон',
  level: 'Уровень',
  volume: 'Объём курса (ак. часов)',
  duration: 'Длительность занятия (ак. часов)',
  price: 'Стоимость',
  admin: 'Администратор',
  proxy: 'Представитель по доверенности',
  parentFIO: 'ФИО родителя',
  parentDate: 'Дата рождения родителя',
  parentPassport: 'Паспорт родителя',
  parentPassportWho: 'Кем и когда выдан (родитель)',
  parentAddress: 'Адрес регистрации родителя',
  parentEmail: 'Email родителя',
  parentPhone: 'Телефон родителя',
};

export const loopLabels: Record<string, string> = {
  days: 'График занятий',
  months: 'Месяцы занятий',
  dates: 'Даты занятий',
};

export function fieldLabel(key: string): string {
  if (fieldLabels[key]) return fieldLabels[key];
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

const REAL_TEMPLATE_URL = '/templates/contract_adult_ru.docx';

const initialTemplates: ContractTemplate[] = [
  {
    id: '1',
    name: 'Договор обучения (взрослые)',
    fileName: 'contract_adult_ru.docx',
    language: 'en',
    groupCategories: ['standard', 'mini'],
    ageBrackets: ['adult'],
    sortOrder: 1,
    fields: ['currentDate', 'number', 'studentFIO', 'studentDate', 'passport', 'passportWho', 'address', 'email', 'phone', 'level', 'volume', 'duration', 'price'],
    loops: ['days', 'months', 'dates'],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Договор обучения (дети)',
    fileName: 'contract_child_ru.docx',
    language: 'ru',
    groupCategories: ['standard', 'mini'],
    ageBrackets: ['child', 'teen'],
    sortOrder: 2,
    fields: ['currentDate', 'number', 'studentFIO', 'studentDate', 'parentFIO', 'parentDate', 'parentPassport', 'parentPhone', 'level', 'volume', 'price', 'admin'],
    loops: [],
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Vertrag (Erwachsene)',
    fileName: 'contract_adult_de.docx',
    language: 'de',
    groupCategories: ['standard'],
    ageBrackets: ['adult'],
    sortOrder: 3,
    fields: ['currentDate', 'number', 'studentFIO', 'email', 'phone', 'level', 'volume', 'price'],
    loops: [],
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '4',
    name: 'Договор индивидуальное обучение',
    fileName: 'contract_individual_ru.docx',
    language: 'ru',
    groupCategories: ['individual'],
    ageBrackets: ['adult', 'teen'],
    sortOrder: 4,
    fields: ['currentDate', 'number', 'studentFIO', 'email', 'phone', 'level', 'duration', 'price'],
    loops: [],
    createdAt: new Date('2024-02-10'),
  },
  {
    id: '5',
    name: 'Договор спецкурс',
    fileName: 'contract_special_ru.docx',
    language: 'ru',
    groupCategories: ['special'],
    ageBrackets: ['adult'],
    sortOrder: 5,
    fields: ['currentDate', 'number', 'studentFIO', 'email', 'phone', 'level', 'volume', 'price'],
    loops: [],
    createdAt: new Date('2024-03-01'),
  },
];

let templates: ContractTemplate[] = initialTemplates;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getTemplates(): ContractTemplate[] {
  return templates;
}

export function setTemplates(updater: (prev: ContractTemplate[]) => ContractTemplate[]) {
  templates = updater(templates);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useContractTemplates(): ContractTemplate[] {
  return useSyncExternalStore(subscribe, getTemplates);
}

export function addTemplate(template: ContractTemplate) {
  setTemplates((prev) => [...prev, template].sort((a, b) => a.sortOrder - b.sortOrder));
}

export function updateTemplate(id: string, patch: Partial<ContractTemplate>) {
  setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
}

export function duplicateTemplate(id: string) {
  setTemplates((prev) => {
    const source = prev.find((t) => t.id === id);
    if (!source) return prev;
    const copy: ContractTemplate = {
      ...source,
      id: Date.now().toString(),
      name: `${source.name} (копия)`,
      sortOrder: Math.max(...prev.map((t) => t.sortOrder)) + 1,
      createdAt: new Date(),
    };
    return [...prev, copy].sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

export function removeTemplate(id: string) {
  setTemplates((prev) => prev.filter((t) => t.id !== id));
}

let realTemplateLoadStarted = false;

/** Fetches the bundled real contract file once and hydrates template '1' with its real variables. */
export function ensureRealTemplateLoaded() {
  if (realTemplateLoadStarted) return;
  realTemplateLoadStarted = true;
  urlToBase64(REAL_TEMPLATE_URL)
    .then((base64) => {
      const { fields, loops } = extractTemplateVariables(base64);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === '1'
            ? { ...t, fileBase64: base64, fields: fields.length ? fields : t.fields, loops: loops.length ? loops : t.loops }
            : t
        )
      );
    })
    .catch(() => {
      // реального файла может не быть в деплое — шаблон останется демонстрационным
    });
}
