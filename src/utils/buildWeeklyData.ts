import {ChartPoint} from '../components/charts/chartTypes';

type WeeklySourcePoint = {
    timestampMs: number;
    value: number;
};

type Options = {
    threshold?: number;
    mode?: "sum" | "countAboveThreshold" | "average";
}

export default function buildWeeklyData(
    points: WeeklySourcePoint[],
    options: Options = {}
): ChartPoint[]{
    const days = ["M", "T", "O", "T", "F", "L", "S"];
    const buckets = new Array(7).fill(0);
    const counts = new Array(7).fill(0);

    const mode = options.mode ?? "sum";
    

    points.forEach((point) => {
        const date = new Date(point.timestampMs);

        const dayIndex = (date.getDay() + 6) % 7;

        if(mode === "countAboveThreshold") {
            if(point.value > (options.threshold ?? 0)){
                buckets[dayIndex] +=1;
            }
        }

        if(mode === "sum") {
            buckets[dayIndex] += point.value;
        }

        if(mode === "average") {
            buckets[dayIndex] += point.value;
            counts[dayIndex] +=1;
        }
    });

    if(mode === "average") {
        return buckets.map((value, index) => ({
            value: counts[index] > 0 ? value / counts[index] : 0,
            label: days[index],
        }));
    }

    return buckets.map((value, index) => ({
        value: value,
        label: days[index],
    }));
}