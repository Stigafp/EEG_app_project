import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import COLORS from '../constants/colors';
import ChartComponentIndex from './charts/ChartComponentIndex';
import { ChartType, ChartPoint } from './charts/chartTypes';

//type ChartType = "none" | "line" | "bar";

type BiometricCardProps = {
    icon: string;
    title: string;
    value: string | number;
    unit?: string;
    chartType?: ChartType;
    chartData?: ChartPoint[];
    eegSamples?: number[];
    onPress?: () => void;
}

export default function BiometricCard({ 
    icon,
    title, 
    value, 
    unit, 
    chartType = "none", 
    chartData = [],
    eegSamples = [],
    onPress,
}: BiometricCardProps){ 
    return (
        <TouchableOpacity onPress={onPress}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.valueRow}>
            <Text style={styles.value}>{value}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
            </View>

            <ChartComponentIndex 
              type={chartType} 
              data={chartData} 
              samples={eegSamples}
            />
        </View>
        </TouchableOpacity>
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
        shadowColor: COLORS.gray,
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
      color: COLORS.primus,
    },
    chartText: {
      fontSize: 13,
      opacity: 0.55,
    },
  });