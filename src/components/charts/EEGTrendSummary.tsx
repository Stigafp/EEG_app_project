import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import COLORS from '../../constants/colors';
import { EEGTrendResultat } from '../../utils/eegAnalyse';

type Props = {
    trend: EEGTrendResultat;
};

export default function EEGTrendSummary({ trend }: Props) {
    const statusText =
        trend.status === "HIGH"
        ? "Højt signal-udsving"
        : trend.status === "MEDIUM"
        ? "Moderat signal-udsving"
        : "Lavt signal-udsving";
    
    const statusColor =
        trend.status === "HIGH"
        ? COLORS.red
        : trend.status === "MEDIUM"
        ? COLORS.orange
        : COLORS.green;

  return (
    <View style={styles.container}>
        <Text style={[styles.title, {color: statusColor}]}>{statusText}</Text>

        <View style={styles.scoreRow}>
            <Text style={styles.label}>Score:</Text>
            <Text style={[styles.value, {fontWeight: "900", color: statusColor}]}>{trend.score} / 100</Text>
        </View>

        <View style={styles.scoreBarContainer}>
                <View style={[styles.scoreFill, {width: `${trend.score}%`, backgroundColor: statusColor},
                ]}
                />
            </View>

        <View style={styles.row}>
            <Text style={styles.label}>Spike tal:</Text>
            <Text style={styles.value}>{trend.spikeCount}</Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Gennemsnitlig amplitude:</Text>
            <Text style={styles.value}>{trend.averageAmplitude.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Max amplitude:</Text>
            <Text style={styles.value}>{trend.maxAmplitude.toFixed(2)}</Text>
        </View>

        <View style={styles.spikeContainer}>
            <Text style={styles.label}>Seneste spikes:</Text>

            {trend.spikes.slice(-5).map((spike) => (
                <Text key={spike.index} style={styles.spikeText}>
                    Punkt {spike.index}: {spike.value.toFixed(2)}
                </Text>
            ))}
            {trend.spikes.length === 0 && (
                <Text style={styles.value}>Ingen tydelige spikes fundet</Text>
            )}
        </View>

        <Text style={styles.explanation}>
            Dette er min prototype anfaldsdetektion. Simpel analyse ved signalets udsving og spikes fra sample-bufferen.
        </Text>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 18,
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: COLORS.primus,
        marginBottom: 14,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.primus,
    },
    value: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.primus,
    },
    explanation: {
        marginTop: 12,
        fontSize: 14,
        lineHeight: 18,
        color: COLORS.primus,
        opacity: 0.8,
    },
    spikeContainer: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.primus,
    },
    spikeText: {
        fontSize: 13,
        color: COLORS.primus,
        marginBottom: 4,
    },
    scoreRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    scoreBarContainer: {
        height: 20,
        backgroundColor: COLORS.diaphanus,
        borderRadius: 999,
        overflow: "hidden",
        marginBottom: 30,
    },
    scoreFill: {
        height: "100%",
        borderRadius: 999,
    },

});