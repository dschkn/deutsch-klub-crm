import { useState, useCallback, useRef, useEffect } from 'react';
import { DataStore } from '../data/store';
import { useNavigate } from 'react-router-dom';

export interface SearchResult {
  id: string;
  type: 'student' | 'group' | 'teacher';
  name: string;
  subtitle: string;
  route: string;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const store = DataStore.getInstance();
    const lower = q.toLowerCase();
    const found: SearchResult[] = [];

    store.getAllStudents().forEach(s => {
      if (s.fullName.toLowerCase().includes(lower) ||
          s.phones.some(p => p.includes(q)) ||
          s.emails.some(e => e.toLowerCase().includes(lower))) {
        found.push({
          id: s.id,
          type: 'student',
          name: s.fullName,
          subtitle: `${s.language} ${s.level}`,
          route: '/students',
        });
      }
    });

    store.getAllGroups().forEach(g => {
      if (g.name.toLowerCase().includes(lower) ||
          g.code.toLowerCase().includes(lower)) {
        found.push({
          id: g.id,
          type: 'group',
          name: g.name,
          subtitle: `${g.language} ${g.level} — ${g.teacherName}`,
          route: '/groups',
        });
      }
    });

    store.getAllTeachers().forEach(t => {
      if (t.fullName.toLowerCase().includes(lower)) {
        found.push({
          id: t.id,
          type: 'teacher',
          name: t.fullName,
          subtitle: t.languages.join(', '),
          route: '/teachers',
        });
      }
    });

    setResults(found.slice(0, 10));
    setIsOpen(found.length > 0);
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 200);
  }, [search]);

  const selectResult = useCallback((result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'student') {
      localStorage.setItem('open_student_id', result.id);
    }
    navigate(result.route);
  }, [navigate]);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { query, results, isOpen, handleQueryChange, selectResult, close };
}
