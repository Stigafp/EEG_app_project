import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { LineChart } from 'react-native-gifted-charts'
import COLORS from '../../constants/colors'
import { EEGTrendPoint } from '../../stores/deviceDataStore'

type props = {
    data: EEGTrendPoint[];
};

export default function EEGScoreTrendChart({ data }: props) {
    if(!data || data.length === 0){
        return (
            <Text style={styles.emptyDataText}>Ingen data tilgængelig</Text>
        );
    }

    const chartData = data.slice(-20).map((point) => ({
        value: point.score,
    }));


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signal score over tid</Text>

      <LineChart
        data={chartData}
        height={140}
        maxValue={100}
        spacing={18}
        thickness={5}
        curved={true}
        hideDataPoints={true}
        hideRules={true}
        hideYAxisText={true}
        hideAxesAndRules={true}
        color={COLORS.primus}
        initialSpacing={0}
        endSpacing={0}
        disableScroll={true}
      />

      <View style={styles.rangeRow}>
        <Text style={styles.rangeText}>Lav</Text>
        <Text style={styles.rangeText}>Høj</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    emptyDataText: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.diaphanus,
        textAlign: "center",
        marginTop: 20,
    },
    container: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.primus,
        marginBottom: 12,
    },
    rangeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 6,
    },
    rangeText: {
        fontSize: 14,
        fontWeight: "500",
        color: COLORS.primus,
        opacity: 0.7,
    },
});