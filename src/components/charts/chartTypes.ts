export type ChartType = "none" | "line" | "bar" | "liveEeg";

export type ChartPoint = {
    value: number;
    label?: string;
};