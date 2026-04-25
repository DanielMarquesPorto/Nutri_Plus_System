import { supabase } from './lib/supabase';

/**
 * Cria uma nova nutricionista (Auth + Tabela Publica)
 */
export async function signUpNutricionista(email, password, nome) {
  // Criar usuário no Auth. O trigger no Postgres cuidará de inserir na tabela public.nutricionistas
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nome,
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Realiza login
 */
export async function signInNutricionista(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Logout
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Obtém sessão atual
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Listener de estado de autenticação
 */
export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
