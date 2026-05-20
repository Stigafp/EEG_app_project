import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type NotificationSeverity = "INFO" | "WARNING" | "ALARM";
export type NotificationSource = 'EEG' | 'AUDIO_AI' | 'VITALS' | 'SYSTEM' | 'CARE_PLAN';

export type AppNotification = {
    id: string;
    severity: NotificationSeverity;
    title?: string;
    message: string;
    source?: NotificationSource | string;
    createdAt: string;
    dismissed: boolean;
    nativeNotificationId?: string;
    relatedItemId?: string;
}

type CreateNotificationInput = Omit<AppNotification, "id" | "createdAt" | 'dismissed'> & {
    id?: string;
    createdAt?: string;
    dismissed?: boolean;
};

type NotificationStore = {
    notifications: AppNotification[]

    //addNotification: (notifcation: Omit<AppNotification, "id" | "createdAt">) => void;
    addNotification: (notification: CreateNotificationInput) => void;
    upsertNotification: (notification: CreateNotificationInput) => void;
    dismissNotification: (id: string) => void;
    clearNotifications: () => void;
};

function sortNewestFirst(notifications: AppNotification[]){
    return [...notifications].sort(
        (a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export const useNotificationStore = create<NotificationStore>()(
    persist(
        (set) => ({
            notifications: [],

            addNotification: (notification) =>
                set((state) => ({
                    notifications: sortNewestFirst([
                        {
                            ...notification,
                        id: notification.id ?? `${Date.now()}-${Math.random()}`,
                        createdAt: notification.createdAt ?? new Date().toISOString(),
                        dismissed: notification.dismissed ?? false,
                        },
                        ...state.notifications,
                    ]),
                })),

            upsertNotification: (notification) =>
                set((state) => {
                    const id = notification.id ?? notification.nativeNotificationId ?? `${Date.now()}-${Math.random()}`;
                    const existing = state.notifications.find((item) => item.id === id);
                    const nextNotification: AppNotification ={
                        ...existing,
                        ...notification,
                        id,
                        createdAt: notification.createdAt ?? existing?.createdAt ?? new Date().toISOString(),
                        dismissed: notification.dismissed ?? existing?.dismissed ?? false,
                    };

                    return {
                        notifications: sortNewestFirst([
                            nextNotification,
                            ...state.notifications.filter((item) => item.id !== id),
                        ]),
                    };
                }),
            
            dismissNotification: (id) =>
                set((state) => ({
                    notifications: state.notifications.map((notification) =>
                        notification.id === id ? { ...notification, dismissed: true } : notification,
                    ),
                })),

            clearNotifications: () =>
                set({
                    notifications: [],
                }),
        }),
        {
            name: 'EEGo-notifications',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);



// ===============================
// Gammelt kode
// ===============================

// export const useNotificationStore = create<NotificationStore>((set) => ({
//     notifications: [],

//     addNotification: (notification) =>
//         set((state) => ({ 
//             notifications: [
//                 {
//                     ...notification,
//                     id: `${Date.now()}-${Math.random()}`,
//                     createdAt: new Date().toISOString(),
//                     dismissed: false,
//                 },
//                 ...state.notifications,
//             ],
//         })),

//         dismissNotification: (id) =>
//             set((state) => ({
//                 notifications: state.notifications.map(
//                     (notification) => notification.id ===id
//                     ? { ...notification, dismissed: true }
//                     : notification
//                 ),
//             })),

//             clearNotifications: () =>
//                 set({
//                     notifications: [],
//                 }),

// }))