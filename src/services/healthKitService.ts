import { 
    requestAuthorization, 
    queryStatisticsForQuantity,
    queryStatisticsCollectionForQuantity,
    getMostRecentQuantitySample,
} from '@kingstinct/react-native-healthkit';

export type HealthKitTodaySummary = {
    steps: number;
    activeEnergyKcal: number;
    distanceMeters: number;
};

export type HealthKitBodySummary = {
    bodyMassIndex: number | null;
    bodyFatPercentage: number | null;
    bodyMassKg: number | null;
};

export type HealthKitDailyPoint ={
    timestampMs: number;
    steps: number;
    activeEnergyKcal: number;
    distanceMeters: number;
};

function getTodayDates(){
    const startDate = new Date();
    startDate.setHours(0,0,0,0);

    const endDate = new Date();

    return{
        startDate,
        endDate,
    };
}

function getLast7DaysDates(){
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0,0,0,0);

    const endDate = new Date();
    endDate.setHours(23,59,59,999);

    return{
        startDate,
        endDate,
    };
}

export async function initHealthKit(): Promise<boolean> {
    try {
        await requestAuthorization({
            toRead: [
                'HKQuantityTypeIdentifierStepCount',
                'HKQuantityTypeIdentifierActiveEnergyBurned',
                'HKQuantityTypeIdentifierDistanceWalkingRunning',
                'HKQuantityTypeIdentifierBodyMass',
                'HKQuantityTypeIdentifierBodyMassIndex',
                'HKQuantityTypeIdentifierBodyFatPercentage',
            ],
        });
        return true;

    } catch (error) {
        console.error("Healthkit init error:", error);
        return false;
    }
}

async function getTodayQuantitySum(
    identifier:
    | 'HKQuantityTypeIdentifierStepCount'
    | 'HKQuantityTypeIdentifierActiveEnergyBurned'
    | 'HKQuantityTypeIdentifierDistanceWalkingRunning',
    unit: "count" | "kcal" | "m",
): Promise<number>{
    const{startDate, endDate} = getTodayDates();

    try{
        const result = await queryStatisticsForQuantity(
            identifier,
            ["cumulativeSum"],
            {
                filter: {
                    date:{
                    startDate,
                    endDate,
                    },
                },
                unit,
            }
        );

        return result?.sumQuantity?.quantity ?? 0;
    } catch (error) {
        console.error("Error getting today quantity sum:", error);
        return 0;
    }
}

export async function getTodayHealthSummary(): Promise<HealthKitTodaySummary> {
    const steps = await getTodayQuantitySum(
        "HKQuantityTypeIdentifierStepCount",
        "count"
    );
    const activeEnergyKcal = await getTodayQuantitySum(
        "HKQuantityTypeIdentifierActiveEnergyBurned",
        "kcal"
    );
    const distanceMeters = await getTodayQuantitySum(
        "HKQuantityTypeIdentifierDistanceWalkingRunning",
        "m"
    );
    return {
        steps,
        activeEnergyKcal,
        distanceMeters,
    };
}

async function getLatestQuantity(
    identifier:
    | "HKQuantityTypeIdentifierBodyMass"
    | "HKQuantityTypeIdentifierBodyMassIndex"
    | "HKQuantityTypeIdentifierBodyFatPercentage",
    unit: "kg" | "count" | "%",
): Promise<number | null>{
    try{
        const sample = await getMostRecentQuantitySample(identifier, unit);

        return sample?.quantity ?? null;
    } catch (error) {
        console.error("Error getting latest quantity:", identifier, error);
        return null;
    }
}

export async function getLatestBodySummary(): Promise<HealthKitBodySummary> {
    const bodyMassKg = await getLatestQuantity(
        "HKQuantityTypeIdentifierBodyMass",
        "kg"
    );
    const bodyMassIndex = await getLatestQuantity(
        "HKQuantityTypeIdentifierBodyMassIndex",
        "count"
    );
    const bodyFatPercentage = await getLatestQuantity(
        "HKQuantityTypeIdentifierBodyFatPercentage",
        "%"
    );
    return {
        bodyMassKg,
        bodyMassIndex,
        bodyFatPercentage,
    };
}


async function getDailyQuantityCollection(
    identifier:
      | "HKQuantityTypeIdentifierStepCount"
      | "HKQuantityTypeIdentifierActiveEnergyBurned"
      | "HKQuantityTypeIdentifierDistanceWalkingRunning",
    unit: "count" | "kcal" | "m"
  ): Promise<{ timestampMs: number; value: number }[]> {
    const { startDate, endDate } = getLast7DaysDates();
  
    const collection = await queryStatisticsCollectionForQuantity(
      identifier,
      ["cumulativeSum"],
      startDate,
      {
        day:1,
    },
      {
        filter: {
          date: {
            startDate,
            endDate,
          },
        },
        unit,
        }
    );

  
    return collection.map((item) => ({
      timestampMs: item.startDate ? new Date(item.startDate).getTime() : Date.now(),
      value: item.sumQuantity?.quantity ?? 0,
    }));
  }

export async function getWeeklyHealthSummary(): Promise<HealthKitDailyPoint[]>{
    try{
        const[steps,calories, distance] = await Promise.all([
            getDailyQuantityCollection("HKQuantityTypeIdentifierStepCount", "count"),
            getDailyQuantityCollection("HKQuantityTypeIdentifierActiveEnergyBurned", "kcal"),
            getDailyQuantityCollection("HKQuantityTypeIdentifierDistanceWalkingRunning", "m"),
        ]);

        return steps.map((stepPoint, index) => ({
            timestampMs: stepPoint.timestampMs,
            steps: stepPoint.value,
            activeEnergyKcal: calories[index]?.value ?? 0,
            distanceMeters: distance[index]?.value ?? 0,
        }));
    } catch (error) {
        console.error("Error getting weekly health summary:", error);
        return [];
    }
}

