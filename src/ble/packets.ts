import { Buffer } from "buffer";
import { DeviceState } from "../stores/deviceDataStore";

export type VitalsPacket ={
    timestampMs: number;
    bpm: number;
    spo2: number;
    temp: number;
    state: number;
    audioState: number;
    eegIrregular: number;
    micLevel: number;
};

export function decodeVitalsPacket(base64Value: string): VitalsPacket {
    const buffer = Buffer.from(base64Value, "base64");

    return {
        timestampMs: buffer.readUInt32LE(0),
        bpm: buffer.readInt16LE(4) / 10,
        spo2: buffer.readInt16LE(6) / 10,
        temp: buffer.readInt16LE(8) / 10,
        state: buffer.readUInt8(10),
        audioState: buffer.readUInt8(11),
        eegIrregular: buffer.readInt16LE(12) /100,
        micLevel: buffer.readUint16LE(14),
    };
}

export type EEGPacket = {
    packetId: number;
    timestampMs: number;
    samples: number[];
};

export function decodeEEGPacket(base64Value: string): EEGPacket {
    const buffer = Buffer.from(base64Value, "base64");

    const packetId = buffer.readUInt32LE(0);
    const timestampMs = buffer.readUInt32LE(4);

    const samples: number[] = [];

    for (let i = 0; i < 10; i++){
        const offset = 8 + i * 2;
        samples.push(buffer.readInt16LE(offset) / 10);
    }

    return {
        packetId,
        timestampMs,
        samples,
    };
}

export function stateToText(code: number): DeviceState {
    if(code === 1)return "WARNING";
    if(code === 2)return "ALARM";
    return "NORMAL";
}

