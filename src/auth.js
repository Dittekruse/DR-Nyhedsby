
import { supabase } from './supabase.js';

const AUTH_FUNCTION_URL =
  'https://srhsehrvhxxlzindrpeg.supabase.co/functions/v1/username-auth';

export async function usernameAuth(action, username, password) {
  const response = await fetch(AUTH_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({ action, username, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login mislykkedes.');
  }

  const { error } = await supabase.auth.setSession({
    access_token: result.session.access_token,
    refresh_token: result.session.refresh_token,
  });

  if (error) {
    throw error;
  }

  return result.user;
}
