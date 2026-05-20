import React, {useState, useRef, useMemo} from 'react'
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Animated, Button, StyleSheet, Text, View, ScrollView} from 'react-native';
import {Device} from 'react-native-ble-plx';
import {disconnectDevice, scanAndConnectToDevice} from '../ble/bleService';
import {
  //readBPM, 
  // monitorBpm, 
  // monitorSpO2, 
  // monitorTemp, 
  // monitorDeviceState, 
  monitorVitals,
  monitorEEG,
} from '../ble/bleService';
//import InfoOverviewCard from '../components/InfoOverviewCard';
import BiometricCard from '../components/BiometricCard';
import {useDeviceDataStore} from '../stores/deviceDataStore';
import {useNotificationStore} from '../stores/notificationStore';
import COLORS from '../constants/colors';
//import Header from '../components/Header';
import NotificationCenter from '../components/NotificationCenter';
import DashboardCard from '../components/DashboardCard';
import {useCarePlanStore} from '../stores/carePlanStore';
import {analyseEEGTrend} from '../utils/eegAnalyse';
import {buildDailyAnalysis} from '../utils/buildDailyAnalysis';
import DailyAnalysisCard from '../components/DailyAnalysisCard';

type Props = {
  onScroll: any;
};

export default function DashboardScreen({onScroll}: Props) {
  const [status, setStatus] = useState("Klar til scanning");
  const [device, setDevice] = useState<Device | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);

  const latestNotification = useNotificationStore((state) => state.notifications.find((notification) => !notification.dismissed));
  const dismissNotification = useNotificationStore((state) => state.dismissNotification);
  const hasNotifications = Boolean(latestNotification);

  const notifications = useNotificationStore((state) => state.notifications);
  // const hasNotifications = notifications.length > 0;

  const items = useCarePlanStore((state) => state.items);
  const markDone = useCarePlanStore((state) => state.markDone);
  const markDelayed = useCarePlanStore((state) => state.markDelayed);

  const activeItems = items
            .filter((item) => item.status === "active" || item.status === "delayed")
            .sort((a,b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  
  
  const medicationPlan = activeItems
    .filter((item) => item.type === "medication")
    .slice(0, 3);

  
  const reminderAndTraining = activeItems
    .filter((item) => item.type === "reminder" || item.type === "training")
    .slice(0, 3);


  const hasMedicationPlan = medicationPlan.length > 0;
  const hasReminderAndTraining = reminderAndTraining.length > 0;


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
    addTimestampedEEGSamples,
    addEEGTrendPoint,
    eegTrendHistory,
    vitalHistory,
    seizureLogs,
    healthKitWeeklyData,
  } = useDeviceDataStore();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const dailyAnalysis = useMemo(
    () => buildDailyAnalysis({
      eegTrendHistory,
      vitalHistory,
      seizureLogs,
      healthKitWeeklyData,
    }),
    [eegTrendHistory, vitalHistory, seizureLogs, healthKitWeeklyData]
  );

  
  const scrollY = useRef(new Animated.Value(0)).current;
  const bleStatusText = device
    ? `${deviceName ?? "NeuroKrown"} forbundet`
    : "Køb en NeuroKrown i dag!";

  async function handleScanForDevice(){
    setDevice(null);
    setDeviceName(null);

    scanAndConnectToDevice(
      (connectedDevice) => {
        setDevice(connectedDevice);
      },
      (message) => {
        setStatus(message);
      },
      (name) => {
        setDeviceName(name);
      }
    )
  }

  function handleStartLiveVitals(){
    console.log("START LIVE VITALS PRESSED");
    if(!device){
      setStatus("Ingen enhed forbundet");
      return;
    }
  
  const vitalsSub = monitorVitals(
    device,
    ({bpm, spo2, temp, state,audioState, eegIrregular, micLevel, timestampMs}) => {
      setVitals({
        bpm,
        spo2,
        temp,
        state,
        audioState,
        eegIrregular,
        micLevel,
        timestampMs,
      });
    },
    setStatus
  );
  let lastTrendAt = 0;
  let eegBuffer: number[] = [];

  const eegSub = monitorEEG(
    device,
    (packet) => {
      addEEGSamples(packet.samples);
      addTimestampedEEGSamples(packet.samples);

      eegBuffer = [...eegBuffer, ...packet.samples].slice(-500);

      const now = Date.now();

      if(now - lastTrendAt > 5000 && eegBuffer.length >= 20){
        const trend = analyseEEGTrend(eegBuffer);

        addEEGTrendPoint({
          timestampMs: now,
          score: trend.score,
          spikeCount: trend.spikeCount,
          averageAmplitude: trend.averageAmplitude,
          maxAmplitude: trend.maxAmplitude,
        });

        lastTrendAt = now;
      }
    },
    setStatus
  );

  setSubscriptions([vitalsSub, eegSub]);
  setStatus("Live EEG og vitals monitoring startet");
}


  

  function handleStopLiveVitals(){
    subscriptions.forEach(sub => sub.remove());
    setSubscriptions([]);
    setStatus("Live vitals monitoring stoppet");
  }
    
  return (
    <SafeAreaProvider>
    <View style={styles.container}>
      {/* <Header
        title="EEGo"
        bleStatus={bleStatusText}
        deviceName={deviceName}
        showBackButton={false}
        scrollY={scrollY}
      /> */}
      <Animated.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>

          <DailyAnalysisCard analysis={dailyAnalysis} />

          {hasNotifications && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Dine Notifikationer</Text>
              <DashboardCard
                type="notification"
                title={latestNotification?.title ?? "Ny notifikation"}
                date={latestNotification?.createdAt ?? new Date().toISOString()}
                description={latestNotification?.message ?? "Ingen besked"}
                onDismiss={() => dismissNotification(latestNotification?.id ?? "")}
                // type="notification"
                // title="Ny besked!"
                // date="2026-09-09"
                // description="hej med dig"
              />
            </View>
          )}

          <View style={styles.separator}></View>

          {hasMedicationPlan && (

            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Din medicin plan</Text>
              {medicationPlan.map((item) => (
              <DashboardCard
                key={item.id}
                type="medicinPlan"
                title={item.title}
                description={item.description}
                date={item.scheduledAt}
                onDone={() => markDone(item.id)}
                onRemind={() => markDelayed(item.id, 15)}
                remindMinutes={15}
              >
                {item.dosage && (
                  <Text style={styles.dosage}>{item.dosage}</Text>
                )}
              </DashboardCard>
              ))}
            </View>
          )}
          

          {hasReminderAndTraining && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Påmindelser</Text>

              {reminderAndTraining.map((item) => (
                <DashboardCard
                  key={item.id}
                  type="reminder"
                  title={item.title}
                  description={item.description}
                  date={item.scheduledAt}
                  onDone={() => markDone(item.id)}
                  onRemind={() => markDelayed(item.id, 15)}
                  remindMinutes={15}
                />
              ))}
              </View>
            )}

          <View style={{flex:1, justifyContent:"flex-end"}}>
            <View style={styles.statusContainer}>
              <Text style={styles.label}>Status:</Text>
                <Text style={styles.text}>{status}</Text>

                <Text style={styles.label}>Device fundet:</Text>
                <Text style={styles.text}>{deviceName ?? "Ingen enhed fundet"}</Text>

                <Text style={styles.label}>Heart Rate:</Text>
                <Text style={styles.text}>{bpm}</Text>
            </View>

            <View style={styles.buttonContainer}>
          <Button title="Start live vitals" onPress={handleStartLiveVitals} />
          </View>
          <View style={styles.buttonContainer}>
          <Button title="Stop live vitals" onPress={handleStopLiveVitals} />
          </View>

          {/* // hjælpe funktioner til at scanne efter enhed og afbryde forbindelse */}
          <View style={styles.buttonContainer}>
          <Button title="Scan efter enhed" onPress={handleScanForDevice} />
          </View>
          <View style={styles.buttonContainer}>
          <Button title="Afbryd forbindelse" onPress={() => {
            if (device) {
              disconnectDevice(device);
              setDevice(null);
              setStatus("Forbindelse afbrudt");
            }
          }} />

          </View>
          </View>
          </View>
        </Animated.ScrollView>
        </View>
      </SafeAreaProvider>
    )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    //backgroundColor: COLORS.tertius,
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  content: {
    flex: 1,
    // justifyContent: "center",
    // alignItems: "center",
  },
  sectionContainer: {
    //backgroundColor: COLORS.primus,
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },

  title:{
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "left",
    paddingTop: 25,
  },
  label:{
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  text:{
    fontSize: 18,
    marginBottom: 16,
  },
  dosage:{
    fontSize: 14,
    marginTop: 8,
  },
  scrollView:{
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0)",
    marginVertical: 16,
  },
  statusContainer: {
    backgroundColor: COLORS.diaphanus,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  buttonContainer: {
    backgroundColor: COLORS.diaphanus,
    marginHorizontal: 40,
    marginVertical: 4,
    padding: 8,
    borderRadius: 16,
  },
});