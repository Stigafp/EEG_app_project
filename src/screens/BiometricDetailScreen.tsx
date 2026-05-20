import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useMemo, useState, useEffect } from 'react';
import COLORS from '../constants/colors';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useDeviceDataStore } from '../stores/deviceDataStore';
import LiveEEGChart from '../components/charts/LiveEEGChart';
import { analyseEEGTrend } from '../utils/eegAnalyse';
import EEGTrendSummary from '../components/charts/EEGTrendSummary';
import EEGScoreTrendChart from '../components/charts/EEGScoreTrendChart';
import EEGDayChart from '../components/charts/EEGDayChart';
import VitalDetailChart from '../components/charts/VitalDetailChart';
import { TimeRange } from '../utils/buildTimeRangeData';

type BiometricDetailType = "eeg" | "heartRate" | "spo2" | "temp";

type ViewMode = "live" | "period" | "trend";
type PeriodRange = Extract<TimeRange, "hour" | "day" | "week" | "month" | "year">;

const VIEW_MODES : {key: ViewMode; label: string}[] =[
    {key: "live", label: "Live"},
    {key: "period", label: "Periode"},
    {key: "trend", label: "Trend"},
];

const PERIOD_RANGES: {key: PeriodRange; label: string}[] =[
    {key: "hour", label: "Time"},
    {key: "day", label: "Dag"},
    {key: "week", label: "Uge"},
    {key: "month", label: "Måned"},
    {key: "year", label: "År"},
];

// function isTimeRange(mode: ViewMode): mode is TimeRange {
//     return mode !== "live" && mode !== "trend";
// }

function getPreviousPeriod(current: PeriodRange): PeriodRange {
    const index = PERIOD_RANGES.findIndex((item) => item.key === current);
    const previousIndex = (index - 1 + PERIOD_RANGES.length) % PERIOD_RANGES.length;
    return PERIOD_RANGES[previousIndex].key;
};

function getNextPeriod(current: PeriodRange): PeriodRange {
    const index = PERIOD_RANGES.findIndex((item) => item.key === current);
    const nextIndex = (index + 1) % PERIOD_RANGES.length;
    return PERIOD_RANGES[nextIndex].key;
};;

function downsample(data:number[], targetPoints: number = 50) {
    if(data.length <= targetPoints) return data;

    const bucketSize = Math.floor(data.length / targetPoints);
    const result: number[] = [];

    for(let i = 0; i < targetPoints; i++){
        const start = i * bucketSize;
        const end = start + bucketSize;
        const bucket = data.slice(start, end);

        const average = bucket.reduce((sum, value) => sum + value, 0) / bucket.length;

        result.push(average);
    }
    return result;
}

export default function BiometricDetailScreen({route}: any) {
    const type = route?.params?.type as BiometricDetailType;

    const [viewMode, setViewMode] = useState<ViewMode>("live");
    const [periodRange, setPeriodRange] = useState<PeriodRange>("day");

    const currentPeriodLabel = 
    PERIOD_RANGES.find((item) => item.key === periodRange)?.label ?? "Dag";

    const screenTitle = 
      type === "heartRate" ? "Hjerterytme" :
      type === "spo2" ? "SpO2 - Iltmætning" :
      type === "temp" ? "Temperatur" :
      "EEG";

    const vitalKey = type === "heartRate" ? "bpm" : type === "spo2" ? "spo2" : "temp";
    const vitalUnit = type === "heartRate" ? "BPM" : type === "spo2" ? "%" : "°C";

    // const [viewMode, setViewMode] = useState<ViewMode>("live");

    const { 
        eegSamples, 
        eegIrregular,
        eegTrendHistory,
        eegSampleHistory,
        vitalHistory,
        } = useDeviceDataStore();

    const trendChartData = eegTrendHistory.map((point) => ({
        value: point.score,
    }));

    const eegTrend = analyseEEGTrend(eegSamples);
    

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.container}>
                    <Text style={styles.title}>{screenTitle}</Text>

                    <View style={styles.tabs}>
                        {VIEW_MODES.map((item) => (
                            <TouchableOpacity
                                key={item.key}
                                style={[styles.tabItems, viewMode === item.key && styles.activeTab]}
                                onPress={() => setViewMode(item.key)}
                            >
                                <Text style={[styles.tabText, viewMode === item.key && styles.activeTabText]}>
                                    {item.key === "period" ? currentPeriodLabel : item.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {viewMode === "period" && (
                        <View style={styles.periodSwitcher}>
                            <TouchableOpacity
                                style={styles.periodArrowSwitcherButton}
                                onPress={() => setPeriodRange(getPreviousPeriod(periodRange))}
                            >
                                <Text style={styles.periodArrowSwitcher}>◀</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPeriodRange(getNextPeriod(periodRange))}
                            >
                                <Text style={styles.periodSwitcherText}>{currentPeriodLabel}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.periodArrowSwitcherButton}
                                onPress={() => setPeriodRange(getNextPeriod(periodRange))}
                            >
                                <Text style={styles.periodArrowSwitcher}>▶</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.chartBox}>
                        {viewMode === "live" && type === "eeg" && <LiveEEGChart samples={eegSamples} />}

                        {viewMode === "live" && type !== "eeg" && (
                            <VitalDetailChart
                                data={vitalHistory}
                                vitalKey={vitalKey}
                                title={`${screenTitle} live`}
                                unit={vitalUnit}
                                range="hour"
                            />
                        )}

                        {viewMode === "period" && type === "eeg" && <EEGDayChart data={eegSampleHistory} range={periodRange} />}

                        {viewMode === "period" && type !== "eeg" && (
                            <VitalDetailChart
                                data={vitalHistory}
                                vitalKey={vitalKey}
                                title={`${screenTitle} overblik`}
                                unit={vitalUnit}
                                range={periodRange}
                            />
                        )}

                        {viewMode === "trend" && type === "eeg" && (
                            <View>
                                <EEGScoreTrendChart data={eegTrendHistory} />
                                <EEGTrendSummary trend={eegTrend} />
                            </View>
                        )}

                        {viewMode === "trend" && type !== "eeg" && (
                            <VitalDetailChart
                                data={vitalHistory}
                                vitalKey={vitalKey}
                                title={`${screenTitle} trend`}
                                unit={vitalUnit}
                                range="month"
                            />
                        )}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
  
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        //backgroundColor: COLORS.tertius,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#EAF2F4",
        marginTop: 100,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.primus,
        marginTop: 6,
        marginBottom: 16,
    },
    tabs:{
        width: "80%",
        alignSelf: "center",
        marginBottom: 20,
        flexDirection: "row",
        borderRadius: 16,
        padding: 6,
        backgroundColor: COLORS.diaphanus,
    },
    tabItems: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: "center",
    },
    activeTab: {
        backgroundColor: COLORS.primus,
    },
    tabText: {
        color: COLORS.primus,
        fontWeight: "700",
        textTransform: "uppercase",
    },
    activeTabText: {
        color: COLORS.white,
    },
    periodSwitcher: {
        width: "80%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: COLORS.diaphanus,
        marginBottom: 20,
        borderRadius: 16,
        padding: 8,
    },
    periodArrowSwitcherButton: {
        width: 44,
        height: 28,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
    },
    periodArrowSwitcher: {
        fontSize: 24,
        color: COLORS.primus,
    },
    periodSwitcherText: {
        fontSize: 18,
        color: COLORS.primus,
    },
    
    chartBox: {
        width: "100%",
        backgroundColor: COLORS.diaphanus,
        borderRadius: 24,
        padding: 16,
        minHeight: 200,
    },
    placeholder: {
        color: COLORS.primus,
        fontSize: 16,
        fontWeight: "700",
    },
    metricTitle: {
        fontSize: 22,
        fontWeight: "800",
        color: COLORS.primus,
        marginBottom: 12,
    },
    metricText: {
        fontSize: 17,
        fontWeight: "600",
        color: COLORS.primus,
        marginBottom: 8,
    },
    explanation: {
        fontSize: 14,
        lineHeight: 20,
        color: COLORS.primus,
        marginTop: 16,
        opacity: 0.8,
    },

});


// ===============================
// GAMMEL KODE
// ===============================

// : viewMode === "trend" && (
//     <View>
//         <Text style={styles.metricTitle}>Signal trend</Text>

//         <Text style={styles.metricText}>Status: {eegTrend.status}</Text>

//         <Text style={styles.metricText}>Spike tal: {eegTrend.spikeCount}</Text>

//         <Text style={styles.metricText}>Gennemsnitlig amplitude: {eegTrend.averageAmplitude.toFixed(2)}</Text>

//         <Text style={styles.metricText}>Maksimal amplitude: {eegTrend.maxAmplitude.toFixed(2)}</Text>

//         <Text style={styles.explanation}>
//             Dette er min prototype anfaldsdetektion. Simpel analyse ved signalets udsving og spikes fra sample-bufferen.
//         </Text>
//     </View>
// )

{/* {viewMode === "day" && type === "heartRate" && (
                    <VitalDetailChart
                        data={vitalHistory}
                        vitalKey={vitalKey}
                        title={screenTitle}
                        unit={vitalUnit}
                    />
                )}
                
                {viewMode === "day" && type === "spo2" && (
                    <VitalDetailChart
                        data={vitalHistory}
                        vitalKey={vitalKey}
                        title={screenTitle}
                        unit={vitalUnit}
                    />
                )}
                
                {viewMode === "day" && type === "temp" && (
                    <VitalDetailChart
                        data={vitalHistory}
                        vitalKey={vitalKey}
                        title={screenTitle}
                        unit={vitalUnit}
                    />
                )} */}


// dato: 2025-05-06

// return (
//     <SafeAreaView style={styles.screen}>
//         <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.container}>
//             <Text style={styles.title}>{screenTitle}</Text>
//             {/* <Text style={styles.subtitle}>Status: {eegIrregular}</Text> */}
//             <View style={styles.tabs}>
//                 {(["live", "day", "week", "trend"] as ViewMode[]).map((item) => (
//                     <TouchableOpacity
//                         key={item}
//                         style={[styles.tab, viewMode === item && styles.activeTab]}
//                         onPress={() => setViewMode(item)}
//                     >
//                         <Text style={[styles.tabText, viewMode === item && styles.activeTabText]}>{item}</Text>
//                     </TouchableOpacity>
//                 ))}
//             </View>
//             <View style={styles.chartBox}>

//                 {/* //======================
//                 // live
//                 //====================== */}

//                 {viewMode === "live" && type === "eeg" && (
//                     <LiveEEGChart samples={eegSamples} />
//                 )}
                
//                 {viewMode === "live" && type !== "eeg" && (
//                     <VitalDetailChart
//                         data={vitalHistory}
//                         vitalKey={vitalKey}
//                         title={screenTitle}
//                         unit={vitalUnit}
//                     />
//                 )}
//                 {/* //======================
//                 // dag visning
//                 //====================== */}

//                 {viewMode === "day" && type === "eeg" &&(
//                     <EEGDayChart data={eegSampleHistory} />
//                     // <LiveEEGChart samples={downsample(eegSamples, 50)} />
//                 )}

//                 {viewMode === "day" && type !== "eeg" && (
//                     <VitalDetailChart
//                         data={vitalHistory}
//                         vitalKey={vitalKey}
//                         title={`${screenTitle} dagoverblik`}
//                         unit={vitalUnit}
//                     />
//                 )}
                
                
//                 {/* //======================
//                 // uge visning
//                 //====================== */}
//                 {viewMode === "week" && type === "eeg" && (
//                     <View>
//                         <EEGScoreTrendChart data={eegTrendHistory} />
//                     </View>
//                 )}

//                 {viewMode === "week" && type !== "eeg" && (
//                     <VitalDetailChart
//                         data={vitalHistory}
//                         vitalKey={vitalKey}
//                         title={`${screenTitle} ugeoverblik`}
//                         unit={vitalUnit}
//                     />
//                 )}
//                 {/* //======================
//                 // trend visning
//                 //====================== */}
//                 {viewMode === "trend" && type === "eeg" && (
//                     <View>
//                         {/* <LiveEEGChart samples={eegTrendHistory.map((point) => point.score)} /> */}
//                         <EEGScoreTrendChart data={eegTrendHistory} />
//                         <EEGTrendSummary trend={eegTrend} />
//                     </View>
//                 )}
                
//                 {viewMode === "trend" && type !== "eeg" && (
//                     <VitalDetailChart
//                         data={vitalHistory}
//                         vitalKey={vitalKey}
//                         title={`${screenTitle} trend`}
//                         unit={vitalUnit}
//                     />
//                 )}
//             </View>
//         </View>
//         </ScrollView>
//     </SafeAreaView>
//   )