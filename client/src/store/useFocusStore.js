import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import BACKEND_URL from '../../Config';
import { toast } from 'react-toastify';
import { useAuthStore } from './useAuthStore'; // We might need to access token here or handle it differently

export const useFocusStore = create(
    persist(
        (set, get) => ({
            isFocusMode: false,
            focusStartTime: null,
            focusCompletedTasks: [],
            focusTaskChanges: [],

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

                // Optimistic UI update
                set({ isFocusMode: false, focusStartTime: null, focusCompletedTasks: [], focusTaskChanges: [] });

                // Save in background
                const token = useAuthStore.getState().token;
                if (!token) return;

                try {
                    await axios.post(`${BACKEND_URL}/api/focus`, sessionSummary, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    toast.success('Focus session saved successfully!');
                } catch (err) {
                    console.error('Failed to save focus session', err);
                    toast.error('Failed to save focus session in background.');
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

                    set((state) => ({ focusTaskChanges: [...(state.focusTaskChanges || []), changeEntry] }));
                } catch (err) {
                    console.error('Failed to log task change in focus mode', err);
                }
            },

            addCompletedTask: (task) => {
                if (get().isFocusMode) {
                    const completedTask = { ...task, status: 'completed', completed_at: new Date().toISOString() };
                    set((state) => {
                        const existing = state.focusCompletedTasks || [];
                        // Check uniqueness only by ID? Or allow duplicates? 
                        // Original code allowed duplicates if ID wasn't found, but if found it seemingly updated it?
                        // Logic:
                        const idx = existing.findIndex(t => t.id === completedTask.id);
                        if (idx !== -1) {
                            const updated = [...existing];
                            updated[idx] = completedTask;
                            return { focusCompletedTasks: updated };
                        }
                        return { focusCompletedTasks: [...existing, completedTask] };
                    });
                }
            }
        }),
        {
            name: 'focusMode',
            partialize: (state) => ({
                isFocusMode: state.isFocusMode,
                focusStartTime: state.focusStartTime,
                focusCompletedTasks: state.focusCompletedTasks,
                focusTaskChanges: state.focusTaskChanges,
            }),
        }
    )
);
