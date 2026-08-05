import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { DataStore } from '../data/store';
import { useCurrentUser } from '../hooks/use-auth';

const DEMO_LOGIN = 'DeutschKlub';
const DEMO_PASSWORD = 'GelberRegenschirm';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useCurrentUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 400));

    if (email === DEMO_LOGIN && password === DEMO_PASSWORD) {
      setCurrentUser('u1');
      navigate('/', { replace: true });
      return;
    }

    const store = DataStore.getInstance();
    const allUsers = store.getAllUsers();
    const found = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!found) {
      setError('Неверный логин или пароль');
      setLoading(false);
      return;
    }

    if (password.length < 1) {
      setError('Введите пароль');
      setLoading(false);
      return;
    }

    setCurrentUser(found.id);

    const roleRoutes: Record<string, string> = {
      director: '/',
      deputy_director: '/',
      manager: '/students',
      teacher: '/teacher-schedule',
      administrator: '/settings',
    };

    navigate(roleRoutes[found.role] || '/', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Brand */}
      <div
        className="hidden md:flex flex-col justify-center w-[55%] relative overflow-hidden"
        style={{ background: '#FFF200' }}
      >
        <div className="pl-16 max-w-[520px]">
          {/* Logo */}
          <div className="mb-10">
            <img src="/logo-deutsch-klub.svg" alt="Deutsch-Klub" className="h-14 w-auto" />
          </div>

          {/* Label */}
          <div
            className="mb-6"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#111111',
            }}
          >
            CRM СИСТЕМА
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 400,
              letterSpacing: '-0.05em',
              lineHeight: 0.95,
              color: '#111111',
            }}
          >
            Все процессы школы
            <br />
            в одном пространстве.
          </h1>

          {/* Subtitle */}
          <p
            className="mt-8"
            style={{
              fontSize: '18px',
              lineHeight: 1.5,
              maxWidth: '420px',
              color: '#111111',
              opacity: 0.7,
            }}
          >
            Ученики, группы, расписание,
            <br />
            оплаты и коммуникации —
            <br />
            в одной системе управления.
          </p>
        </div>
      </div>

      {/* Right — Login form */}
      <div
        className="flex flex-col items-center justify-center w-full md:w-[45%] px-6 py-12"
        style={{ background: '#111111' }}
      >
        {/* Mobile logo */}
        <div className="md:hidden mb-8">
          <img src="/logo-deutsch-klub.svg" alt="Deutsch-Klub" className="h-10 w-auto" />
        </div>

        {/* Mobile label */}
        <div
          className="md:hidden mb-6"
          style={{
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#FFF200',
          }}
        >
          CRM СИСТЕМА
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[420px]"
          style={{
            background: '#FFFFFF',
            borderRadius: '28px',
            padding: '40px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}
        >
          <h2
            style={{
              fontSize: '36px',
              fontWeight: 400,
              color: '#111111',
              marginBottom: '8px',
            }}
          >
            Вход в систему
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: '#888888',
              marginBottom: '32px',
            }}
          >
            Введите данные для доступа к CRM
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Login field */}
            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: '#111111' }}
              >
                Логин
              </label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Введите логин"
                className="w-full px-4 text-sm outline-none transition-colors"
                style={{
                  height: '56px',
                  borderRadius: '14px',
                  border: '1.5px solid #E5E5E5',
                  background: '#FAFAFA',
                  color: '#111111',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#111111')}
                onBlur={e => (e.currentTarget.style.borderColor = '#E5E5E5')}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                className="block mb-2 text-sm font-medium"
                style={{ color: '#111111' }}
              >
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="w-full px-4 pr-12 text-sm outline-none transition-colors"
                  style={{
                    height: '56px',
                    borderRadius: '14px',
                    border: '1.5px solid #E5E5E5',
                    background: '#FAFAFA',
                    color: '#111111',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#111111')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E5E5')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm font-medium" style={{ color: '#EF4444' }}>
                {error}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                height: '56px',
                borderRadius: '14px',
                background: '#FFF200',
                color: '#111111',
                fontSize: '16px',
                fontWeight: 500,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Войти
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div
            className="text-center mt-6 p-3 rounded-xl"
            style={{
              fontSize: '12px',
              color: '#666666',
              lineHeight: 1.6,
              background: '#F7F7F5',
            }}
          >
            Демо-доступ для ознакомления:
            <br />
            <span style={{ fontWeight: 600, color: '#111111' }}>Логин:</span>{' '}
            <span style={{ fontFamily: 'monospace' }}>{DEMO_LOGIN}</span>
            <br />
            <span style={{ fontWeight: 600, color: '#111111' }}>Пароль:</span>{' '}
            <span style={{ fontFamily: 'monospace' }}>{DEMO_PASSWORD}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
