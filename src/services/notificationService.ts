import { Platform } from "react-native";
import * as Notifications from 'expo-notifications';
import {useNotificationStore} from '../stores/notificationStore';

export type CarePlanNotificationPayload = {
    carePlanItemId: string;
    type: 'medication' | 'reminder' | 'training';
    title: string;
    description?: string;
    scheduledAt: string;
};

const REMINDER_CHANNEL_ID = 'care-plan-reminders';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowList: true,
    }),
});

export async function requestNotificationPermissions(){
    const existing = await Notifications.getPermissionsAsync();

    if(existing.status === 'granted') return true;

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status == 'granted';
};

export async function scheduleCarePlanNotification(payload: CarePlanNotificationPayload){
    const scheduledDate = new Date(payload.scheduledAt);

    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate.getTime() <= Date.now()) {
        return undefined;
    }

    const hasPermission = await requestNotificationPermissions();
    if(!hasPermission) return undefined;

    return Notifications.scheduleNotificationAsync({
        content: {
            title: getCarePlanNotificationTitle(payload.type, payload.title),
            body: payload.description ?? 'Det er tid til din planlagte påmindelse.',
            sound: 'default',
            data: {
                kind: 'care-plan-reminder',
                carePlanItemId: payload.carePlanItemId,
                type: payload.type,
                scheduledAt: payload.scheduledAt,
            },
        },

        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: scheduledDate,
        },
    });
}

export async function cancelScheduledNotification(notificationId?: string){
    if(!notificationId) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error){
        console.warn("Kunne ikke annullere scheduled notifikation", error);
    }
}

export async function cancelAllScheduledCarePlanNotifications(notificationIds: Array<string | undefined>){
    await Promise.all(notificationIds.filter(Boolean).map((id) => cancelScheduledNotification(id)));
};

function getCarePlanNotificationTitle(type: CarePlanNotificationPayload["type"], title: string){
    switch(type){
        case 'medication':
            return `Medicin ${title}`;
        case 'training':
            return `Træning ${title}`;
        case 'reminder':
        default:
            return `Påmindelse ${title}`;
        
    };
};

function saveNotificationToStore(notification: Notifications.Notification){
    const content = notification.request.content;
    const data = content.data ?? {};
    const nativeId = notification.request.identifier;

    const relatedItemId = typeof data.carePlanItemId === "string" ? data.carePlanItemId : undefined;

    useNotificationStore.getState().upsertNotification({
        id: nativeId,
        nativeNotificationId: nativeId,
        relatedItemId,
        severity: "INFO",
        source: relatedItemId ? 'CARE_PLAN' : "SYSTEM",
        title: content.title ?? 'Notifikation',
        message: content.body ?? '',
        createdAt: new Date(notification.date || Date.now()).toISOString(),
    
    });
}

export async function syncPresentedNotificationToStore(){
    try {
        const presented = await Notifications.getPresentedNotificationsAsync();
        presented.forEach(saveNotificationToStore);
    } catch (error){
        console.warn("Kunne ikke synkronisere presented notifikationer", error);
    };
};

export function startNotificationObservers(){
    const receivedSubscription = Notifications.addNotificationReceivedListener(saveNotificationToStore);
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        saveNotificationToStore(response.notification);
    });

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if(response?.notification) saveNotificationToStore(response.notification);
      })
      .catch((error) => console.warn('kunne ikke hente sidste notifikation', error));

    syncPresentedNotificationToStore();

    return () => {
        receivedSubscription.remove();
        responseSubscription.remove();
    };
};