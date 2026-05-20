import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, {useState, useMemo} from 'react'
import COLORS from '../../constants/colors';
import {LineChart, BarChart} from 'react-native-gifted-charts';
import {EEGSamplePoint} from '../../stores/deviceDataStore';
import {TimeRange} from '../../utils/buildTimeRangeData';
import InteractiveRangeChart from './InteractiveRangeChart';

type Props = {
    data:EEGSamplePoint[];
    range?: TimeRange;
};

export default function EEGDayChart({data, range = "day" }: Props){
    return(
        <InteractiveRangeChart
            title="EEG overblik"
            unit="µV"
            data={data.map((point) => ({timestampMs: point.timestampMs, value: point.value}))}
            mode="average"
            range={range}
        />
    )
}


// ===============================
// GAMMELT KODE
// ==============================


// type props ={
//     data:EEGSamplePoint[];
// };

// type TimeBucket ={
//     label: string;
//     startHour: number;
//     endHour: number;
//     score: number;
//     samples: number;
// };

// function buildTwoHourGroupBuckets(data: EEGSamplePoint[]): TimeBucket[]{
//     const buckets: TimeBucket[]=[];

//     for (let hour = 0; hour < 24; hour+=6){
//         const startHour = hour;
//         const endHour = hour + 6;

//         const bucketData = data.filter((point) => {
//             const date = new Date(point. timestampMs);
//             const pointHour = date.getHours();

//             return pointHour >= startHour && pointHour < endHour;
//         });

//         const values = bucketData.map((p) => p.value);

//         let score = 0;

//         if(values.length > 0){
//             const min = Math.min(...values);
//             const normalised = values.map((v) => v - min);
//             const average = normalised.reduce((sum, v) => sum + v, 0) / normalised.length;
//             score = Math.min(100, Math.round(average));
//         }

//         buckets.push({
//             label: `${String(startHour).padStart(6, "0")}:00-${String(endHour).padStart(6, "0")}:00`,
//             startHour,
//             endHour,
//             score,
//             samples: values.length,
//         });
//     }

//     return buckets;
// }

// // function formatTime(timestampMs: number){
// //     const date = new Date(timestampMs);
// //     return `$(date.getHours().toString().padStart(2, "0")}:${date
// //         .getMinutes()
// //         .toString()
// //         .padStart(2, "0")}`;
// // }

// export default function EEGDayChart({data}: props) {
//     const [selectedBucket, setSelectedBucket] = useState<TimeBucket | null>(null);

//     const buckets = useMemo(() => buildTwoHourGroupBuckets(data), [data]);

//     const barData = buckets.map((bucket) => ({
//         value: bucket.score,
//         label: bucket.label.slice(0, 5),
//     }));

//     const selectedSamples = useMemo(() => {
//         if(!selectedBucket) return[];

//         return data.filter((point) => {
//             const hour = new Date(point.timestampMs).getHours();

//             return(
//                 hour >= selectedBucket.startHour &&
//                 hour < selectedBucket.endHour
//             );
//         });
//     }, [data, selectedBucket]);

//     const lineData = useMemo(() => {
//         const latest = selectedSamples.slice(-300);

//         if(latest.length === 0) return [];

//         const min = Math.min(...latest.map((p) => p.value));

//         return latest.map((point) => ({
//             value: point.value - min,
//         }));
//     }, [selectedSamples]);

//     const maxLineData = lineData.length > 0 ? Math.max(...lineData.map((p) => p.value)) + 10 : 100;

//   return (
//     <View style={styles.container}>
//         <Text style={styles.title}>EEG Dagsoverblik</Text>

//         <Text style={styles.explanationText}>
//             Data'en er opdelt i 2-timers intervaller. Tryk på et tidsrum for at zoome ind.
//         </Text>

//         <BarChart
//             data={barData}
//             height={150}
//             maxValue={100}
//             barWidth={14}
//             spacing={10}
//             roundedTop={true}
//             hideRules={true}
//             hideYAxisText={true}
//             yAxisThickness={0}
//             xAxisThickness={0}
//             frontColor={COLORS.primus}
//             initialSpacing={4}
//             endSpacing={4}
//         />

//         <View style={styles.bucketGrid}>
//             {buckets.map((bucket) => {
//                 const isSelected = selectedBucket?.label === bucket.label;

//                 return (
//                     <TouchableOpacity
//                         key={bucket.label}
//                         style={[
//                             styles.bucketButton,
//                             isSelected && styles.bucketButtonActive,
//                         ]}
//                         onPress={() => setSelectedBucket(bucket)}
//                         >
//                             <Text 
//                                 style={[styles.bucketText,
//                                 isSelected && styles.bucketTextActive,
//                                 ]}
//                             >{bucket.label}
//                             </Text>

//                             <Text 
//                                 style={[styles.bucketSamples, 
//                                 isSelected && styles.bucketTextActive]}>
//                                 {bucket.samples} samples
//                             </Text>
//                         </TouchableOpacity>
//                 );
//             })}
//         </View>

//         {selectedBucket && (
//             <View style={styles.zoomBox}>
//                 <Text style={styles.zoomTitle}>
//                     Zoom: {selectedBucket.label}
//                 </Text>

//                 {lineData.length > 0 ? (
//                     <LineChart
//                     data={lineData}
//                     height={180}
//                     maxValue={maxLineData}
//                     spacing={3}
//                     thickness={2}
//                     curved={true}
//                     hideDataPoints={true}
//                     hideRules={true}
//                     hideYAxisText={true}
//                     yAxisThickness={0}
//                     xAxisThickness={0}
//                     color={COLORS.primus}
//                     initialSpacing={0}
//                     endSpacing={0}
//                 />
//                 ): (
//                     <Text style={styles.noDataText}>
//                         Ingen data tilgængelig
//                     </Text>
//                 )}
//             </View>
//         )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//     container: {
//         marginBottom: 18,
//     },
//     title: {
//         fontSize: 18,
//         fontWeight: "800",
//         marginBottom: 6,
//         color: COLORS.primus,
//     },
//     explanationText: {
//         fontSize: 14,
//         lineHeight: 18,
//         marginBottom: 14,
//         color: COLORS.primus,
//         opacity: 0.75,
//     },
//     bucketGrid: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         gap: 8,
//         marginTop: 14,
//     },
//     bucketButton: {
//         backgroundColor: COLORS.tertius,
//         paddingVertical: 8,
//         paddingHorizontal: 12,
//         borderRadius: 12,
//         minWidth: "30%",
//     },
//     bucketButtonActive: {
//         backgroundColor: COLORS.primus,
//     },
//     bucketText: {
//         fontSize: 12,
//         fontWeight: "700",
//         color: COLORS.primus,
//     },
//     bucketTextActive: {
//         color: COLORS.white,
//     },
//     bucketSamples: {
//         fontSize: 10,
//         fontWeight: "400",
//         color: COLORS.primus,
//         opacity: 0.75,
//         marginTop: 2,
//     },
//     zoomBox: {
//         marginTop: 22,
//     },
//     zoomTitle: {
//         fontSize: 17,
//         fontWeight: "800",
//         marginBottom: 12,
//         color: COLORS.primus,
//     },
//     noDataText: {
//         fontSize: 14,
//         lineHeight: 18,
//         color: COLORS.primus,
//         marginTop: 12,
//     }
// });