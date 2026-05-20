import { create } from "zustand";
import { HealthKitDailyPoint } from "../services/healthKitService";
import { useNotificationStore } from "./notificationStore";

export type DeviceState = "NORMAL" | "WARNING" | "ALARM";

export type EEGTrendPoint = {
    timestampMs: number;
    score: number;
    spikeCount: number;
    averageAmplitude: number;
    maxAmplitude: number;
};

export type EEGSamplePoint = {
    timestampMs: number;
    value:number;
};

export type VitalHistoryPoint = {
    timestampMs: number;
    bpm: number | null;
    spo2: number | null;
    temp: number | null;

};

export type SeizureSeverity = "mild" | "moderate" | "severe" | "critical";

export type SeizureLogEntry = {
    id: string;
    timestampMs: number;
    createdAtMs: number;
    durationSeconds: number | null;
    severity: SeizureSeverity;
    triggers: string[];
    symptoms: string[];
    emotions: string[];
    note: string | null;
    linkedData: {
        nearestVital: VitalHistoryPoint | null;
        nearestEEGTrend: EEGTrendPoint | null;
        nearestVitalDeltaMs: number | null;
        nearestEEGTrendDeltaMs: number | null;
        eegSamplesAroundEvent: EEGSamplePoint[];
    }
};

export type CreateSeizureLogInput ={
    timestampMs: number;
    durationSeconds: number | null;
    severity: SeizureSeverity;
    triggers?: string[];
    symptoms?: string[];
    emotions?: string[];
    note?: string;


}

//export type NotificationSeverity = "INFO" | "WARNING" | "ALARM";

type AppNotification = {
    id: string;
    timestampMs: number;
    severity: DeviceState;
    source: "EEG" | "AUDIO_AI" | "VITALS" | "SYSTEM";
    title: string;
    message: string;
    dismissed?: boolean;
};

type DeviceDataStore = {
    timestampMs: number;
    bpm: string;
    spo2: string;
    temp: string;
    deviceState: DeviceState;
    audioState: DeviceState;
    eegIrregular: string;
    micLevel: string;
    vitalHistory: VitalHistoryPoint[];
    seizureLogs: SeizureLogEntry[];

    eegSamples: number[];
    eegSampleHistory: EEGSamplePoint[];
    eegTrendHistory: EEGTrendPoint[];
    //notifications: AppNotification[];

    setVitals: (data: {
        timestampMs: number;
        bpm: string;
        spo2: string;
        temp: string;
        state: DeviceState;
        audioState: DeviceState;
        eegIrregular: string;
        micLevel: string;
    }) => void;

    healthKitWeeklyData: HealthKitDailyPoint[];
    setHealthKitWeeklyData: (data: HealthKitDailyPoint[]) => void;

    addEEGSamples: (samples:number[]) => void;
    addEEGTrendPoint: (point: EEGTrendPoint) => void;
    addTimestampedEEGSamples: (samples: number[]) => void;

    addSeizureLog: (input: CreateSeizureLogInput) => void;
    removeSeizureLog: (id: string) => void;

    clearSeizureLog: () => void;
    clearDeviceData: () => void;

};

const MAX_EEG_SAMPLES = 500;
const MAX_SEIZURE_LOG_ENTRIES = 1000;
//const MAX_NOTIFICATIONS = 30;

function normaliseState(value: string): DeviceState {
    if (value === "WARNING") return "WARNING";
    if (value === "ALARM") return "ALARM";
    return "NORMAL";
};

function findNearestByTimestamp< T extends {timestampMs: number } >(points: T[], timestampMs: number): {point:T | null; deltaMs: number | null}{
    if(points.length === 0) return {point: null, deltaMs: null};

    let nearest = points[0];
    let nearestDelta = Math.abs(points[0].timestampMs - timestampMs);

    for(const point of points){
        const delta = Math.abs(point.timestampMs - timestampMs);

        if (delta < nearestDelta){
            nearest = point;
            nearestDelta = delta;
        }
    };
    return {point: nearest, deltaMs: nearestDelta};
};

function normaliseTags(tags?: string[]){
    return [...new Set((tags ?? []).map((tag) => tag.trim()).filter(Boolean))];
};

export const useDeviceDataStore = create<DeviceDataStore>((set, get) => ({
    timestampMs: 0,
    bpm: "--",
    spo2: "--",
    temp: "--",
    deviceState: "NORMAL",
    audioState: "NORMAL",
    eegIrregular: "--",
    micLevel: "--",
    vitalHistory: [],
    seizureLogs: [],

    eegSamples: [],
    eegSampleHistory: [],
    eegTrendHistory: [],
    
    // notifications: [],

    healthKitWeeklyData: [],

    setVitals: (data) => {
        const bpmNumber = Number(data.bpm);
        const spo2Number = Number(data.spo2);
        const tempNumber = Number(data.temp);

        const historyPoint: VitalHistoryPoint ={
            timestampMs: data.timestampMs,
            bpm: isNaN(bpmNumber) ? null : bpmNumber,
            spo2: isNaN(spo2Number) ? null : spo2Number,
            temp: isNaN(tempNumber) ? null : tempNumber,
        };
        
        const previousState = get().deviceState;
        const previousAudioState = get().audioState;
        const nextState = normaliseState(data.state);
        const nextAudioState = normaliseState(data.audioState);

        set((state) => ({
            timestampMs: data.timestampMs,
            bpm: data.bpm,
            spo2: data.spo2,
            temp: data.temp,
            deviceState: normaliseState(data.state),
            audioState: normaliseState(data.audioState),
            eegIrregular: data.eegIrregular,
            micLevel: data.micLevel,
            vitalHistory: [...state.vitalHistory, historyPoint].slice(-1000),
        }));

        if (nextState !== previousState && nextState !== "NORMAL"){
            useNotificationStore.getState().addNotification({
                severity: nextState,
                source: "VITALS",
                title: `Device state: ${nextState}`,
                message: `Device skiftede til ${nextState}`,
            });
        }

        if(nextAudioState !== previousAudioState && nextAudioState !== "NORMAL"){
            useNotificationStore.getState().addNotification({
                severity: nextAudioState,
                source: "AUDIO_AI",
                title: `Audio state: ${nextAudioState}`,
                message: nextAudioState === "ALARM"
                    ? "Alarm-lyd blev aktiveret."
                    : "Warning-lyd blev aktiveret.",
            });
        }
    },

    



    //     if (nextState !== previousState && nextState !== "NORMAL"){
    //         get().addNotification({
    //             timestampMs: data.timestampMs,
    //             severity: nextState,
    //             source: "SYSTEM",
    //             title: `Device state: ${nextState}`,
    //             message: `Device skiftede til ${nextState}`,
    //         });
    //     }

    //     if (nextAudioState !== "NORMAL"){
    //         get().addNotification({
    //             timestampMs: data.timestampMs,
    //             severity: nextAudioState,
    //             source: "AUDIO_AI",
    //             title: `Audio state: ${nextAudioState}`,
    //             message: 
    //                 nextAudioState === "ALARM"
    //                 ? "Alarm-lyd blev aktiveret."
    //                 : "Warning-lyd blev aktiveret.",
                
    //         });
    //     }
    // },

    addEEGSamples: (samples) => {
        set((state) => ({
            eegSamples: [...state.eegSamples, ...samples].slice(-MAX_EEG_SAMPLES),
        }));
    },

    addEEGTrendPoint: (point) => {
        set((state) => ({
            eegTrendHistory: [...state.eegTrendHistory, point].slice(-100),
        }));
    },


    addTimestampedEEGSamples: (samples) => {
        const now = Date.now();

        const points = samples.map((value,index) => ({
            timestampMs: now + index,
            value,
        }));

        set((state) => ({
            eegSampleHistory: [...state.eegSampleHistory, ...points].slice(-5000),
        }));
    },

    setHealthKitWeeklyData: (data: HealthKitDailyPoint[]) => {
        set({healthKitWeeklyData:data});
    },

    addSeizureLog: (input) => {
        set((state) => {
            const nearestVital = findNearestByTimestamp<VitalHistoryPoint>(state.vitalHistory, input.timestampMs);
            const nearestEEGTrend = findNearestByTimestamp<EEGTrendPoint>(state.eegTrendHistory, input.timestampMs);
            const eegSamplesAroundEvent = state.eegSampleHistory.filter(
                (point) => Math.abs(point.timestampMs - input.timestampMs) <= 5 * 60 * 1000
            );

            const log: SeizureLogEntry = {
                id: `${input.timestampMs}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                timestampMs: input.timestampMs,
                createdAtMs: Date.now(),
                durationSeconds: input.durationSeconds,
                severity: input.severity,
                triggers: normaliseTags(input.triggers),
                symptoms: normaliseTags(input.symptoms),
                emotions: normaliseTags(input.emotions),
                note: input.note?.trim() ?? "",
                linkedData: {
                    nearestVital: nearestVital.point,
                    nearestEEGTrend: nearestEEGTrend.point,
                    nearestVitalDeltaMs: nearestVital.deltaMs,
                    nearestEEGTrendDeltaMs: nearestEEGTrend.deltaMs,
                    eegSamplesAroundEvent: eegSamplesAroundEvent,
                }
            };

            return {
                seizureLogs: [log, ...state.seizureLogs]
                    .sort((a, b) => b.timestampMs - a.timestampMs)
                    .slice(0, MAX_SEIZURE_LOG_ENTRIES),
            };
        });
    },

    removeSeizureLog: (id) => {
        set((state) => ({
            seizureLogs: state.seizureLogs.filter((log) => log.id !== id),
        }));
    },

    clearSeizureLog: () => {
        set({ seizureLogs: [] });
    },

    clearDeviceData: () => {
        set({
            timestampMs: 0,
            bpm: "--",
            spo2: "--",
            temp: "--",
            deviceState: "NORMAL",
            audioState: "NORMAL",
            eegIrregular: "--",
            micLevel: "--",
            vitalHistory: [],
            eegSamples: [],
            eegTrendHistory: [],
            eegSampleHistory: [],
            healthKitWeeklyData: [],
        });
    },

    // addNotification: (notification) => {
    //     const id = `${notification.timestampMs} -${Math.random()}`;
        
    //     console.log("Adding notification:", {id, notification});
    //     set((state) => ({
    //         notifications: [
    //             {id, ...notification },
    //             ...state.notifications,
    //         ].slice(0, MAX_NOTIFICATIONS),
    //     }));
    // },

    // clearNotifications: () => {
    //     set({ notifications: [] });
    // },
}));
