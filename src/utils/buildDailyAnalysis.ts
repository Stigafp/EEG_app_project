import {
    EEGTrendPoint,
    SeizureLogEntry,
    VitalHistoryPoint,
} from "../stores/deviceDataStore";
import {HealthKitDailyPoint} from "../services/healthKitService";

export type DailyAnalysisMood =
    | "good"
    | "calm"
    | "strained"
    | "tired"
    | "alert";

export type DailyAnalysis = {
    mood: DailyAnalysisMood;
    score: number;
    title: string;
    message: string;
    factors: string[];
};

type BuildDailyAnalysisInput = {
    eegTrendHistory: EEGTrendPoint[];
    vitalHistory: VitalHistoryPoint[];
    seizureLogs: SeizureLogEntry[];
    healthKitWeeklyData: HealthKitDailyPoint[];
    nowMs?: number;
};

const DAY_MS = 24* 60 * 60 * 1000;

const negativeEmotionWeights: Record<string, number> = {
    Trist: 8,
    Irritabel: 7,
    Vrede: 9,
    Frustration: 7,
    Nervøs: 6,
    Skam: 5,
};

const severityWeights: Record<string, number> = {
    mild: 8,
    moderate: 16,
    severe: 26,
    critical: 36,
};

function average(values: number[]){
    if(values.length === 0) return null;
    return values.reduce((sum,value) => sum+value,0) /values.length;
}

function clamp(value: number, min = 0, max = 100){
    return Math.max(min, Math.min(max, value));
};

function getMoodFromScore(score:number, hasAlarm: boolean): DailyAnalysisMood{
    if (hasAlarm) return "alert";
    if (score >= 80) return "good";
    if (score >= 65) return "calm";
    if (score >= 45) return "tired";
    return "strained";
};

function getText(mood: DailyAnalysisMood, score: number): Pick<DailyAnalysis, "title" | "message">{
    switch (mood){
        case "good":
            return {
                title: "Dags Analyse",
                message: "Dine data ser stabile ud i dag. Der er ikke tydelige tegn på forhøjet belastning.",
              };
        
            case "calm":
              return {
                title: "Dags Analyse",
                message: "Dine signaler virker overordnet rolige. Fortsæt gerne med rolige pauser og stabil rytme.",
              };
        
            case "tired":
              return {
                title: "Dags Analyse",
                message: "Dine data tyder på let belastning eller lav energi i dag. Overvej en kort pause eller meditation.",
              };
        
            case "strained":
              return {
                title: "Dags Analyse",
                message: "Dine data tyder på forhøjet belastning i dag. Det kan være en god idé at tage det roligt.",
              };
        
            case "alert":
              return {
                title: "Dags Analyse",
                message: "Der er registreret signaler, som bør tages alvorligt. Følg din plan og søg hjælp ved behov.",
              };
    }
}

export function buildDailyAnalysis({
    eegTrendHistory,
    vitalHistory,
    healthKitWeeklyData,
    seizureLogs,
    nowMs = Date.now(),
}: BuildDailyAnalysisInput): DailyAnalysis{
    const startOfToday = new Date(nowMs);
    startOfToday.setHours(0,0,0,0);

    const todayStartMs = startOfToday.getTime();

    const todayEeg = eegTrendHistory.filter((point) => point.timestampMs >= todayStartMs);
    const todayVitals = vitalHistory.filter((point) => point.timestampMs >= todayStartMs);
    const todayLogs = seizureLogs.filter((log) => log.timestampMs >= todayStartMs);

    let score = 100;

    const factors: string[] = [];

    const avgEegScore = average(todayEeg.map((point) => point.score));
    const totalSpikes = todayEeg.reduce((sum, point) => sum + point.spikeCount, 0);

    if(avgEegScore !== null){
        if(avgEegScore > 35){
            score -= 22;
            factors.push("Forhøjet EEG-score");
        } else if(avgEegScore > 20){
            score -= 12;
            factors.push("Let forhøjet EEG-score");
        }
    }

    if(totalSpikes > 30){
        score -= 18;
        factors.push("Mange spikes i EEG-signalet");
    } else if(totalSpikes > 10){
        score -= 8;
        factors.push("Flere EEG-spikes end normalt");
    }

    for (const log of todayLogs){
        score -= severityWeights[log.severity] ?? 10;

        for(const emotion of log.emotions){
            score -= negativeEmotionWeights[emotion] ?? 2;
        }
    }

    if(todayLogs.length > 0){
        factors.push(`${todayLogs.length} anfaldslog i dag`);
    }

    const avgBpmToday = average(
        todayVitals
          .map((point) => point.bpm)
          .filter((value): value is number => value !==null)
    );

    const avgSpo2Today = average(
        todayVitals
          .map((point) => point.spo2)
          .filter((value): value is number => value !==null)
    )

    const avgTempToday = average(
        todayVitals
          .map((point) => point.temp)
          .filter((value): value is number => value !==null)
    );

    if(avgBpmToday !== null && avgBpmToday > 95){
        score -=10;
        factors.push("Høj puls");
    }

    if (avgSpo2Today !== null && avgSpo2Today < 94){
        score -= 15;
        factors.push("Lav iltmætning (SpO2)");
    }

    if (avgTempToday !== null && avgTempToday > 37.8){
        score -= 12;
        factors.push("Højere temperatur");
    }

    const todayHealth = healthKitWeeklyData.find((point) => {
        const date = new Date(point.timestampMs);
        return date.toDateString() === new Date(nowMs).toDateString();
    });

    const weeklyStepAverage = average(healthKitWeeklyData.map((point) => point.steps));

    if(
        todayHealth &&
        weeklyStepAverage !== null &&
        weeklyStepAverage > 0 &&
        todayHealth.steps < weeklyStepAverage * 0.45
    ){
        score -= 8;
        factors.push("Lav aktivitet i dag");
    }

    const hasSevereLog = todayLogs.some(
        (log) => log.severity === "severe" || log.severity === "critical"
    );

    const finalScore = Math.round(clamp(score));
    const mood = getMoodFromScore(finalScore, hasSevereLog);
    const text = getText(mood, finalScore);

    return {
        mood,
        score: finalScore,
        title: text.title,
        message: text.message,
        factors: factors.slice(0,3),
    };
}