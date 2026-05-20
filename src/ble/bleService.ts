import { BleManager, Device } from "react-native-ble-plx";
import {Buffer} from "buffer";
import {BLE_DEVICE_NAME} from "./bleConstants";
import {SERVICE_UUID,
        VITALS_CHAR_UUID,
        EEG_CHAR_UUID,
        // BPM_CHAR_UUID,
        // SPO2_CHAR_UUID,
        // TEMP_CHAR_UUID,
        // STATE_CHAR_UUID,
} from "./bleConstants";
import { decodeVitalsPacket, decodeEEGPacket, stateToText } from "./packets";
import { DeviceState } from "../stores/deviceDataStore";

const bleManager = new BleManager();

export function scanAndConnectToDevice(
    onConnected: (device: Device) => void,
    onStatus: (message: string) => void,
    onDeviceName: (name: string) => void
){
    let found = false;
    onStatus("Scanner efter Neurokrown...");

    bleManager.startDeviceScan(null, null, async(error, device) => {
        if (error) {
            bleManager.stopDeviceScan();
            onStatus("BLE fejl: " + error.message);
            return;
        }
  
        if (!device) return;
  
        const name = device.name ?? device.localName;
  
        if (name === BLE_DEVICE_NAME){
            found = true;
            bleManager.stopDeviceScan();

            onDeviceName(name);
            onStatus("Device fundet! Forbinder...");
            
            try{
                const connectedDevice = await device.connect();

                onStatus("Finder services...");
                await connectedDevice.discoverAllServicesAndCharacteristics();

                onStatus("Forbundet til " + name);
                onConnected(connectedDevice);
            } catch (connectError){
                onStatus("Forbindelse fejlede: " + connectError);
            }
        }
    }
);

    setTimeout(() => {
      bleManager.stopDeviceScan();

      if (!found){
        onStatus("Scanning stoppet. Device ikke fundet.");
      }
    }, 10000);
}

export function disconnectDevice(device: Device){
    return device.cancelConnection();
}

export function stopScan(){
    bleManager.stopDeviceScan();
}

// hjælpe funktion til at decode monitoreringskald fra BLE-enheden
function decodeBleText(value: string | null): string {
    if(!value) return "--";
    return atob(value);
}

// hjælpe funktion til at læse BPM fra BLE-enheden - er ikke nødvendig senere
// export async function readBPM(device: Device): Promise<string> {
//     const characteristic = await device.readCharacteristicForService(
//         SERVICE_UUID,
//         BPM_CHAR_UUID
//     );
//     if (!characteristic.value){
//         return "Ingen værdi fundet";
//     }

//     const decodedValue = atob(characteristic.value);

//     return decodedValue;
// }


export function monitorVitals(
    device: Device,
    onVitals: (data: {
        timestampMs: number;
        bpm: string; 
        spo2: string; 
        temp: string; 
        state: DeviceState;
        audioState: DeviceState;
        eegIrregular: string;
        micLevel: string;
    }) => void,
    onStatus: (message:string) => void
){
    onStatus("Starter Vitals monitoring...");
    return device.monitorCharacteristicForService(
        SERVICE_UUID,
        VITALS_CHAR_UUID,
        (error, characteristic) => {
            console.log("Binær VITALS callback triggered");

            if(error){
                console.log("Binær VITALS error: ", error);
                onStatus("Vitals monitoring fejlede: " + error.message);
                return;
            }

            if(!characteristic?.value){
                console.log("ingen binære vitals værdie fundet");
                return;
            }
            const packet = decodeVitalsPacket(characteristic.value);
            console.log("Binær VITALS decoded: ", packet);

            onVitals({
                timestampMs: packet.timestampMs,
                bpm: packet.bpm < 0 ? "--" : packet.bpm.toFixed(1),
                spo2: packet.spo2 < 0 ? "--" : packet.spo2.toFixed(1),
                temp: packet.temp < 0 ? "--" : packet.temp.toFixed(1),
                state: stateToText(packet.state),
                audioState: stateToText(packet.audioState),
                eegIrregular: packet.eegIrregular.toFixed(2),
                micLevel: String(packet.micLevel),
            });
        }
    );
}

export function monitorEEG(
    device: Device,
    onEEG: (packet: {
        packetId: number;
        timestampMs: number;
        samples: number[];
    }) => void,
    onStatus: (message: string) => void
){
    onStatus("starter EEG monitoring ...");

    return device.monitorCharacteristicForService(
        SERVICE_UUID,
        EEG_CHAR_UUID,
        (error, characteristic) => {
            console.log("Binær EEG callback triggered");

            if(error){
                console.log("Binær EEG error: ", error);
                onStatus("EEG monitoring fejlede: " + error.message);
                return;
            }

            if (!characteristic?.value) return;

            const packet = decodeEEGPacket(characteristic.value);

            console.log("EEG packet: ", packet.packetId, packet.samples);

            onEEG(packet);
        }
    );
}


// ===============================
// GAMMELT KODE
// ==============================

// fjernet pga. mangel på ble ressource limit for UUID af hvert enkelt karakteristisk

// export function monitorBpm(
//     device: Device,
//     onBpm: (value:string) => void,
//     onStatus: (message:string) => void
// ){
//     onStatus("Starter BPM monitoring...");

//     return device.monitorCharacteristicForService(
//         SERVICE_UUID,
//         BPM_CHAR_UUID,
//         (error, characteristic) => {

//             console.log("BPM callback triggered");
//             if (error) {
//                 onStatus("BPM monitoring fejlede: " + error.message);
//                 return;
//             }

//             onBpm(decodeBleText(characteristic?.value ?? null));
//         }
//     );
// }

// export function monitorSpO2(
//     device: Device,
//     onSpO2: (value:string) => void,
//     onStatus: (message:string) => void
// ){
//     onStatus("Starter SpO2 monitoring...");

//     console.log("SPO2 callback triggered");

//     return device.monitorCharacteristicForService(
//         SERVICE_UUID,
//         SPO2_CHAR_UUID,
//         (error, characteristic) => {
//             if (error) {
//                 onStatus("SpO2 monitoring fejlede: " + error.message);
//                 return;
//             }
//             onSpO2(decodeBleText(characteristic?.value ?? null));
//         }
//     );
// }

// export function monitorTemp(
//     device: Device,
//     onTemp: (value:string) => void,
//     onStatus: (message:string) => void
// ){
//     onStatus("Starter Temp monitoring...");

//     return device.monitorCharacteristicForService(
//         SERVICE_UUID,
//         TEMP_CHAR_UUID,
//         (error, characteristic) => {

//             console.log("TEMP callback triggered");
//             console.log("temp error: ", error);
//             if (error) {
//                 onStatus("Temp monitoring fejlede: " + error.message);
//                 return;
//             }
//             onTemp(decodeBleText(characteristic?.value ?? null));
//             console.log("temp raw: ", characteristic?.value);
//             console.log("temp decoded: ", decodeBleText(characteristic?.value ?? null));
//         }
//     );
// }

// export function monitorDeviceState(
//     device: Device,
//     onState: (value:string) => void,
//     onStatus: (message:string) => void
// ){
//     onStatus("Starter Device State monitoring...");

//     return device.monitorCharacteristicForService(
//         SERVICE_UUID,
//         STATE_CHAR_UUID,
//         (error, characteristic) => {

//             console.log("State callback triggered");
//             console.log("state error: ", error);
//             if (error) {
//                 onStatus("Device State monitoring fejlede: " + error.message);
//                 return;
//             }
//             const decoded = decodeBleText(characteristic?.value ?? null);
//             onState(decodeBleText(characteristic?.value ?? null));
//             console.log("device state: " , decoded);
//             onState(decoded);
//         }
//     );
// }