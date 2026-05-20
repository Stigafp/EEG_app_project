import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import COLORS from '../constants/colors';

type  CardType = "default" | "notification" | "reminder" | "medicinPlan";

type Action = {
    label: string;
    onPress: () => void;
}

type DashboardCardProps = {
    type?: CardType;
    date?: Date | string;
    title?: string;
    description?: string;
    children?: React.ReactNode;
    
    //dismissible?: boolean;
    onDismiss?: () => void;
    onDone?: () => void;
    onRemind?: () => void;
    remindMinutes?: number;

    actions?: Action[];

    //variant?: "default" | "notification" | "reminder";
}

function formatDateMonth(date?: Date | string){
    if(!date) return null;

    const value = typeof date === "string" ? new Date(date) : date;

    return value.toLocaleDateString('da-DK', {
        month: 'long',
        day: 'numeric',
    });
}

function getActions({
    type,
    onDone,
    onRemind,
    onDismiss,
    remindMinutes = 15,
}:{
    type: CardType;
    onDone?: () => void;
    onRemind?: () => void;
    onDismiss?: () => void;
    remindMinutes?: number;
}): Action[] {
    switch (type){
        case "reminder":
            return[
                {label: "Done", onPress: onDone ?? (() => {}) },
                {label: `Påmind om ${remindMinutes} min.`, onPress: onRemind ?? (() => {}) ,
            },
        ];

        case "notification":
            return [{ label: "Dismiss", onPress: onDismiss ?? (() => {}) }];

        case "medicinPlan":
            return[
                {label: "Done", onPress: onDone ?? (() => {}) },
                {label: `Påmind om ${remindMinutes} min.`, onPress: onRemind ?? (() => {}) ,
            },
        ];
        case "default":
            return [];
    }
}



export default function DashboardCard({
  type = "default",
  date,
  title,
  description,
  children,
  onDismiss,
  onDone,
  onRemind,
  remindMinutes = 15,
  actions,
}: DashboardCardProps) {
    const formattedDate = formatDateMonth(date);

    const resolvedActions =
        actions ??
        getActions({
            type,
            onDone,
            onRemind,
            onDismiss,
            remindMinutes,
    })


    return (
        <View style={[styles.card, styles[type]]}>
            <View style={styles.header}>
                <View style={{flex:1 }}>
                    <View style={styles.titleAndDateContainer}>
                    {title && <Text style={styles.title}>{title}</Text>}
                    {formattedDate && <Text style={styles.date}>{formattedDate}</Text>}
                    </View>
                    {description && <Text style={styles.description}>{description}</Text>}
                </View>
            </View>

            {children && <View style={styles.content}>{children}</View>}

            <View style={styles.separator}></View>

            {resolvedActions.length > 0 && (
                <View style={styles.actions}>
                    {resolvedActions.map((action, index) => (
                        <TouchableOpacity 
                            key={index} 
                            onPress={action.onPress}
                            style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{action.label}</Text>

                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
      width: "85%",
      minWidth: 300,
      maxWidth: 420,
      alignSelf: "center",
      backgroundColor: COLORS.quartusLight,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
  
    default: {},

    notification: {
      backgroundColor: COLORS.lightGray,
    },
    reminder: {
      backgroundColor: COLORS.lightGray,
    },
    medicinPlan: {
      backgroundColor: COLORS.lightGray,
    },
  
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    titleAndDateContainer: {
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.primus,
    },

    description: {
        marginBottom: 8,
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
      },
  
    date: {
      fontSize: 12,
      color: '#555',
      fontWeight: '500',
    },

    dismiss: {
      fontSize: 18,
      paddingHorizontal: 8,
    },
  
    content: {
      marginTop: 8,
    },
  
    actions: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 12,
    },
  
    actionButton: {
        flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: COLORS.lightGray,
    },
  
    actionButtonText: {
      color: COLORS.primus,
      fontWeight: '700',
      textAlign: 'center',
    },
    separator: {
      height: 1,
      marginTop: 12,
      backgroundColor: COLORS.primus,

      marginHorizontal: 22,
      opacity: 0.5,
    },
  })