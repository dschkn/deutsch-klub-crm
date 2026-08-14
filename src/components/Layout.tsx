import { useState, type ComponentProps, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  GraduationCap as StudentIcon,
  UsersRound as GroupIcon,
  CheckSquare,
  BookOpen as TeacherIcon,
  Calendar,
  CalendarClock,
  CreditCard,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  Bell,
  Search,
  FileText,
  Shield,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useCurrentUser } from '../hooks/use-auth';
import { useGlobalSearch } from '../hooks/use-search';

const primaryNavigation = [
  { name: 'Главная', href: '/', icon: LayoutDashboard },
  { name: 'Клиенты', href: '/students', icon: StudentIcon },
  { name: 'Группы', href: '/groups', icon: GroupIcon },
  { name: 'Задачи', href: '/tasks', icon: CheckSquare },
  { name: 'Преподаватели', href: '/teachers', icon: TeacherIcon },
  { name: 'Расписание', href: '/teacher-schedule', icon: Calendar },
  { name: 'Администраторы', href: '/admin-schedule', icon: CalendarClock },
  { name: 'Договоры', href: '/contracts', icon: FileText },
  { name: 'Справочники', href: '/dictionaries', icon: TeacherIcon },
  { name: 'Оплаты', href: '/payments', icon: CreditCard },
  { name: 'Отчёты', href: '/reports', icon: BarChart3 },
];

const systemNavigation = [
  { name: 'Права доступа', href: '/permissions', icon: Shield },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();
  const { user } = useCurrentUser();
  const userName = user?.fullName || 'Пользователь';
  const userRole = user?.role || '';
  const userInitials = userName.split(' ').map((name) => name[0]).join('').slice(0, 2);

  const renderNavigation = (items: typeof primaryNavigation) => items.map((item) => {
    const isActive = location.pathname === item.href
      || (item.href !== '/' && location.pathname.startsWith(item.href));

    return (
      <Link
        key={item.name}
        to={item.href}
        title={collapsed ? item.name : undefined}
        className={cn(
          'group flex min-h-10 items-center rounded-full text-sm font-medium transition-[background-color,color,box-shadow] duration-150',
          collapsed ? 'justify-center px-2' : 'gap-3 px-3.5',
          isActive
            ? 'bg-white text-slate-950 shadow-[0_2px_12px_rgba(15,23,42,0.07)]'
            : 'text-slate-600 hover:bg-white/60 hover:text-slate-950'
        )}
      >
        <item.icon className="h-[18px] w-[18px] flex-shrink-0 text-current" strokeWidth={1.8} />
        {!collapsed && <span className="truncate">{item.name}</span>}
      </Link>
    );
  });

  return (
    <aside
      className={cn(
        'app-sidebar fixed left-0 top-0 z-40 flex h-screen flex-col transition-[width] duration-300 will-change-[width]',
        collapsed ? 'w-[76px]' : 'w-64'
      )}
    >
      <div className={cn('flex h-[76px] flex-shrink-0 items-center', collapsed ? 'justify-center px-3' : 'justify-between px-5')}>
        <Link to="/" className="flex min-w-0 items-center">
          {collapsed ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-slate-950 text-xs font-semibold tracking-wide text-white shadow-sm">
              DK
            </span>
          ) : (
            <img src="/logo-deutsch-klub.svg" alt="Deutsch-Klub" className="h-11 w-auto max-w-[176px]" />
          )}
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 rounded-full p-0 text-slate-500 hover:bg-white/70 hover:text-slate-950"
            onClick={() => setCollapsed(true)}
            aria-label="Свернуть меню"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {collapsed && (
        <Button
          variant="ghost"
          size="sm"
          className="mx-auto mb-2 h-8 w-8 flex-shrink-0 rounded-full p-0 text-slate-500 hover:bg-white/70 hover:text-slate-950"
          onClick={() => setCollapsed(false)}
          aria-label="Развернуть меню"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {!collapsed && (
          <p className="mb-2 px-3 pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            Главное меню
          </p>
        )}
        <div className="space-y-1">{renderNavigation(primaryNavigation)}</div>

        <div className="my-4 h-px bg-slate-900/[0.06]" />
        {!collapsed && (
          <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
            Система
          </p>
        )}
        <div className="space-y-1">{renderNavigation(systemNavigation)}</div>
      </nav>

      <div className={cn('flex-shrink-0 p-3', collapsed ? 'flex justify-center' : '')}>
        <div className={cn('flex items-center rounded-2xl border border-white/70 bg-white/55', collapsed ? 'justify-center p-1.5' : 'gap-3 p-2.5')}>
          <Avatar className="h-9 w-9 ring-1 ring-white">
            <AvatarImage src={user?.avatar} alt={userName} />
            <AvatarFallback className="bg-slate-950 text-xs text-white">{userInitials}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{userName}</p>
              <p className="truncate text-xs text-slate-500">{userRole}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ChevronRight(props: ComponentProps<typeof ChevronLeft>) {
  return <ChevronLeft {...props} className={cn('rotate-180', props.className)} />;
}

interface HeaderProps {
  sidebarCollapsed: boolean;
}

const roleLabels: Record<string, string> = {
  director: 'Директор',
  deputy_director: 'Зам. директора',
  manager: 'Менеджер',
  teacher: 'Преподаватель',
  administrator: 'Администратор',
};

export function Header({ sidebarCollapsed }: HeaderProps) {
  const { user, logout } = useCurrentUser();
  const navigate = useNavigate();
  const { query, results, isOpen, handleQueryChange, selectResult, close } = useGlobalSearch();

  const userName = user?.fullName || 'Пользователь';
  const userRole = user?.role ? (roleLabels[user.role] || user.role) : '';
  const userInitials = userName.split(' ').map((name) => name[0]).join('').slice(0, 2);

  const typeIcons: Record<string, typeof Search> = {
    student: StudentIcon,
    group: GroupIcon,
    teacher: TeacherIcon,
  };

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 flex h-[76px] items-center justify-between bg-[#f7f9f8]/95 px-6 backdrop-blur-md transition-[left] duration-300 will-change-[left]',
        sidebarCollapsed ? 'left-[76px]' : 'left-64'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-header-muted" />
          <input
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => { if (results.length > 0) handleQueryChange(query); }}
            placeholder="Поиск клиентов, групп, преподавателей..."
            className="h-10 w-80 rounded-full border border-header-border/80 bg-white/75 py-2 pl-10 pr-4 text-sm shadow-sm placeholder:text-header-muted focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-[border-color,background-color,box-shadow]"
          />
          {isOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 max-h-80 w-96 overflow-y-auto rounded-2xl border border-border bg-popover shadow-xl">
              {results.map((result) => {
                const Icon = typeIcons[result.type] || Search;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                    onClick={() => selectResult(result)}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{result.subtitle}</p>
                    </div>
                    <span className="flex-shrink-0 text-[10px] uppercase text-muted-foreground">
                      {result.type === 'student' ? 'Клиент' : result.type === 'group' ? 'Группа' : 'Преп.'}
                    </span>
                  </button>
                );
              })}
              <button
                className="flex w-full items-center justify-center border-t border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
                onClick={close}
              >
                <X className="mr-1 h-3 w-3" />
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full text-header-muted hover:bg-white hover:text-header-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-slate-950 text-[10px] font-medium text-white shadow-sm">
            3
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-11 items-center gap-2 rounded-full px-2 hover:bg-white">
              <Avatar className="h-8 w-8 ring-2 ring-white">
                <AvatarImage src={user?.avatar} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-header-foreground">{userName}</p>
                <p className="-mt-0.5 text-xs text-header-muted">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-header-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Профиль</DropdownMenuItem>
            <DropdownMenuItem>Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => { logout(); navigate('/login', { replace: true }); }}>
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="app-shell min-h-screen">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={cn(
          'pt-[76px] transition-[margin-left] duration-300 will-change-[margin-left]',
          sidebarCollapsed ? 'ml-[76px]' : 'ml-64'
        )}
      >
        <div className="min-h-[calc(100vh-76px)] rounded-tl-[28px] border-l border-t border-white bg-background p-6 shadow-[-8px_-8px_30px_rgba(15,23,42,0.025)] lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
