"use client";

import { create } from "zustand";
import { api } from "@/lib/api/client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time?: string;
  createdAt?: string;
  read?: boolean;
  unread?: boolean;
  type?: "info" | "success" | "warning" | "error";
  link?: string;
}

interface NotificationState {
  notifications: NotificationItem[];
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  (set, get) => ({
    notifications: [],

    fetchNotifications: async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data?.success) {
          // Normalize backend data to frontend model
          const fetched = res.data.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            time: new Date(n.createdAt).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' }),
            createdAt: n.createdAt,
            unread: !n.read,
            type: n.type,
            link: n.link,
          }));
          set({ notifications: fetched });
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    },

    markAsRead: async (id) => {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, unread: false } : n
        ),
      }));
      
      try {
        await api.put(`/notifications/${id}/read`);
      } catch (error) {
        // Revert on error could be implemented here
        console.error("Failed to mark as read:", error);
      }
    },

    markAllAsRead: async () => {
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, unread: false })),
      }));

      try {
        await api.put(`/notifications/read-all`);
      } catch (error) {
        console.error("Failed to mark all as read:", error);
      }
    },

    clearAll: () => {
      set({ notifications: [] });
    },
  })
);
