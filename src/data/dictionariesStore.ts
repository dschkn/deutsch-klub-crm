import { useSyncExternalStore } from 'react';

export interface DictionaryItem {
  id: string;
  value: string;
  sortOrder: number;
}

export interface Dictionary {
  id: string;
  name: string;
  items: DictionaryItem[];
}

function items(values: string[]): DictionaryItem[] {
  return values.map((value, index) => ({
    id: String(index + 1),
    value,
    sortOrder: index + 1,
  }));
}

const initialDictionaries: Dictionary[] = [
  {
    id: 'duration',
    name: 'Длительность занятий',
    items: items([
      '1 ак.ч', '2 ак.ч', '3 ак.ч', '4 ак.ч', '5 ак.ч',
      '1 астр.ч', '2 астр.ч', '3 астр.ч', '4 астр.ч', '5 астр.ч',
    ]),
  },
  {
    id: 'levels',
    name: 'Уровни',
    items: items([
      'A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2',
      'B1+ 1 часть', 'B1+ 2 часть',
      'B2.1', 'B2.2', 'B2.3', 'B2.4', 'B2.5', 'B2',
      'C1 sicher', 'C1.1 sicher', 'C1.2 sicher', 'C1.3 sicher', 'C1.4 sicher',
      'C1', 'C1.1', 'C1.2', 'C1.3', 'C1.4', 'C1.5',
      'C1+', 'C1.1+', 'C1.2+', 'C1.3+', 'C1.4+', 'C1.5+',
    ]),
  },
  {
    id: 'professions',
    name: 'Профессии',
    items: items(['IT-специалист', 'Менеджер', 'Студент', 'Педагог', 'Медработник']),
  },
  {
    id: 'rejection_reasons',
    name: 'Причины отказа',
    items: items(['Высокая цена', 'Неудобное расписание', 'Выбрал другого', 'Нет времени']),
  },
  {
    id: 'sources',
    name: 'Откуда узнали',
    items: items([
      'VK', 'Instagram', 'ТГ', 'Google поиск', 'Google карты',
      'Яндекс поиск', 'Яндекс реклама (директ)', 'Сарафанное радио',
      'Муж/Жена учатся', 'Дети учатся', 'Знакомые',
    ]),
  },
  {
    id: 'course_types',
    name: 'Типы спецкурсов',
    items: items([
      'Стандартный', 'Мини', 'Грамматика', 'Искусство', '7 споров',
      'Фонетика', 'Чтение', 'Разговорный клуб', 'Открытый урок',
    ]),
  },
  {
    id: 'holidays',
    name: 'Выходные',
    items: items(['1 января - Новый год', '8 марта', '9 мая']),
  },
  {
    id: 'task_templates',
    name: 'Шаблоны задач',
    items: items(['Позвонить клиенту', 'Отправить материалы', 'Подготовить договор']),
  },
  {
    id: 'audiences',
    name: 'Аудитории',
    items: items([
      'Офис', '2 ауд', '3 ауд', '4 ауд', '5 ауд',
      'Zoom 1', 'Zoom 2', 'Zoom 3', 'Zoom 4', 'Zoom 5', 'Zoom 6', 'Zoom 7', 'Zoom 8',
      'Свой Zoom',
    ]),
  },
  {
    id: 'textbooks',
    name: 'Учебники',
    items: items([
      // Немецкий — взрослые (Schritte International Neu → Aspekte/Sicher/Mittelpunkt)
      'SIN 1', 'SIN 2', 'SIN 3', 'SIN 4', 'SIN 5', 'SIN 6',
      'Aspekte B1+ Neu', 'Aspekte B2 Neu (5 модулей)', 'Sicher (4 модуля)',
      'Aspekte C1 Neu (5 модулей)', 'Mittelpunkt Neu C1 (4 модуля)',
      // Немецкий — югенд
      'Deutsch.com A1', 'Deutsch.com A2', 'Deutsch.com B1',
      // Немецкий — дети
      'Deutschprofis A1', 'Deutschprofis A2',
      // Английский — взрослые (Language Hub)
      'LH A1 beginner', 'LH A2 elementary', 'LH B1 pre-intermediate',
      'LH B1+ intermediate', 'LH B2 upper-intermediate', 'LH C1 Advanced',
      // Английский — школьники
      'Beyond A1+ Elementary', 'Beyond A2+ Pre-intermediate', 'Beyond B1 intermediate',
      'Beyond B2 Upper-intermediate', 'Speakout 2nd ed. Advanced Plus',
      // Английский — дети
      'Kids Box 1', 'Kids Box 3', 'Kids Box 4',
    ]),
  },
];

let dictionaries: Dictionary[] = initialDictionaries;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function getDictionaries(): Dictionary[] {
  return dictionaries;
}

export function setDictionaries(updater: (prev: Dictionary[]) => Dictionary[]) {
  dictionaries = updater(dictionaries);
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDictionaries(): Dictionary[] {
  return useSyncExternalStore(subscribe, getDictionaries, getDictionaries);
}

/** Convenience: just the (sorted) values of one dictionary, e.g. for a <Select>'s options. */
export function useDictionaryValues(dictionaryId: string): string[] {
  const all = useDictionaries();
  const dict = all.find((d) => d.id === dictionaryId);
  if (!dict) return [];
  return [...dict.items].sort((a, b) => a.sortOrder - b.sortOrder).map((i) => i.value);
}

export function addDictionaryItem(dictionaryId: string, value: string) {
  setDictionaries((prev) =>
    prev.map((d) =>
      d.id === dictionaryId
        ? {
            ...d,
            items: [
              ...d.items,
              {
                id: `${Date.now()}`,
                value,
                sortOrder: d.items.length + 1,
              },
            ],
          }
        : d
    )
  );
}

export function updateDictionaryItem(dictionaryId: string, itemId: string, value: string) {
  setDictionaries((prev) =>
    prev.map((d) =>
      d.id === dictionaryId
        ? { ...d, items: d.items.map((i) => (i.id === itemId ? { ...i, value } : i)) }
        : d
    )
  );
}

export function removeDictionaryItem(dictionaryId: string, itemId: string) {
  setDictionaries((prev) =>
    prev.map((d) =>
      d.id === dictionaryId ? { ...d, items: d.items.filter((i) => i.id !== itemId) } : d
    )
  );
}
