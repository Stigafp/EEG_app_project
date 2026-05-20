import { View, Text } from 'react-native'
import React from 'react'
import { ChartType, ChartPoint } from './chartTypes';
import MiniLineChart from './MiniLineChart';
import MiniBarChart from './MiniBarChart';
import LiveEEGChart from './LiveEEGChart';

type Props = {
    type: ChartType;
    data?: ChartPoint[];
    samples?: number[];
};

export default function ChartComponentIndex({ type, data = [], samples = []}: Props) {

    if (type === "none") return null;

    if (type === "line") return <MiniLineChart data={data} />;

    if (type === "bar") return <MiniBarChart data={data} />;

    if (type === "liveEeg") return <LiveEEGChart samples={samples} />;

  return null;
}