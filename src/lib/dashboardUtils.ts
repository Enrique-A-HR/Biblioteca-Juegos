import { supabase } from './supabase';

export type GameRecord = {
  id: string | number;
  title: string;
  platform: string;
  cover_url: string;
  target_url: string;
  file_size: string;
  language: string;
  has_hshop?: boolean;
};

const allowedLanguageCodes = ['ESP', 'ENG', 'JP'] as const;

export const normalizeLanguageForStorage = (rawLanguage: string) => {
  const normalized = (rawLanguage ?? '').trim().toUpperCase();
  const allAliases = ['ALL', 'TODO', 'TODOS', 'MULTI', 'MULTIIDIOMA'];

  if (!normalized) {
    return { ok: false as const, error: 'Ingresa al menos un idioma (ESP, ENG, JP o All).' };
  }

  if (allAliases.includes(normalized)) {
    return { ok: true as const, value: 'ESP/ENG/JP' };
  }

  const tokens = normalized
    .split(/[\s,/|+-]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(tokens));
  const valid = unique.filter((token): token is (typeof allowedLanguageCodes)[number] =>
    (allowedLanguageCodes as readonly string[]).includes(token)
  );

  if (!valid.length) {
    return { ok: false as const, error: 'Idioma invalido. Usa ESP, ENG, JP o All.' };
  }

  return { ok: true as const, value: valid.join('/') };
};

export const loadGames = async (): Promise<GameRecord[]> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    throw new Error('Error al cargar juegos: ' + error.message);
  }

  return data ?? [];
};

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'from-green-500 to-emerald-600' : 
                  type === 'error' ? 'from-red-500 to-red-600' : 
                  'from-blue-500 to-cyan-600';
  
  const icon = type === 'success' ? '✓' : 
               type === 'error' ? '✕' : 
               'ℹ';

  toast.className = `bg-gradient-to-r ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-5 duration-300`;
  toast.innerHTML = `<span class="text-xl font-bold">${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-out', 'fade-out', 'slide-out-to-top-5');
    toast.style.transition = 'all 0.3s ease-out';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};
