import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import COLORS from '../constants/colors'
import MOOD_ICONS from '../constants/icons'
import { DailyAnalysis } from "../utils/buildDailyAnalysis";

type Props = {
    analysis: DailyAnalysis;
};

// function getIconForMood(mood: DailyAnalysis["mood"]) {
//     switch(mood){
//         case "good":
//             return ICONS.superGood;
//         case "calm":
//             return ICONS.calm;
//         case "tired":
//             return ICONS.tired;
//         case "stressed":
//             return ICONS.stressed;
//         case "anxious":
//             return ICONS.anxious;
//         case "angry":
//             return ICONS.angry;
//         case "sad":
//             return ICONS.sad;
//         case "alert":
//             return ICONS.alert;
//         case "severe":
//             return ICONS.severe;
//         default:
//             return ICONS.neutral;
//     }
// }

function getScoreLabel(score:number){
    if(score >=80 ) return "Stabil";
    if(score >=65 ) return "Rolig";
    if(score >= 45) return "Let belastet";

    return "Belastet";
}

export default function DailyAnalysisCard({ analysis }: Props) {

    const moodIcon = MOOD_ICONS[analysis.mood];

  return (
    <View style={styles.card}>
        <View style={styles.textColumn}>
            <Text style={styles.title}>{analysis.title}</Text>

            <Text style={styles.message}>{analysis.message}</Text>

            <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>{analysis.score}/100</Text>
                <Text style={styles.scoreLabel}>{getScoreLabel(analysis.score)}</Text>
            </View>

            {analysis.factors.length > 0 && (
                <View style={styles.factorRow}>
                    {analysis.factors.map((factor) => (
                        <View key={factor} style={styles.factorPill}>
                            <Text style={styles.factorText}>{factor}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>

        <View style={styles.iconBox}>
            <Image
              source={moodIcon.image}
              style={styles.moodImage}
              resizeMode="contain"
              accessibilityLabel={moodIcon.accessibilityLabel}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
        width: "106%",
        minHeight: 112,
        borderRadius: 18,
        backgroundColor: COLORS.primus,
        // borderWidth: 1,
        // borderColor: COLORS.white,
        paddingVertical: 8,
        paddingRight: 6,
        paddingLeft: 8,
        padding: 14,
        marginBottom: 18,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    textColumn: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: COLORS.white,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: COLORS.white,
        fontWeight: "400",
        lineHeight: 18,
        marginLeft: 8,
    },
    scoreRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
    },
    scoreText: {
        fontSize: 12,
        fontWeight: "800",
        color: COLORS.white,
    },
    scoreLabel: {
        fontSize: 10,
        opacity: 0.8,
        color: COLORS.white,
        fontWeight: "600",
    },
    factorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
    },
    factorPill: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    factorText: {
        fontSize: 10,
        color: COLORS.white,
        fontWeight: "600",
    },
    iconBox: {
        width: 78,
        height: 78,
        backgroundColor: COLORS.quartus,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    moodImage: {
        width: 72,
        height: 72,
        borderRadius: 16,
    },
});