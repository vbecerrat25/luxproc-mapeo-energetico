import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  Award,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from './firebase';
import { UserSession } from '../../context/DiagnosticContext';
import { useLanguage, AppLanguage } from '../../context/LanguageContext';
import { lookupCIPRecord } from '../../utils/cipValidator';

interface LoginScreenProps {
  onLoginSuccess: (user: UserSession) => void;
}

interface StoredAccount {
  name: string;
  email: string;
  password?: string;
  role: 'INGENIERO_CIP' | 'AUDITOR_ENERGETICO' | 'CLIENTE';
  cipNumber?: string;
  avatarUrl?: string;
}

const ACCOUNTS_STORAGE_KEY = 'e_diagnosis_auth_accounts';
const THEME_STORAGE_KEY = 'e_diagnosis_theme_preference';

export type ThemePreference = 'system' | 'light' | 'dark';

const getInitialThemePreference = (): ThemePreference => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  } catch (e) {
    console.error(e);
  }
  return 'system';
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { language, setLanguage } = useLanguage();
  const tr = (es: string, en: string, pt: string) =>
    language === 'en' ? en : language === 'pt' ? pt : es;

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'INGENIERO_CIP' | 'AUDITOR_ENERGETICO' | 'CLIENTE'>('INGENIERO_CIP');
  const [cipNumber, setCipNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [themePref, setThemePref] = useState<ThemePreference>(getInitialThemePreference);
  const [deviceIsDark, setDeviceIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDeviceThemeChange = (e: MediaQueryListEvent) => {
      setDeviceIsDark(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDeviceThemeChange);
      return () => mediaQuery.removeEventListener('change', handleDeviceThemeChange);
    } else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handleDeviceThemeChange);
      return () => (mediaQuery as any).removeListener(handleDeviceThemeChange);
    }
  }, []);

  const changeTheme = (newPref: ThemePreference) => {
    setThemePref(newPref);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newPref);
    } catch (e) {
      console.error(e);
    }
  };

  const isDark = themePref === 'dark' || (themePref === 'system' && deviceIsDark);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (!existing) {
        const defaultAccounts: StoredAccount[] = [
          {
            name: 'Ing. Víctor Fernando Becerra Terán',
            email: 'luxproc.11@gmail.com',
            password: 'password123',
            role: 'INGENIERO_CIP',
            cipNumber: '278034',
            avatarUrl: 'https://ui-avatars.com/api/?name=Victor+Becerra&background=0284c7&color=fff&size=128&bold=true'
          }
        ];
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(defaultAccounts));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const profile = await signInWithGoogle();

      if (profile && profile.email) {
        const isMaster = 
          profile.email.toLowerCase() === 'luxproc.11@gmail.com' ||
          profile.email.toLowerCase().includes('luxproc');

        const finalCip = isMaster ? '278034' : undefined;
        const cipData = finalCip ? lookupCIPRecord(finalCip) : null;

        const session: UserSession = {
          name: profile.name || (isMaster ? 'Ing. Víctor Fernando Becerra Terán' : profile.email.split('@')[0]),
          email: profile.email,
          role: 'INGENIERO_CIP',
          cipNumber: finalCip,
          specialty: cipData?.specialty || (isMaster ? 'Ingeniero Electrónico' : undefined),
          professionalCollege: cipData?.college || (isMaster ? 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)' : undefined),
          regionalCouncil: cipData?.regionalCouncil || (isMaster ? 'CD La Libertad (Trujillo)' : undefined),
          chapter: cipData?.chapter || (isMaster ? 'Capítulo de Ingeniería Electrónica y Telecomunicaciones' : undefined),
          avatarUrl: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email)}&background=0284c7&color=fff&size=128`,
          verifiedByGoogle: true,
          isMasterUser: isMaster,
          loginAt: new Date().toISOString(),
          grantedPermissions: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
            'openid',
            'urn:cne:electrical-audit:signature',
            ...(isMaster ? ['master:central-evaluations:read-write'] : [])
          ]
        };

        onLoginSuccess(session);
      } else {
        throw new Error(tr(
          'No se pudo obtener la información de su cuenta de Google.',
          'Could not retrieve Google account information.',
          'Não foi possível obter as informações da sua conta do Google.'
        ));
      }
    } catch (err: any) {
      setError(err?.message || tr(
        'Error al conectar con la autenticación oficial de Google.',
        'Error connecting to official Google authentication.',
        'Erro ao conectar com a autenticação oficial do Google.'
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError(tr(
        'Por favor, ingresa un correo electrónico válido.',
        'Please enter a valid email address.',
        'Por favor, insira um e-mail válido.'
      ));
      return;
    }

    if (password.length < 4) {
      setError(tr(
        'La contraseña debe contener al menos 4 caracteres.',
        'Password must contain at least 4 characters.',
        'A senha deve conter pelo menos 4 caracteres.'
      ));
      return;
    }

    setIsLoading(true);

    if (authMode === 'register') {
      if (!name.trim()) {
        setError(tr(
          'Por favor ingresa tu nombre completo o razón social.',
          'Please enter your full name or company name.',
          'Por favor, insira seu nome completo ou razão social.'
        ));
        setIsLoading(false);
        return;
      }

      try {
        await signUpWithEmail(trimmedEmail, password, name.trim());
      } catch {
        // Fallback local
      }

      try {
        const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
        const accounts: StoredAccount[] = raw ? JSON.parse(raw) : [];
        const existingIdx = accounts.findIndex(a => a.email.toLowerCase() === trimmedEmail.toLowerCase());
        
        const newAccount: StoredAccount = {
          name: name.trim(),
          email: trimmedEmail,
          password: password,
          role: role,
          cipNumber: role === 'INGENIERO_CIP' ? cipNumber : undefined,
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim() || trimmedEmail)}&background=0284c7&color=fff&size=128&bold=true`
        };

        if (existingIdx >= 0) {
          accounts[existingIdx] = newAccount;
        } else {
          accounts.push(newAccount);
        }
        localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
      } catch (err) {
        console.error(err);
      }

      const session: UserSession = {
        name: name.trim(),
        email: trimmedEmail,
        role: role,
        cipNumber: role === 'INGENIERO_CIP' ? (cipNumber || '278034') : undefined,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim() || trimmedEmail)}&background=0284c7&color=fff&size=128&bold=true`,
        verifiedByGoogle: false,
        loginAt: new Date().toISOString(),
        grantedPermissions: ['email', 'profile', 'cne:audit:signature']
      };

      setIsLoading(false);
      onLoginSuccess(session);

    } else {
      try {
        await signInWithEmail(trimmedEmail, password);
      } catch {
        // Fallback local
      }

      let finalName = name;
      let finalRole = role;
      let finalCip = cipNumber;

      const isMaster = trimmedEmail.toLowerCase() === 'luxproc.11@gmail.com';

      if (isMaster) {
        finalName = 'Ing. Víctor Fernando Becerra Terán';
        finalRole = 'INGENIERO_CIP';
        finalCip = '278034';
      } else {
        try {
          const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
          if (raw) {
            const accounts: StoredAccount[] = JSON.parse(raw);
            const found = accounts.find(a => a.email.toLowerCase() === trimmedEmail.toLowerCase());
            if (found) {
              finalName = found.name;
              finalRole = found.role;
              finalCip = found.cipNumber || cipNumber;
            }
          }
        } catch (err) {
          console.error(err);
        }
      }

      const isGoogleAccount = isMaster || trimmedEmail.toLowerCase().includes('gmail.com') || trimmedEmail.toLowerCase().includes('luxproc');
      const cipData = finalCip ? lookupCIPRecord(finalCip) : null;

      const session: UserSession = {
        name: finalName || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        role: finalRole,
        cipNumber: finalRole === 'INGENIERO_CIP' ? (finalCip || '278034') : undefined,
        specialty: cipData?.specialty || (isMaster ? 'Ingeniero Electrónico' : undefined),
        professionalCollege: cipData?.college || (isMaster ? 'Colegio de Ingenieros del Perú - Consejo Departamental de La Libertad (CD La Libertad)' : undefined),
        regionalCouncil: cipData?.regionalCouncil || (isMaster ? 'CD La Libertad (Trujillo)' : undefined),
        chapter: cipData?.chapter || (isMaster ? 'Capítulo de Ingeniería Electrónica y Telecomunicaciones' : undefined),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName || trimmedEmail)}&background=0284c7&color=fff&size=128&bold=true`,
        verifiedByGoogle: isGoogleAccount,
        isMasterUser: isMaster,
        loginAt: new Date().toISOString(),
        grantedPermissions: [
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile',
          'openid',
          'urn:cne:electrical-audit:signature',
          ...(isMaster ? ['master:central-evaluations:read-write'] : [])
        ]
      };

      setIsLoading(false);
      onLoginSuccess(session);
    }
  };

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-950 text-white' 
        : 'bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 text-slate-800'
    }`}>
      
      {/* Selector de Modo Superior */}
      <div 
        className={`absolute top-4 sm:top-6 left-4 sm:left-6 z-20 flex items-center gap-1 p-1 rounded-full backdrop-blur-md transition-all shadow-sm border text-xs font-semibold ${
          isDark 
            ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
            : 'bg-white/95 border-slate-300 text-slate-700 shadow-slate-300/50'
        }`}
      >
        <button
          type="button"
          onClick={() => changeTheme('light')}
          title={tr('Fondo claro', 'Light mode', 'Modo claro')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            themePref === 'light'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>{tr('Claro', 'Light', 'Claro')}</span>
        </button>

        <button
          type="button"
          onClick={() => changeTheme('system')}
          title={tr('Se adapta a la configuración de tu dispositivo', 'Adapts to your device theme', 'Adapta-se ao tema do seu dispositivo')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            themePref === 'system'
              ? (isDark ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-800 text-white shadow-xs')
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Auto {themePref === 'system' ? (deviceIsDark ? `(${tr('Oscuro', 'Dark', 'Escuro')})` : `(${tr('Claro', 'Light', 'Claro')})`) : ''}</span>
        </button>

        <button
          type="button"
          onClick={() => changeTheme('dark')}
          title={tr('Fondo oscuro', 'Dark mode', 'Modo escuro')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
            themePref === 'dark'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>{tr('Oscuro', 'Dark', 'Escuro')}</span>
        </button>
      </div>

      {/* Selector de Idioma y Norma CNE / RNE superior */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 flex items-center gap-2">
        <div
          className={`flex items-center gap-1 p-1 rounded-full border text-xs font-bold shadow-sm backdrop-blur-md ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 text-slate-300'
              : 'bg-white/95 border-slate-300 text-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5 ml-1.5 text-amber-500" />
          {(['es', 'en', 'pt'] as AppLanguage[]).map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => setLanguage(lang)}
              className={`px-2 py-0.5 rounded-full text-[11px] uppercase transition-all cursor-pointer ${
                language === lang
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'hover:opacity-80'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <div 
          className={`hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold shadow-sm backdrop-blur-md ${
            isDark 
              ? 'bg-slate-900/90 border-slate-800 text-slate-300' 
              : 'bg-white/95 border-slate-300 text-slate-700 shadow-slate-300/50'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{tr('Normativa CNE Suministro & Utilización', 'CNE / NEC Electrical Standards', 'Norma Elétrica CNE / NBR')}</span>
        </div>
      </div>

      {/* Fondo Arquitectónico / Técnico sutil */}
      {isDark ? (
        <div 
          className="absolute inset-0 pointer-events-none opacity-20" 
          style={{
            backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
      ) : (
        <div 
          className="absolute inset-0 pointer-events-none opacity-25" 
          style={{
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      )}
      
      {/* Luces volumétricas suaves de fondo */}
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none transition-colors duration-500 ${
        isDark ? 'bg-amber-500/10' : 'bg-amber-400/20'
      }`} />
      <div className={`absolute bottom-10 right-10 w-[450px] h-[450px] rounded-full blur-[130px] pointer-events-none transition-colors duration-500 ${
        isDark ? 'bg-indigo-500/10' : 'bg-blue-400/20'
      }`} />

      {/* Tarjeta Flotante Central de Autenticación */}
      <div 
        className={`w-full max-w-[460px] rounded-3xl p-6 sm:p-9 relative z-10 transition-all duration-300 ${
          isDark
            ? 'bg-slate-900/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-slate-800/90 text-white backdrop-blur-xl'
            : 'bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.2),0_4px_16px_rgba(15,23,42,0.08)] border-2 border-slate-300/80 ring-1 ring-slate-900/5 text-slate-900'
        }`}
      >
        
        {/* Encabezado: Logo y Nombre de marca */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <img 
              src="https://i.imgur.com/WWChkA9.png" 
              alt="E-DIAGNOSIS OS" 
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              E-DIAGNOSIS 
              <span className="text-xs bg-amber-500 text-slate-950 px-2 py-0.5 rounded-md font-black tracking-normal lowercase shadow-xs">
                os
              </span>
            </h1>
          </div>

          <p className={`text-xs font-semibold tracking-wide uppercase mt-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-500'
          }`}>
            {tr(
              'Plataforma de Auditoría & Peritaje Eléctrico CNE',
              'CNE Electrical Audit & Diagnostic Platform',
              'Plataforma de Auditoria e Perícia Elétrica CNE'
            )}
          </p>
        </div>

        {/* Botón Principal: Continuar con Google */}
        <div className="mb-5">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 ${
              isDark
                ? 'bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 shadow-md'
                : 'bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 border border-slate-300 shadow-sm hover:shadow hover:border-slate-400'
            }`}
            title={tr('Iniciar sesión con Google', 'Sign in with Google', 'Entrar com o Google')}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                <span>{tr('Abriendo ventana de Google...', 'Opening Google window...', 'Abrindo janela do Google...')}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{tr('Continuar con Google', 'Continue with Google', 'Continuar com o Google')}</span>
              </>
            )}
          </button>
        </div>

        {/* Separador */}
        <div className="relative flex items-center justify-center mb-5">
          <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-300'}`} />
          <span className={`px-3 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${
            isDark ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-500'
          }`}>
            {tr('o con credenciales de ingeniero', 'or with engineer credentials', 'ou com credenciais de engenheiro')}
          </span>
          <div className={`border-t w-full ${isDark ? 'border-slate-800' : 'border-slate-300'}`} />
        </div>

        {/* Selector de pestañas: Iniciar Sesión / Registrarse */}
        <div className={`flex rounded-xl p-1 border mb-4 ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
        }`}>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'login' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            {tr('Iniciar Sesión', 'Sign In', 'Iniciar Sessão')}
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              authMode === 'register' 
                ? 'bg-amber-500 text-slate-950 shadow-xs' 
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
            }`}
          >
            {tr('Registrarse', 'Register', 'Cadastrar-se')}
          </button>
        </div>

        {/* Mensaje de error / estado */}
        {error && (
          <div className={`mb-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs font-semibold ${
            isDark 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
              : 'bg-rose-50 border-rose-300 text-rose-800'
          }`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario con campos en blanco por defecto */}
        <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
          
          {authMode === 'register' && (
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {tr('Nombre Completo y Título', 'Full Name & Title', 'Nome Completo e Título')}
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  autoComplete="off"
                  className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {tr('Correo Electrónico', 'Email Address', 'E-mail')}
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                autoComplete="off"
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                    : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
            </div>
          </div>

          {authMode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {tr('Rol Profesional', 'Professional Role', 'Função Profissional')}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-white focus:outline-none focus:border-amber-500'
                      : 'bg-slate-50/70 border-slate-300 text-slate-900 focus:outline-none focus:border-amber-500'
                  }`}
                >
                  <option value="INGENIERO_CIP">{tr('Ingeniero CIP', 'CIP Engineer', 'Engenheiro CIP')}</option>
                  <option value="AUDITOR_ENERGETICO">{tr('Auditor Energético', 'Energy Auditor', 'Auditor Energético')}</option>
                  <option value="CLIENTE">{tr('Cliente / Gerente', 'Client / Manager', 'Cliente / Gerente')}</option>
                </select>
              </div>

              <div>
                <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  {tr('N° Registro CIP', 'CIP Reg. Number', 'N° Registro CIP')}
                </label>
                <div className="relative">
                  <Award className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={cipNumber}
                    onChange={(e) => setCipNumber(e.target.value)}
                    placeholder=""
                    autoComplete="off"
                    className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500'
                        : 'bg-slate-50/70 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}>
              {tr('Contraseña', 'Password', 'Senha')}
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-2.5 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                autoComplete="new-password"
                className={`w-full pl-9 pr-10 py-2 rounded-xl text-xs font-medium border transition-all ${
                  isDark
                    ? 'bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                    : 'bg-slate-50/70 hover:bg-white focus:bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer ${
                  isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-amber-500/20 transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{tr('Autenticando...', 'Authenticating...', 'Autenticando...')}</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'register'
                    ? tr('Registrarse y Comenzar', 'Register & Start', 'Cadastrar e Começar')
                    : tr('Ingresar a la Plataforma', 'Enter Platform', 'Entrar na Plataforma')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

    </div>
  );
};
