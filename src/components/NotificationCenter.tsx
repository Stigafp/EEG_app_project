import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useDeviceDataStore } from '../stores/deviceDataStore';
import { useNotificationStore, AppNotification } from '../stores/notificationStore';
import DashboardCard from './DashboardCard';
import COLORS from '../constants/colors';

function getNotificationContent(notification: AppNotification){
    switch (notification.severity){
        case "ALARM":
            return {
                title: "ALARM! fra " + notification.source,
                description: notification.message,
            };
        case "WARNING":
            return {
                title: "Advarsel fra " + notification.source,
                description: notification.message,
            };
        default:
            return {
                title: notification.title ?? "Notifikation",
                description: notification.message + " fra " + notification.source,
            };
    }
}


export default function NotificationCenter() {

    const notifications = useNotificationStore((state) => state.notifications);
    const dismissNotification = useNotificationStore((state) => state.dismissNotification);

    const latestNotification = notifications.find((notification) => !notification.dismissed);

    if (!latestNotification) return null;

    const { title, description } = getNotificationContent(latestNotification);

    return (
        <DashboardCard 
            type="notification" 
            title={title} 
            description={description} 
            onDismiss={() => dismissNotification(latestNotification.id)}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 18,
        backgroundColor: COLORS.lightGray,
        marginBottom: 16,
    },
    alarm: {
        borderWidth: 2,
        borderColor: "red",
    },
    warning: {
        borderWidth: 2,
        borderColor: "orange",
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
    },
    message: {
        fontSize: 16,
        fontWeight: "600",
        marginTop: 4,
    },
    source: {
        fontSize: 14,
        fontWeight: "300",
        marginTop: 6,
    },
});