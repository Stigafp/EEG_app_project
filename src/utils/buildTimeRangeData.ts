export type TimeRange = "hour" | "day" | "week" | "month" | "year";
export type AggregateMode = "average" | "sum" | "countAboveThreshold"| "min" | "max";

export type SourcePoint = {
    timestampMs: number;
    value: number | null;
};

export type TimeRangeChartPoint = {
    timestampMs: number;
    value: number;
    label: string;
    samples: number;
    rawValue: number;
};

type Options = {
    range: TimeRange;
    date?: Date;
    mode?: AggregateMode;
    threshold?: number;
};

const DA_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
const DA_DAYS = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

function startOfWeek(date:Date){
    const d = startOfDay(date);
    const day = (d.getDay() + 6) % 7;

    d.setDate(d.getDate() - day);
    return d;
};

function daysInMonth(year: number, month: number){
    return new Date(year, month + 1, 0).getDate();
};

function createBuckets(range: TimeRange, selectedDate: Date){
    if(range === "hour"){
        const hourStart = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            selectedDate.getHours(),
            0,
            0,
            0
        );

        return Array.from({length: 12}, (_, index) => {
            const start = new Date(hourStart);
            start.setMinutes(index * 5);

            const end = new Date(hourStart);
            end.setMinutes((index + 1) * 5);

            return {
                start,
                end,
                label: `${String(start.getMinutes()).padStart(2, "0")}m`
            };
        });
    }

    if (range === "day"){
        const dayStart = startOfDay(selectedDate);

        return Array.from({length: 24}, (_, index) =>{
            const start = new Date(dayStart);
            start.setHours(index);

            const end = new Date(dayStart);
            end.setHours(index + 1);

            return {
                start,
                end,
                label: `${String(index).padStart(2, "0")}`
            };
        });
    }

    if (range === "week"){
        const weekStart = startOfWeek(selectedDate);

        return Array.from({length: 7}, (_, index) => {
            const start = new Date(weekStart);
            start.setDate(weekStart.getDate() + index);

            const end = new Date(start);
            end.setDate(start.getDate() + 1);

            return {
                start,
                end,
                label: DA_DAYS[index]
            };
        });
    }

    if (range === "month"){
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();

        return Array.from({length: daysInMonth(year, month)}, (_, index) => {
            const start = new Date(year, month, index + 1);
            const end = new Date(year, month, index +2);

            return {
                start,
                end,
                label: String(index + 1)
            };
        });
    }

    const year = selectedDate.getFullYear();

    return Array.from({length: 12}, (_, index) => {
        const start = new Date(year, index, 1);
        const end = new Date(year, index + 1, 1);

        return {
            start,
            end,
            label: DA_MONTHS[index]
        };
    });
}

function aggregate(values: number[], mode: AggregateMode, threshold = 0){
    if (values.length === 0) return 0;
    if(mode === "sum") return values.reduce((sum,value) => sum + value, 0);
    if (mode === "countAboveThreshold") return values.filter((value) => value > threshold).length;
    if (mode=== "max") return Math.max(...values);
    if (mode=== "min") return Math.min(...values);

    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildTimeRangeData(points: SourcePoint[], options: Options): TimeRangeChartPoint[] {
    const selectedDate = options.date ?? new Date();
    const mode = options.mode ?? "average";
    const buckets = createBuckets(options.range, selectedDate);

    const result = buckets.map((bucket) => {
        const values = points
            .filter((point) => point.value !== null && point.timestampMs >= bucket.start.getTime() && point.timestampMs < bucket.end.getTime())
            .map((point) => point.value as number);

        const rawValue = aggregate(values, mode, options.threshold);

        return {
            value: rawValue,
            rawValue,
            label: bucket.label,
            timestampMs: bucket.start.getTime(),
            samples: values.length,
        };
    });

    const values = result.map((point) => point.rawValue).filter((value) => value > 0);
    const min = values.length > 0 && mode === "average" ? Math.min(...values) : 0;

    return result.map((point) => ({
        ...point,
        value: Math.max(0, point.rawValue - min),
    }));
}


// evt kig på denne igen senere
export function getRangeTitle(range: TimeRange, date = new Date()) {
    if (range === "hour"){
            return `${String(date.getHours()).padStart(2, "0")}:00-${String(date.getHours() + 1).padStart(2, "0")}:00`;
    }
    if (range === "day"){
            return date.toLocaleDateString("da-DK", { day: "numeric", month: "long"});
    }
    if (range === "week"){
            const start = startOfWeek(date);
            const end = new Date(start);

            end.setDate(start.getDate() + 6);
            return `${start.toLocaleDateString("da-DK", { day: "numeric", month: "short"})} - ${end.toLocaleDateString("da-DK", { day: "numeric", month: "short"})}`;
    }    
    if (range === "month"){
            return date.toLocaleDateString("da-DK", { month: "long", year: "numeric"});
    }
    if (range === "year"){
            return String(date.getFullYear());
    };
}

// evt. kig på denne igen serner
export function moveRangeDate(date: Date, range: TimeRange, direction: -1 | 1){
    const next = new Date(date);
    if (range === "hour"){
            next.setHours(next.getHours() + direction);
    }
    if (range === "day"){
            next.setDate(next.getDate() + direction);
    }
    if (range === "week"){
            next.setDate(next.getDate() + direction * 7);
    }
    if (range === "month"){
            next.setMonth(next.getMonth() + direction);
    }
    if (range === "year"){
            next.setFullYear(next.getFullYear() + direction);
    }
    return next;

};


export function buildEventCountSourcePoints<T extends {timestampMs: number} > (events: T[]): SourcePoint[]{
    return events.map((event) => ({
        timestampMs: event.timestampMs,
        value: 1,
    }));
};