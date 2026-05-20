import { View, Text } from 'react-native'
import React, { useMemo } from 'react'
import { LineChart } from 'react-native-gifted-charts';
import COLORS from '../../constants/colors';

type Props = {
    samples: number[];
};

function smoothData(data:number[], windowSize: number = 8): number[] {
    const result: number[] = [];

    for(let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize);
        const subset = data.slice(start, i + 1);

        const average =
          subset.reduce((sum, value) => sum + value, 0) / subset.length;

        result.push(average);
    }

    return result;
}

export default function LiveEEGChart({ samples }: Props) {
    const chartData = useMemo(() => {
        const latest = samples.slice(-80);

        if (latest.length === 0) return [];

        const smoothed = smoothData(latest, 4);

        const min = Math.min(...smoothed);

        const normalised = smoothed.map(v => v - min);

        return normalised.map((value) => ({
            value,
        }));
    }, [samples]);

    if(chartData.length === 0) return null;

    const values = chartData.map(d => d.value);

    const max = Math.max(...values) + 10;

  return (
    <View style={{ height: 90, marginTop: 12, overflow: 'hidden'}}>
        <LineChart
            data={chartData}
            height={40}
            spacing={4}
            thickness={5}
            curved={true}
            hideDataPoints={true}
            hideRules={true}
            hideYAxisText={true}
            hideAxesAndRules={true}
            color={COLORS.primus}
            initialSpacing={0}
            endSpacing={0}
            disableScroll={true}

            maxValue={max + 10}
        />
       {/* <Text>samples: {samples.length}</Text> */}
    </View>
  );
}