import { View, Text } from 'react-native'
import React from 'react'
import {LineChart} from 'react-native-gifted-charts';
import COLORS from '../../constants/colors';
import { ChartPoint } from './chartTypes';

type Props = {
    data: ChartPoint[];
};

export default function MiniLineChart({ data }: Props) {

    if(!data || data.length === 0) return null;

  return (
    <View style={{height: 80, marginTop: 10}}>
        <LineChart
            data={data}
            height={70}
            thickness={2}
            hideDataPoints={true}
            hideRules={true}
            hideYAxisText={true}
            hideAxesAndRules={true}
            curved={true}
            color={COLORS.primus}
            startFillColor={COLORS.primus}
            endFillColor={COLORS.primus}
            areaChart={true}
            startOpacity={0.18}
            endOpacity={0.01}
            initialSpacing={0}
            endSpacing={0}
            spacing={12}
            yAxisOffset={0}
            maxValue={120}
        />
    </View>
  )
}