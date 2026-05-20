import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { LineChart } from 'react-native-gifted-charts'
import COLORS from '../../constants/colors'
import { VitalHistoryPoint } from '../../stores/deviceDataStore'
import { TimeRange } from '../../utils/buildTimeRangeData'
import InteractiveRangeChart from './InteractiveRangeChart'

type VitalKey = "bpm" | "spo2" | "temp";

type Props ={
    data: VitalHistoryPoint[];
    vitalKey: VitalKey;
    title: string;
    unit: string;
    range?: TimeRange;
};

export default function VitalDetailChart( {
    data,
    vitalKey,
    title,
    unit,
    range = "day",
  } : Props) {


    const sourceData = data.map((point) => ({
        timestampMs: point.timestampMs,
        value: point[vitalKey],
    }));

    if(sourceData.length === 0){
        return <Text style={styles.noDataText}>Indsamler {title} data...</Text>;
    }

    return(
        <InteractiveRangeChart
            title={title}
            unit={unit}
            data={sourceData}
            range={range}
            mode="average"
        />
    );
  
}


const styles = StyleSheet.create({
    container: {
        marginBottom: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 12,
        color: COLORS.primus,
    },
    noDataText: {
        fontSize: 14,
        color: COLORS.primus,
        opacity: 0.75,
    },
    range: {
        fontSize: 12,
        fontWeight: "400",
        marginTop: 8,
        color: COLORS.primus,
        opacity: 0.75,
    },
    
});

// ===============================
// GAMMELT KODE
// ==============================

    // const points = data
    //    .filter((point) => point[vitalKey] !== null)
    //    .slice(-50);

    //    if(points.length === 0){
    //     return <Text style={styles.noDataText}>Indsamler {title} data...</Text>;
    //    }

    //    const values = points.map((point) => point[vitalKey] as number);

    //    const min = Math.min(...values);
    //    const max = Math.max(...values);

    //    const chartData = values.map((value) => ({
    //     value: value - min,
    //    }));

    // return (
    //     <View style={styles.container}>
    //       <Text style={styles.title}>{title} historik</Text>
    
    //       <LineChart
    //         data={chartData}
    //         height={170}
    //         maxValue={max - min + 5}
    //         spacing={8}
    //         thickness={3}
    //         curved={true}
    //         hideDataPoints={true}
    //         hideRules={true}
    //         hideYAxisText={true}
    //         hideAxesAndRules={true}
    //         color={COLORS.primus}
    //         initialSpacing={0}
    //         endSpacing={0}
    //         />
    
    //         <Text style={styles.range}>
    //             Min {min.toFixed(1)} {unit} - Max {max.toFixed(1)} {unit}
    //         </Text>
    //     </View>
    //   );