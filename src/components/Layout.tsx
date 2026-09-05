import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  UsersRound,
  CheckSquare,
  BookOpen,
  Calendar,
  CalendarClock,
  PartyPopper,
  Settings,
  ChevronDown,
  ChevronLeft,
  Bell,
  Search,
  FileText,
  Users2,
  Shield,
  GraduationCap as StudentIcon,
  UsersRound as GroupIcon,
  BookOpen as TeacherIcon,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useCurrentUser } from '../hooks/use-auth';
import { useGlobalSearch } from '../hooks/use-search';

const navigation = [
  { name: 'Главная', href: '/', icon: LayoutDashboard },
  { name: 'Заявки', href: '/applications', icon: FileText },
  { name: 'Клиенты', href: '/students', icon: GraduationCap },
  { name: 'Группы', href: '/groups', icon: UsersRound },
  { name: 'Задачи', href: '/tasks', icon: CheckSquare },
  { name: 'Преподаватели', href: '/teachers', icon: BookOpen },
  { name: 'Расписание', href: '/teacher-schedule', icon: Calendar },
  { name: 'Администраторы', href: '/admin-schedule', icon: CalendarClock },
  { name: 'Клубы', href: '/clubs', icon: Users2 },
  { name: 'Договоры', href: '/contracts', icon: FileText },
  { name: 'Справочники', href: '/dictionaries', icon: BookOpen },
  { name: 'Мероприятия', href: '/events', icon: PartyPopper },
  { name: 'Права доступа', href: '/permissions', icon: Shield },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-[width] duration-300 will-change-[width]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo-deutsch-klub.svg" alt="Deutsch-Klub" className="h-8 w-auto" />
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center justify-center mx-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-bold text-sm shadow-lg shadow-sidebar-accent/25">
              DK
            </div>
          </Link>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border absolute top-4 right-2"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
      <nav className="flex flex-col gap-0.5 p-3 pt-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/' && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-sidebar-accent/15 text-sidebar-accent'
                  : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-border/60'
              )}
            >
              <item.icon className={cn(
                'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                isActive ? 'text-sidebar-accent' : 'text-sidebar-muted group-hover:text-sidebar-foreground'
              )} />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function ChevronRight(props: React.ComponentProps<typeof ChevronLeft>) {
  return <ChevronLeft className="rotate-180" {...props} />;
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
  const location = useLocation();
  const { user, logout } = useCurrentUser();
  const navigate = useNavigate();
  const { query, results, isOpen, handleQueryChange, selectResult, close } = useGlobalSearch();

  const userName = user?.fullName || 'Пользователь';
  const userRole = user?.role ? (roleLabels[user.role] || user.role) : '';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2);

  const typeIcons: Record<string, typeof Search> = {
    student: StudentIcon,
    group: GroupIcon,
    teacher: TeacherIcon,
  };

  if (location.pathname.startsWith('/tasks')) return null;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-header-border bg-header/95 backdrop-blur-sm px-6 transition-[left] duration-300 will-change-[left]',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-header-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => { if (results.length > 0) handleQueryChange(query); }}
            placeholder="Поиск клиентов, групп, преподавателей..."
            className="h-9 w-80 rounded-lg border border-header-border bg-muted/50 pl-9 pr-4 py-2 text-sm placeholder:text-header-muted focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-[border-color,background-color,box-shadow]"
          />
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 w-96 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {results.map((result) => {
                const Icon = typeIcons[result.type] || Search;
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-accent transition-colors"
                    onClick={() => selectResult(result)}
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground uppercase flex-shrink-0">
                      {result.type === 'student' ? 'Клиент' : result.type === 'group' ? 'Группа' : 'Преп.'}
                    </span>
                  </button>
                );
              })}
              <button
                className="flex items-center justify-center w-full px-3 py-2 text-xs text-muted-foreground hover:bg-accent border-t border-border"
                onClick={close}
              >
                <X className="h-3 w-3 mr-1" />
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="relative h-9 w-9 text-header-muted hover:text-header-foreground hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium shadow-sm">
            3
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-9 hover:bg-accent">
              <Avatar className="h-8 w-8 ring-2 ring-header-border">
                <AvatarImage src={user?.avatar} alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-header-foreground">{userName}</p>
                <p className="text-xs text-header-muted -mt-0.5">{userRole}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-header-muted" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Профиль</DropdownMenuItem>
            <DropdownMenuItem>Настройки</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => { logout(); navigate('/login', { replace: true }); }}>Выйти</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const isTasksPage = location.pathname.startsWith('/tasks');

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/30">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <Header sidebarCollapsed={sidebarCollapsed} />
      <main
        className={cn(
          'transition-[margin-left,padding-top] duration-300 will-change-[margin-left]',
          isTasksPage ? 'pt-0' : 'pt-16',
          sidebarCollapsed ? 'ml-16' : 'ml-60'
        )}
      >
        <div className={cn(isTasksPage ? 'p-0' : 'p-6 lg:p-8')}>{children}</div>
      </main>
    </div>
  );
}
