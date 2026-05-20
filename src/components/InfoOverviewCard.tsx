import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../constants/colors';

type ChartType = "none" | "line" | "bar";

type InfoOverviewCardProps = {
    icon: string;
    title: string;
    value: string | number;
    unit?: string;
    chartType?: ChartType;
}

export default function InfoOverviewCard({ 
    icon,
    title, 
    value, 
    unit, 
    chartType = "none", 
}: InfoOverviewCardProps){ 
    return (
        <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.diaphanus,
        borderRadius: 18,
        marginVertical:5,
        marginHorizontal:20,
        paddingLeft: 12,
        paddingRight: 5,
        paddingVertical: 12,
        shadowOffset: {width:2, height:2},
        shadowColor: COLORS.white,
        shadowOpacity: 0.3,
        shadowRadius:3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 14,
    },
    icon: {
      fontSize: 22,
      marginRight: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
    },
    valueRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginBottom: 14,
    },
    value: {
      fontSize: 38,
      fontWeight: "800",
    },
    unit: {
      fontSize: 16,
      marginLeft: 6,
      marginBottom: 6,
    },
    chartPlaceholder: {
      height: 70,
      borderRadius: 16,
      backgroundColor: "rgba(0,0,0,0.06)",
      alignItems: "center",
      justifyContent: "center",
    },
    chartText: {
      fontSize: 13,
      opacity: 0.55,
    },
  });