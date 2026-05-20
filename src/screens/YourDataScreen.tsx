import { View, Text, ScrollView, Animated, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useState, useEffect} from 'react'
import BiometricCard from '../components/BiometricCard';
import { useDeviceDataStore } from '../stores/deviceDataStore';
import {SafeAreaView} from 'react-native-safe-area-context';
import COLORS from '../constants/colors';
import { ChartPoint } from '../components/charts/chartTypes';
import { initHealthKit, getTodayHealthSummary, getLatestBodySummary, getWeeklyHealthSummary } from '../services/healthKitService';
import buildWeeklyData from '../utils/buildWeeklyData';


type Props = {
  onScroll: any;
  navigation: any;
};

export default function YourDataScreen({onScroll, navigation}: Props) {
  const [heartRateHistory, setHeartRateHistory] = useState<ChartPoint[]>([]);
  const [spo2History, setSpo2History] = useState<ChartPoint[]>([]);
  const [tempHistory, setTempHistory] = useState<ChartPoint[]>([]);

    const {
    bpm,
    spo2,
    temp,
    deviceState,
    audioState,
    eegIrregular,
    micLevel,
    setVitals,
    addEEGSamples,
    eegSamples,
    eegTrendHistory,
    healthKitWeeklyData,
    setHealthKitWeeklyData,
  } = useDeviceDataStore();

  useEffect(() => {
    const bpmNumber = Number(bpm);

    if (!bpmNumber || Number.isNaN(bpmNumber)) return;

    setHeartRateHistory((prev) => {
      const updated = [...prev, {value: bpmNumber}];
    
    return updated.slice(-20);
  });
}, [bpm]);

useEffect(() => {
  const spo2Number = Number(spo2);
  if (!spo2Number || Number.isNaN(spo2Number)) return;
  setSpo2History((prev) => {
    const updated = [...prev, {value: spo2Number}];
    return updated.slice(-20);
  });
}, [spo2]);

useEffect(() => {
  const tempNumber = Number(temp);
  if (!tempNumber || Number.isNaN(tempNumber)) return;
  setTempHistory((prev) => {
    const updated = [...prev, {value: tempNumber}];
    return updated.slice(-20);
  });
}, [temp]);

const eegIrregularWeeklyData = buildWeeklyData(
  eegTrendHistory.map((point) => ({
    timestampMs: point.timestampMs,
    value: point.score,
  })),
  {
    mode: "countAboveThreshold",
    threshold: 60,
  }
);


// ===================
// apple healthkit integration
// =================
const healthTimeStamp = Date.now();

const [healthSummary, setHealthSummary] = useState<{
  steps: number;
  activeEnergyKcal: number;
  distanceMeters: number;
} | null>(null);

const [bodySummary, setBodySummary] = useState<{
  bodyMassKg: number | null;
  bodyMassIndex: number | null;
  bodyFatPercentage: number | null;
} | null>(null);

useEffect(() => {
  const loadHealthData = async () => {
    const ok = await initHealthKit();
    if(!ok) return;

    const summary = await getTodayHealthSummary();
    const body = await getLatestBodySummary();
    const weeklyData = await getWeeklyHealthSummary();

    setHealthKitWeeklyData(weeklyData);
    setHealthSummary(summary);
    setBodySummary(body);
  };
  loadHealthData();
}, []);


const stepsWeeklyData = buildWeeklyData(
  healthKitWeeklyData.map((point) => ({
    timestampMs: point.timestampMs,
    value: point.steps,
  })),
  {
    mode: "sum",
  }
);

const activeEnergyWeeklyData = buildWeeklyData(
  healthKitWeeklyData.map((point) => ({
    timestampMs: point.timestampMs,
    value: point.activeEnergyKcal,
  })),
  {
    mode: "sum",
  }
);

const distanceWeeklyData = buildWeeklyData(
  healthKitWeeklyData.map((point) => ({
    timestampMs: point.timestampMs,
    value: point.distanceMeters / 1000,
  })),
  {
    mode: "sum",
  }
);


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Animated.ScrollView style={styles.scrollView}>
        <View style={styles.container}>
        <Text style={styles.screenTitle}>Dine data</Text>

          <BiometricCard
            icon= "🧠"
            title="EEG Samples"
            value="Live"
            chartType="liveEeg"
            eegSamples={eegSamples}
            onPress={() => 
              navigation.navigate("BiometricDetail", {
              type: "eeg",
              title: "EEG live",
              })
            }
          />

          <BiometricCard
            icon= "❤️"
            title="Hjerterytme"
            value={bpm}
            unit="BPM"
            chartType="line"
            chartData={heartRateHistory}
            onPress={() =>
              navigation.navigate("BiometricDetail", {
                type: "heartRate",
              })
            }
          />

          <BiometricCard
            icon= "🧠"
            title="EEG Irregular"
            value={eegIrregular}
            chartType="bar"
            chartData={eegIrregularWeeklyData}
          />

          <BiometricCard
            icon= "🩸"
            title="SpO2 - Iltmætning"
            value={spo2}
            unit="%"
            chartType="line"
            chartData={spo2History}
            onPress={() =>
              navigation.navigate("BiometricDetail", {
                type: "spo2",
              })
            }
          />

          <BiometricCard
            icon= "🌡️"
            title="Temperatur"
            value={temp}
            unit="°C"
            chartType="line"
            chartData={tempHistory}
            onPress={() =>
              navigation.navigate("BiometricDetail", {
                type: "temp",
              })
            }
          />
          
          <BiometricCard
            icon= "⚡"
            title="Device State"
            value={deviceState}
            chartType="none"
          />

          <BiometricCard
            icon= "🎤"
            title="Mic Level"
            value={micLevel}
            chartType="none"
          />

          <BiometricCard
            icon= "🔊"
            title="Audio State"
            value={audioState}
            chartType="none"
          />

          <BiometricCard
            icon= "👣"
            title="Antal skridt"
            value={healthSummary? `${healthSummary.steps} steps` : "Loading..."}
            chartType="bar" 
            chartData={stepsWeeklyData}
          />
          <BiometricCard
            icon= "🔥"
            title="Afbrændt energi"
            value={healthSummary? `${healthSummary.activeEnergyKcal} kcal` : "Loading..."}
            chartType="bar"
            chartData={activeEnergyWeeklyData}
          />
          <BiometricCard
            icon= "🏃"
            title="Afstand"
            value={healthSummary? `${Math.round(healthSummary.distanceMeters)} meters` : "Loading..."}
            chartType="bar"
            chartData={distanceWeeklyData}
          />
          <BiometricCard
            icon= "🍔"
            title="Vægt"
            value={bodySummary? `${bodySummary.bodyMassKg} kg` : "Loading..."}
            chartType="none"
          />
          <BiometricCard
            icon= "💪"
            title="BMI"
            value={bodySummary? `${bodySummary.bodyMassIndex} kg/m2` : "Loading..."}
            chartType="none"
          />
          <BiometricCard
            icon= "🍗"
            title="Fedtprocent"
            value={bodySummary? `${bodySummary.bodyFatPercentage} %` : "Loading..."}
            chartType="none"
          />
          
          
          </View>
    </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingTop: 120,
    paddingBottom: 100,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.primus,
    marginBottom: 18,
    marginLeft: 16,
  },
  
});