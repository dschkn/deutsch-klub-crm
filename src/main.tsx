import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { isSupabaseConfigured } from './lib/supabase';

async function bootstrap() {
  if (isSupabaseConfigured) {
    try {
      const { supabaseSync } = await import('./lib/supabase-sync');
      const loaded = await supabaseSync.loadAll();
      if (loaded) {
        console.info('Data loaded from Supabase');
      } else {
        console.info('Using seed data (Supabase is empty or inaccessible)');
      }
    } catch (error) {
      console.warn('Supabase initialization failed; using seed data:', error);
    }
  } else {
    console.info('Using synthetic seed data (Supabase is not configured)');
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
