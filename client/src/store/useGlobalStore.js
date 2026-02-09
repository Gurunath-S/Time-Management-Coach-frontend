// src/store/useGlobalStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import BACKEND_URL from '../../Config';
import { toast } from 'react-toastify';
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp < Math.floor(Date.now() / 1000);
  } catch {
    return true;
  }
};

export const useGlobalStore = create(
  persist(
    (set, get) => ({
      // Auth
      token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
      user: null,
      isLoggedIn: false,
      loadingAuth: true,
      authChecked: false,

      // Tasks
      tasks: [],
      qtasks: [],
      loadingTasks: false,
      error: null,

      // Focus mode (automatically persisted)
      isFocusMode: false,
      focusStartTime: null,
      focusCompletedTasks: [],
      focusTaskChanges: [],

      // Helpers
      getAuthHeaders: () => {
        const token = get().token;
        return {
          headers: { Authorization: `Bearer ${token}` },
        };
      },

      setToken: (newToken) => {
        if (newToken) {
          localStorage.setItem('token', newToken);
          set({ token: newToken });
        } else {
          localStorage.removeItem('token');
          set({ token: null });
        }
      },

      checkAuth: async () => {
        set({ loadingAuth: true });
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
          localStorage.removeItem('token');
          set({ token: null, user: null, isLoggedIn: false, loadingAuth: false, authChecked: true });

          return false;
        }

        try {
          const res = await axios.get(`${BACKEND_URL}/api/auth/profile`, get().getAuthHeaders());
          if (res.data?.user) {
            set({ user: res.data.user, isLoggedIn: true, loadingAuth: false, authChecked: true });
            return true;
          } else {
            localStorage.removeItem('token');
            set({ token: null, user: null, isLoggedIn: false, loadingAuth: false, authChecked: true });
            return false;
          }
        } catch (err) {
          console.error('Profile fetch failed', err);
          toast.error('Session expired or cannot connect. Please log in.');
          localStorage.removeItem('token');
          set({ token: null, user: null, isLoggedIn: false, loadingAuth: false, authChecked: true });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
        set({ token: null, user: null, isLoggedIn: false });
        window.dispatchEvent(new Event('logout'));
        // Do not force reload, let React Router handle valid state
        // window.location.href='/login' 
      },

      // Optimized login: set user directly from login response, then fetch tasks
      loginSuccess: async (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user, isLoggedIn: true, loadingAuth: false, authChecked: true });
        await get().fetchTasks();
      },

      // Tasks / qtasks
      fetchTasks: async () => {
        set({ loadingTasks: true, error: null });
        try {
          const [taskRes, qtaskRes] = await Promise.all([
            axios.get(`${BACKEND_URL}/api/tasks`, get().getAuthHeaders()),
            axios.get(`${BACKEND_URL}/api/qtasks`, get().getAuthHeaders()),
          ]);
          set({
            tasks: Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data || []),
            qtasks: Array.isArray(qtaskRes.data) ? qtaskRes.data : (qtaskRes.data || []),
            loadingTasks: false,
          });
        } catch (err) {
          console.error('Failed fetching tasks', err);
          set({ error: err.response?.data?.message || 'Failed to fetch tasks', loadingTasks: false });
          if (err.response?.status === 401) {
            toast.error('Session expired. Please log in again.');
            sessionStorage.setItem('authError', 'true');
            get().logout();
          }
        }
      },

      // setTasksLocally: (tasks) => set({ tasks }),
      // setQTasksLocally: (qtasks) => set({ qtasks }),

      saveTask: async (task, isEdit = false) => {
        try {
          const method = isEdit ? 'put' : 'post';
          const url = isEdit ? `${BACKEND_URL}/api/tasks/${task.id}` : `${BACKEND_URL}/api/tasks`;
          const res = await axios[method](url, task, get().getAuthHeaders());
          const saved = res.data;

          if (isEdit) {
            set((state) => ({ tasks: state.tasks.map(t => (t.id === saved.id ? saved : t)) }));
          } else {
            set((state) => ({ tasks: [...state.tasks, saved] }));
          }

          // Check if task is completed in Focus Mode
          if (get().isFocusMode && saved.status === 'completed') {
            // Avoid duplicates if it's already there
            const alreadyCompleted = get().focusCompletedTasks.some(t => t.id === saved.id);
            if (!alreadyCompleted) {
              const completedTask = { ...saved, completed_at: new Date().toISOString() };
              set((state) => ({
                focusCompletedTasks: [...(state.focusCompletedTasks || []), completedTask]
              }));
            }
          }

          toast.success(isEdit ? 'Task updated' : 'Task created');
          return saved;
        } catch (err) {
          console.error('saveTask failed', err);
          toast.error('Failed to save task');
          throw err;
        }
      },

      deleteTask: async (taskId) => {
        try {
          await axios.delete(`${BACKEND_URL}/api/tasks/${taskId}`, get().getAuthHeaders());
          set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
          toast.success('Task deleted');
        } catch (err) {
          console.error('deleteTask failed', err);
          toast.error('Failed to delete task');
        }
      },

      markTaskCompleted: async (taskId) => {
        // update locally
        const task = get().tasks.find(t => t.id === taskId);
        if (!task) return;
        const updatedLocal = get().tasks.map(t => (t.id === taskId ? { ...t, status: 'completed' } : t));
        set({ tasks: updatedLocal });

        // Track completed task in focus mode (automatically persisted)
        if (get().isFocusMode) {
          const completedTask = { ...task, status: 'completed', completed_at: new Date().toISOString() };
          set((state) => {
            const existing = state.focusCompletedTasks || [];
            const idx = existing.findIndex(t => t.id === completedTask.id);
            if (idx !== -1) {
              const updated = [...existing];
              updated[idx] = completedTask;
              return { focusCompletedTasks: updated };
            }
            return { focusCompletedTasks: [...existing, completedTask] };
          });
        }

        // update server
        try {
          await axios.put(`${BACKEND_URL}/api/tasks/${taskId}`, { ...task, status: 'completed' }, get().getAuthHeaders());
        } catch (err) {
          console.error('Failed to update task on server', err);
          toast.error('Failed to update task on server');
        }
      },

      // Focus-mode actions
      startFocusMode: (opts = {}) => {
        const startTime = Date.now();
        set({
          isFocusMode: true,
          focusStartTime: startTime,
          focusCompletedTasks: [],
          focusTaskChanges: [],
          ...opts
        });
      },

      endFocusMode: async () => {
        const { focusStartTime, focusCompletedTasks, focusTaskChanges } = get();
        if (!get().isFocusMode) return;
        const endTime = Date.now();
        const timeSpent = Math.floor((endTime - (focusStartTime || endTime)) / 1000);

        const sessionSummary = {
          startTime: new Date(focusStartTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          timeSpent,
          completedTasks: (focusCompletedTasks || []).map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            completed_at: t.completed_at || new Date().toISOString(),
          })),
          taskChanges: focusTaskChanges || [],
        };

        // Optimistic UI update: Clear focus mode immediately
        set({ isFocusMode: false, focusStartTime: null, focusCompletedTasks: [], focusTaskChanges: [] });

        // Save in background
        try {
          await axios.post(`${BACKEND_URL}/api/focus`, sessionSummary, get().getAuthHeaders());
          toast.success('Focus session saved successfully!');
        } catch (err) {
          console.error('Failed to save focus session', err);
          toast.error('Failed to save focus session in background.');
          // TODO: Optionally retry or store locally
        }
      },

      logTaskChangeInFocusMode: (oldTask, newTask) => {
        if (!get().isFocusMode) return;

        try {
          const focusStartTime = get().focusStartTime;
          const now = new Date();
          const timeSpent = Math.floor((now - focusStartTime) / 1000);

          const changes = {};
          Object.keys(newTask).forEach((key) => {
            if (['updated_at', 'created_at'].includes(key)) return;
            if (JSON.stringify(oldTask[key]) !== JSON.stringify(newTask[key])) {
              changes[key] = { before: oldTask[key], after: newTask[key] };
            }
          });
          if (Object.keys(changes).length === 0) return;

          const changeEntry = {
            taskId: oldTask.id,
            taskTitle: oldTask.title,
            timestamp: now.toISOString(),
            timeSpent,
            changes,
          };

          // Update state (automatically persisted by middleware)
          set((state) => ({ focusTaskChanges: [...(state.focusTaskChanges || []), changeEntry] }));

          console.log('Focus Mode: logged task change', { taskId: oldTask.id, changes, timeSpent });
        } catch (err) {
          console.error('Failed to log task change in focus mode', err);
        }
      },

      initApp: async () => {
        await get().checkAuth();
        // Focus mode state is automatically restored by persist middleware
        if (get().isLoggedIn) await get().fetchTasks();
      },
    }),
    {
      name: 'focusMode', // localStorage key
      partialize: (state) => ({
        // Only persist focus mode related state
        isFocusMode: state.isFocusMode,
        focusStartTime: state.focusStartTime,
        focusCompletedTasks: state.focusCompletedTasks,
        focusTaskChanges: state.focusTaskChanges,
      }),
    }
  )
);

export default useGlobalStore;
