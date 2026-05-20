import { View, Text, Animated, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import {AppNotification, useNotificationStore} from '../stores/notificationStore';

export default function NotificationsScreen() {

  const notifications = useNotificationStore((state) => state.notifications);
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const clearNotifications = useNotificationStore((state) => state.clearNotifications);


  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Dine notifikationer</Text>

          {notifications.length > 0 && (

          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearNotifications}
          >
            <Text style={styles.clearButtonText}>Ryd alle</Text>
          </TouchableOpacity>
          )}
        </View>

        {notifications.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Ingen notifikationer</Text>
            <Text style={styles.emptyText}>Her vil du kunne se alle dine notifikationer.</Text>
          </View>
        )}

        {notifications.map((notification) => (
          <NotificationRow
            key={notification.id}
            notification={notification}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </ScrollView>

    </SafeAreaView>
  )
}

function NotificationRow({
  notification,
  onDismiss,
}: {
  notification: AppNotification;
  onDismiss: () => void;
}) {
  return (
    <View style={[styles.card, notification.dismissed && styles.cardDismissed]}>
      <View style={styles.cardHeader}>
        <View style={{flex:1}}>
          <Text style={styles.cardTitle}>{notification.title ?? 'Notifikation'}</Text>
          <Text style={styles.metaText}>
            {formatDateTime(notification.createdAt)} - {notification.source ?? 'SYSTEM'}
          </Text>
        </View>

        <View style={[styles.badge, notification.dismissed && styles.badgeDismissed]}>
          <Text style={styles.badgeText}>{notification.dismissed ? 'Lukket' : 'Ny'}</Text>
        </View>
      </View>

      <Text style={styles.message}>{notification.message}</Text>

      {!notification.dismissed && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
      )}

    </View>
  );
};

function formatDateTime(value: string){
  return new Date(value).toLocaleString('da-DK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primus,
  },
  clearButton: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: COLORS.primus,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primus,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  cardDismissed: {
    opacity: 0.65,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primus,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gray,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: COLORS.primus,
  },
  badgeDismissed: {
    backgroundColor: COLORS.gray,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '800',
  },
  message: {
    fontSize: 14,
    color: COLORS.primus,
    lineHeight: 20,
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    alignItems: 'flex-start',
    borderRadius: 10,
    marginTop: 12,
  },
  dismissButtonText: {
    color: COLORS.primus,
    fontWeight: '800',
  },
});