import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type RouteComponent = LazyExoticComponent<ComponentType>;

export interface ProtectedRoute {
  path: string;
  component: RouteComponent;
}

export const protectedRoutes: ProtectedRoute[] = [
  { path: '/', component: lazy(() => import('../pages/Dashboard')) },
  { path: '/applications', component: lazy(() => import('../pages/Applications')) },
  { path: '/leads', component: lazy(() => import('../pages/Leads')) },
  { path: '/students', component: lazy(() => import('../pages/Students')) },
  { path: '/groups', component: lazy(() => import('../pages/Groups')) },
  { path: '/tasks', component: lazy(() => import('../pages/Tasks')) },
  { path: '/chats', component: lazy(() => import('../pages/Chats')) },
  { path: '/teachers', component: lazy(() => import('../pages/Teachers')) },
  { path: '/teacher-schedule', component: lazy(() => import('../pages/TeacherSchedule')) },
  { path: '/admin-schedule', component: lazy(() => import('../pages/AdminSchedule')) },
  { path: '/clubs', component: lazy(() => import('../pages/Clubs')) },
  { path: '/contracts', component: lazy(() => import('../pages/Contracts')) },
  { path: '/dictionaries', component: lazy(() => import('../pages/Dictionaries')) },
  { path: '/payments', component: lazy(() => import('../pages/Payments')) },
  { path: '/events', component: lazy(() => import('../pages/Events')) },
  { path: '/reports', component: lazy(() => import('../pages/Reports')) },
  { path: '/settings', component: lazy(() => import('../pages/Settings')) },
  { path: '/permissions', component: lazy(() => import('../pages/Permissions')) },
];
