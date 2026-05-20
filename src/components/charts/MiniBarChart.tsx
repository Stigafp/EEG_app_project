import { View, Text } from 'react-native'
import React from 'react'
import { BarChart } from 'react-native-gifted-charts';
import COLORS from '../../constants/colors';
import { ChartPoint } from './chartTypes';

type Props = {
    data: ChartPoint[];
};

export default function MiniBarChart({ data }: Props) {
    if(!data || data.length === 0) return null;

  return (
    <View style={{height: 100, marginTop: 10, overflow: 'hidden'}}>
        <BarChart
            data={data}
            height={70}
            barWidth={22}
            spacing={16}
            roundedTop={true}
            hideYAxisText={true}
            hideRules={true}
            xAxisThickness ={0}
            yAxisThickness= {0}
            frontColor={COLORS.primus}
            initialSpacing={6}
            endSpacing={6}
            disableScroll={true}
        />
    </View>
  )
}