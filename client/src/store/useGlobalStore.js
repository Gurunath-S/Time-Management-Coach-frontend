import { useCallback } from 'react';
import { useAuthStore } from './useAuthStore';
import { useTaskStore } from './useTaskStore';
import { useFocusStore } from './useFocusStore';

// Re-export specific selectors or the entire store if needed for backward compatibility
// However, the best approach is to migrate components.
// For now, let's create a proxy-like store or just export a hook that combines them
// so we don't break everything instantly.

export const useGlobalStore = (selector) => {
  const auth = useAuthStore();
  const task = useTaskStore();
  const focus = useFocusStore();

  const initApp = useCallback(async () => {
    const authPromise = useAuthStore.getState().checkAuth();
    // If we have a token locally, start fetching tasks immediately in parallel
    if (useAuthStore.getState().token) {
      useTaskStore.getState().fetchTasks();
    }
    await authPromise;
  }, []);

  const combined = {
    ...auth,
    ...task,
    ...focus,
    initApp,
  };

  if (selector) return selector(combined);
  return combined;
};

// Also attach getState for direct access (legacy pattern used in Home.jsx)
useGlobalStore.getState = () => {
  const auth = useAuthStore.getState();
  const task = useTaskStore.getState();
  const focus = useFocusStore.getState();

  return {
    ...auth,
    ...task,
    ...focus,
    initApp: async () => {
      await auth.checkAuth();
      if (useAuthStore.getState().isLoggedIn) {
        await task.fetchTasks();
      }
    }
  };
};

export default useGlobalStore;
