import React, {useRef, useState} from 'react';
import { Animated, Button, StyleSheet, Text, View, ScrollView, ImageBackground } from 'react-native';
import { SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { Device } from 'react-native-ble-plx';
import { disconnectDevice, scanAndConnectToDevice } from './src/ble/bleService';
import AppNavigator from './src/navigation/AppNavigator';
import { 
  // readBPM, 
  // monitorBpm, 
  // monitorSpO2, 
  // monitorTemp, 
  // monitorDeviceState,
  monitorVitals } from './src/ble/bleService';
import InfoOverviewCard from './src/components/InfoOverviewCard';
import { useDeviceDataStore } from './src/stores/deviceDataStore';
import COLORS from './src/constants/colors';
import Header from './src/components/Header';


export default function App(){



    return (
      <SafeAreaProvider>
        <ImageBackground
          source={require('./assets/background/baggrundBillede01.png')}
          style={styles.background}
          resizeMode="cover"
        >
       
      <AppNavigator />
      </ImageBackground>

      </SafeAreaProvider>
      
    )
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});



// ===============================
// GAMMELT KODE
// ==============================

// <Button title="Læs BPM" onPress={handleReadBpm} />
// <Button title="Start live BPM" onPress={handleStartLiveBpm} />
// <Button title="Stop live BPM" onPress={handleStopLiveBpm} />

// // hjælpe funktion til at læse BPM fra BLE-enheden
// async function handleReadBpm(){
//   if(!device){
//     setStatus("Ingen enhed forbundet");
//     return;
//   }

//   const value = await readBPM(device);
//   setBpm(value);
//   setStatus("BPM læst");
// }

// // hjælpe funktion til at starte live monitoring af BPM
// function handleStartLiveBpm(){
//   if(!device){
//     setStatus("Ingen enhed forbundet");
//     return;
//   }

//   const subscription = monitorBpm(
//     device,
//     (value) => {
//       setBpm(value);
//     },
//     (message) => {
//       setStatus(message);
//     }
//   );
//   setBpmSubscription(subscription);
//   setStatus("BPM monitoring startet");
// }

// // hjælpe funktion til at stoppe live monitoring af BPM
// function handleStopLiveBpm(){
//   if(bpmSubscription){
//     bpmSubscription.remove();
//     setBpmSubscription(null);
//     setStatus("BPM monitoring stoppet");
//   }
// }

// <SafeAreaProvider>
      // {/* <SafeAreaView style={styles.container}> */}
      //   <View style={styles.container}>
      //   <Header
      //     title="EEGo"
      //     bleStatus={bleStatusText}
      //     deviceName={deviceName}
      //     showBackButton={false}
      //     //onBackPress={() => {}}
      //     scrollY={scrollY}
      //   />
      //   <Animated.ScrollView
      //     style={styles.scrollView}
      //     contentContainerStyle={styles.scrollContent}
      //     showsVerticalScrollIndicator={false}
      //     onScroll={Animated.event(
      //       [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      //       { useNativeDriver: false },
      //     )}
      //     scrollEventThrottle={16}
      //   >
      //     <View style={styles.content}>

      //     <Text style={styles.label}>Status:</Text>
      //     <Text style={styles.text}>{status}</Text>

      //     <Text style={styles.label}>Device fundet:</Text>
      //     <Text style={styles.text}>{deviceName ?? "Ingen enhed fundet"}</Text>

      //     <Text style={styles.label}>Heart Rate:</Text>
      //     <Text style={styles.text}>{bpm}</Text>

      //     <InfoOverviewCard
      //       icon= "❤️"
      //       title="Heart Rate"
      //       value={bpm}
      //       unit="BPM"
      //       chartType="line"
      //     />

      //     <InfoOverviewCard
      //       icon= "🩸"
      //       title="SpO2"
      //       value={spo2}
      //       unit="%"
      //       chartType="line"
      //     />

      //     <InfoOverviewCard
      //       icon= "🌡️"
      //       title="Temperature"
      //       value={temp}
      //       unit="°C"
      //       chartType="line"
      //     />
      //     <InfoOverviewCard
      //       icon= "⚡"
      //       title="Device State"
      //       value={deviceState}
      //       chartType="none"
      //     />

      //     <InfoOverviewCard
      //       icon= "🔊"
      //       title="Audio State"
      //       value={audioState}
      //       chartType="none"
      //     />
      //     <InfoOverviewCard
      //       icon= "🎤"
      //       title="Mic Level"
      //       value={micLevel}
      //       chartType="none"
      //     />
      //     <InfoOverviewCard
      //       icon= "🧠"
      //       title="EEG Irregular"
      //       value={eegIrregular}
      //       chartType="none"
      //     />


      //     <Button title="Start live vitals" onPress={handleStartLiveVitals} />
      //     <Button title="Stop live vitals" onPress={handleStopLiveVitals} />

      //     {/* // hjælpe funktioner til at scanne efter enhed og afbryde forbindelse */}
      //     <Button title="Scan efter enhed" onPress={handleScanForDevice} />
      //     <Button title="Afbryd forbindelse" onPress={() => {
      //       if (device) {
      //         disconnectDevice(device);
      //         setDevice(null);
      //         setStatus("Forbindelse afbrudt");
      //       }
      //     }} />
      //     </View>
      //   </Animated.ScrollView>
      //   </View>
      // {/* </SafeAreaView> */}
      // </SafeAreaProvider>

      // const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     justifyContent: "center",
//     backgroundColor: COLORS.tertius,
//   },
//   scrollContent: {
//     paddingTop: 120,
//     paddingHorizontal: 24,
//     paddingBottom: 32,
//   },
//   content: {
//     flex: 1,
//     // justifyContent: "center",
//     // alignItems: "center",
//   },
//   title:{
//     fontSize: 36,
//     fontWeight: "bold",
//     marginBottom: 32,
//     textAlign: "left",
//     paddingTop: 25,
//   },
//   label:{
//     fontSize: 16,
//     fontWeight: "bold",
//     marginTop: 16,
//   },
//   text:{
//     fontSize: 18,
//     marginBottom: 16,
//   },
//   scrollView:{
//     flex: 1,
//   },
// });


//   const [status, setStatus] = useState("Klar til scanning");
//   const [device, setDevice] = useState<Device | null>(null);
//   const [deviceName, setDeviceName] = useState<string | null>(null);

//   const {
//     bpm,
//     spo2,
//     temp,
//     deviceState,
//     audioState,
//     eegIrregular,
//     micLevel,
//     setVitals,
//     addEEGSamples,
//   } = useDeviceDataStore();
//   const [subscriptions, setSubscriptions] = useState<any[]>([]);

//   const scrollY = useRef(new Animated.Value(0)).current;
//   const bleStatusText = device
//     ? `${deviceName ?? "NeuroKrown"} forbundet`
//     : "Køb en NeuroKrown i dag!";


//   async function handleScanForDevice(){
//     setDevice(null);
//     setDeviceName(null);

//     scanAndConnectToDevice(
//       (connectedDevice) => {
//         setDevice(connectedDevice);
//       },
//       (message) => {
//         setStatus(message);
//       },
//       (name) => {
//         setDeviceName(name);
//       }
//     )
//   }

//   // starte live monitoring af BPM, SpO2, temperatur og device state
//   function handleStartLiveVitals(){
//     console.log("START LIVE VITALS PRESSED");
//     if(!device){
//       setStatus("Ingen enhed forbundet");
//       return;
//   }

//   // const bpmSub = monitorBpm(device, setBpm, setStatus);
//   // const spo2Sub = monitorSpO2(device, setSpo2, setStatus);
//   // const tempSub = monitorTemp(device, setTemp, setStatus);
//   // const deviceStateSub = monitorDeviceState(device, setDeviceState, setStatus);
//   // setSubscriptions([bpmSub, spo2Sub, tempSub, deviceStateSub]);
  

//   const vitalsSub = monitorVitals(
//     device,
//     ({bpm, spo2, temp, state,audioState, eegIrregular, micLevel, timestampMs}) => {
//       setVitals({
//         bpm,
//         spo2,
//         temp,
//         state,
//         audioState,
//         eegIrregular,
//         micLevel,
//         timestampMs,
//       });
//     },
//     setStatus
//   );
//   setSubscriptions([vitalsSub]);
//   setStatus("Live vitals monitoring startet");
// }
  


//   function handleStopLiveVitals(){
//     subscriptions.forEach(sub => sub.remove());
//     setSubscriptions([]);
//     setStatus("Live vitals monitoring stoppet");
//   }