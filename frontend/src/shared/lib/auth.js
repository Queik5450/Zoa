import { apiJson } from './api';
import { setMockAuth } from './scanFlow';
import { supabase } from './supabaseClient';

export async function hydrateMockAuthFromSession(mode = 'login', fallbackDisplayName = 'usuario') {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const user = data?.session?.user;
  if (!user) {
    return null;
  }

  const resolvedDisplayName = user.user_metadata?.full_name || user.user_metadata?.name || fallbackDisplayName;
  const resolvedEmail = user.email || '';

  setMockAuth({
    mode,
    displayName: resolvedDisplayName,
    email: resolvedEmail,
    userId: user.id,
    authenticatedAt: Date.now(),
  });

  try {
    await apiJson('/profiles/sync', {
      method: 'POST',
      body: {
        user_id: user.id,
        email: resolvedEmail,
        display_name: resolvedDisplayName,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
    });
  } catch {
    // Best-effort sync: if the backend is unavailable, keep the auth session usable.
  }

  return {
    mode,
    displayName: resolvedDisplayName,
    email: resolvedEmail,
    userId: user.id,
  };
}