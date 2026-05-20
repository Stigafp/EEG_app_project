import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
    cancelAllScheduledCarePlanNotifications,
    cancelScheduledNotification,
    scheduleCarePlanNotification,
 } from "../services/notificationService";

export type CarePlanItemType = "medication" | "reminder" | "training";
export type CarePlanStatus = "done" | "active" | 'inactive' | "delayed";

export type CarePlanItem = {
    id: string;
    type: CarePlanItemType;
    title: string;
    description?: string;
    scheduledAt: string;
    status: CarePlanStatus;
    createdAt: string;
    delayedTill?: string;
    dosage?: string;
    notificationId?: string;
};

type CreateCarePlanItemInput = {
    title: string;
    description?: string;
    scheduledAt: string;

    dosage?: string;
}

export type UpdateCarePlanItemInput = Partial<
    Pick<CarePlanItem, 'type' | 'title' | 'description' | 'scheduledAt' | 'dosage' | 'status'>
>;

type CarePlanStore = {
    items: CarePlanItem[];

    addReminder: (input: CreateCarePlanItemInput) => Promise<void>;
    addTraining: (input: CreateCarePlanItemInput) => Promise<void>;
    addMedication: (input: CreateCarePlanItemInput) => Promise<void>;

    updateItem: (id: string, input: UpdateCarePlanItemInput) => Promise<void>;
    toggleActive: (id: string) => Promise<void>;
    markDone: (id: string) => Promise<void>;
    markDelayed: (id: string, minutes: number) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    clearCarePlan: () => Promise<void>;
    rescheduleActiveNotifications: () => Promise<void>;
};

function createId(){
    return `${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
}

async function buildItem(input: CreateCarePlanItemInput, type: CarePlanItemType): Promise<CarePlanItem> {
    const item: CarePlanItem ={
        ...input,
        id: createId(),
        type,
        status: 'active',
        createdAt: new Date().toISOString(),
    };

    item.notificationId = await scheduledIfNeeded(item);
    return item;
};

async function scheduledIfNeeded(item: CarePlanItem){
    if (item.status !== 'active' && item.status !== 'delayed') return undefined;

    return scheduleCarePlanNotification({
        carePlanItemId: item.id,
        type: item.type,
        title: item.title,
        description: item.description,
        scheduledAt: item.delayedTill ?? item.scheduledAt,
    })
}

export const useCarePlanStore = create<CarePlanStore>()(
    persist(
        (set, get) => ({
            items: [],

            addReminder: async(input) => {
                const item = await buildItem(input, "reminder");
                set((state) => ({items: [item, ...state.items] }));
            },

            addTraining: async(input) => {
                const item = await buildItem(input, "training");
                set((state) => ({items: [item, ...state.items] }));
            },

            addMedication: async(input) => {
                const item = await buildItem(input, "medication");
                set((state) => ({items: [item, ...state.items] }));
            },

            updateItem: async(id, input) => {
                const existing = get().items.find((item) => item.id === id);
                if(!existing) return;

                await cancelScheduledNotification(existing.notificationId);

                const next: CarePlanItem ={
                    ...existing,
                    ...input,
                    delayedTill: input.scheduledAt ? undefined : existing.delayedTill,
                    notificationId: undefined,
                };

                next.notificationId = await scheduledIfNeeded(next);

                set((state) => ({
                    items: state.items.map((item) => (item.id === id ? next : item)),
                }));
            },

            toggleActive: async(id) => {
                const existing = get().items.find((item) => item.id === id);
                if (!existing || existing.status === 'done') return;

                const nextStatus: CarePlanStatus = existing.status === 'active' ? 'inactive' : 'active';
                await get().updateItem(id, { status: nextStatus});
            },

            markDone: async(id) => {
                const existing = get().items.find((item) => item.id === id);
                if (!existing) return;

                await cancelScheduledNotification(existing.notificationId);
                set((state) => ({
                    items: state.items.map((item) =>
                    item.id === id 
                      ? { ...item, status: 'done', notificationId: undefined, delayedTill: undefined }
                      : item,
                    ),
                }));
            },

            markDelayed: async (id, minutes) => {
                const existing = get().items.find((item) => item.id === id);
                if (!existing) return;

                await cancelScheduledNotification(existing.notificationId);
                const delayedTill = new Date(Date.now() + minutes * 60 * 1000).toISOString();

                const next: CarePlanItem ={
                    ...existing,
                    status: 'delayed',
                    delayedTill,
                    notificationId: undefined,
                };

                next.notificationId = await scheduledIfNeeded(next);

                set((state) => ({
                    items: state.items.map((item) => (item.id === id ? next : item)),
                }));
            },

            removeItem: async (id) => {
                const existing = get().items.find((item) => item.id === id);
                await cancelScheduledNotification(existing?.notificationId);

                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            clearCarePlan: async () => {
                await cancelAllScheduledCarePlanNotifications(get().items.map((item) => item.notificationId));
                set({ items: []});
            },

            rescheduleActiveNotifications: async () => {
                const items = get().items;
                await cancelAllScheduledCarePlanNotifications(items.map((item) => item.notificationId));

                const rescheduled = await Promise.all(
                    items.map(async(item) => ({
                        ...item,
                        notificationId: await scheduledIfNeeded({...item, notificationId: undefined}),
                    })),
                );

                set({items: rescheduled});
            },
        }),

        {
            name: 'EEGo-care-plan',
            storage: createJSONStorage(() => AsyncStorage),
        },
    ),
);



// ===========================
// gammelt kode
// ======================

// export const useCarePlanStore = create<CarePlanStore>((set) => ({
//     items: [],

//     addReminder: (item) =>
//         set((state) => ({
//             items: [
//                 {
//                     ...item,
//                     id: `${Date.now()}-${Math.random()}`,
//                     type: "reminder",
//                     status: "active",
//                     createdAt: new Date().toISOString(),
//                 },
//                 ...state.items,
//             ],
//         })),

//         addMedication: (item) =>
//             set((state) => ({
//                 items: [
//                     {
//                         ...item,
//                         id: `${Date.now()}-${Math.random()}`,
//                         type: "medication",
//                         status: "active",
//                         createdAt: new Date().toISOString(),
//                     },
//                     ...state.items,
//                 ],
//             })),

//         addTraining: (item) =>
//             set((state) => ({
//                 items: [
//                     {
//                         ...item,
//                         id: `${Date.now()}-${Math.random()}`,
//                         type: "training",
//                         status: "active",
//                         createdAt: new Date().toISOString(),
//                     },
//                     ...state.items,
//                 ],
// })),
//         markDone: (id) =>
//             set((state) => ({
//                 items: state.items.map((item) =>
//                 item.id === id ? {
//                     ...item, status: "done"} : item 
//                 ),
//             })),

//             markDelayed: (id, minutes) =>
//                 set((state) => ({
//                     items: state.items.map((item) =>
//                     item.id === id
//                     ? {
//                         ...item,
//                         status: "delayed",
//                         delayedTill: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
//                     }
//                 :item
//             ),
//      })),

//      removeItem: (id) =>
//         set((state) => ({
//             items: state.items.filter((item) => item.id !== id),
//         })),

//         clearCarePlan: () =>
//             set({
//                 items: [],
//             }),
//         }))