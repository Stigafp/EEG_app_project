// se https://www.youtube.com/watch?v=AkujZtOz9c4 for opsætning af charts

import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native'
import React, { useState, useMemo } from 'react'
import { TimeRange, SourcePoint, moveRangeDate, getRangeTitle, buildTimeRangeData } from '../../utils/buildTimeRangeData'
import COLORS from '../../constants/colors';
import { BarChart, LineChart } from 'react-native-gifted-charts';

type ChartVariant = 'line' | 'bar' ;

type Props = {
    title: string;
    unit: string;
    data: SourcePoint[];
    range: TimeRange;
    mode?: "average" | "sum" | "countAboveThreshold" | "min" | "max" ;
    threshold?: number;
    chartVariant?: ChartVariant;
};

export default function InteractiveRangeChart({
    title, unit, data, range, mode = "average", threshold, chartVariant}: Props) {

        const [selectedDate, setSelectedDate] = useState(new Date());
        const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
        const variant = chartVariant ?? "line";

        const points = useMemo(
            () => buildTimeRangeData(data, { range, date: selectedDate, mode, threshold}),
            [data, range, selectedDate, mode, threshold]
        );

        const activePoint = selectedIndex !== null ? points[selectedIndex] : null;
        const valuesWithData = points.filter((point) => point.samples > 0).map((point) => point.rawValue);
        const average = valuesWithData.length ? valuesWithData.reduce((sum, value) => sum + value, 0) / valuesWithData.length : 0;
        const peak = valuesWithData.length ? Math.max(...valuesWithData) : 0;
        const totalSamples = points.reduce((sum, point) => sum + point.samples, 0);
        const maxValue = Math.max(1, ...points.map((point) => point.value)) +5;

        const chartData = points.map((point, index) => ({
            value: point.value,
            label: point.label,
            frontColor: selectedIndex === index ? COLORS.primus : COLORS.secundus,
            topLabelComponent: () => 
                selectedIndex === index ? (
                    <Text style={styles.topLabel}>{Math.round(point.rawValue)}</Text>
                ) : null,
        }));

  return (
    <View style={styles.container}>
        <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.range}>{range}</Text>
        </View>

        <View style={styles.statsRow}>
            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Gns.</Text>
                <Text style={styles.statValue}>{average ? average.toFixed(1) : "--"}</Text>
            </View>
       

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Topværdi</Text>
                <Text style={styles.statValue}>{peak ? peak.toFixed(1) : "--"}</Text>
            </View>

            <View style={styles.statCard}>
                <Text style={styles.statLabel}>Antal samples</Text>
                <Text style={styles.statValue}>{totalSamples}</Text>
            </View>
        </View>

        <View style={styles.navRow}>
            <Pressable 
                style={styles.navButton}
                onPress={() => {setSelectedDate(moveRangeDate(selectedDate, range, -1)); 
                    setSelectedIndex(null);
                }}>
                    <Text style={styles.navButtonSymbol}>◀</Text>
                    {/* //<Icon name="chevron-left" size={24} color={COLORS.primus} /> */}
            </Pressable>
            
            <Text style={styles.periodeText}>{getRangeTitle(range, selectedDate)}</Text>
            <Pressable 
                style={styles.navButton}
                onPress={() => {setSelectedDate(moveRangeDate(selectedDate, range, 1)); 
                    setSelectedIndex(null);
                }}>
                    <Text style={styles.navButtonSymbol}>▶</Text>
            </Pressable>
        </View>

        {totalSamples === 0 ? (
            <Text style={styles.noDataText}>Ingen data tilgængelig</Text>
        ) : (
            <>
                    <ScrollView 
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chartScroll}
                    >
                    {variant === "bar" ? (
                        <BarChart
                            data={chartData}
                            height={190}
                            maxValue={maxValue}
                            noOfSections={4}
                            barWidth={range === "month" ? 10: 16}
                            spacing={range === "month" ? 8: 14}
                            barBorderRadius={5}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            xAxisLabelTextStyle={styles.axisText}
                            yAxisTextStyle={styles.axisText}
                            hideRules={false}
                            rulesColor="rgba(78,120,129,0.14)"
                            isAnimated={true}
                            animationDuration={500}
                            barBorderColor={COLORS.primus}
                            onPress={( _: unknown, index: number) => setSelectedIndex(selectedIndex === index ? null : index)}
                        />
                        ) : (
                            <LineChart
                                data={chartData}
                                height={190}
                                maxValue={maxValue}
                                noOfSections={4}
                                curved={true}
                                areaChart={true}
                                hideDataPoints={false}
                                thickness={2}
                                yAxisThickness={0}
                                xAxisThickness={0}
                                xAxisLabelTextStyle={styles.axisText}
                                yAxisTextStyle={styles.axisText}
                                hideRules={false}
                                rulesColor="rgba(78,120,129,0.14)"
                                isAnimated={true}
                                animationDuration={500}
                                onPress={( _: unknown, index: number) => setSelectedIndex(selectedIndex === index ? null : index)}
                            />
                        )}
                    </ScrollView>

                    <View style={styles.detailBox}>
                        <Text style={styles.detailLabel}>{activePoint? activePoint.label : "Tryk på et punkt for detaljer"}</Text>
                        <Text style={styles.detailValueText}>{activePoint
                            ? `${activePoint.rawValue.toFixed(1)} ${unit} · ${activePoint.samples} samples`
                            : "Vælg et punkt for at se værdi og antal samples."}
                        </Text>
                    </View>

                    </>
                )}
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    topLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: COLORS.primus,
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.primus,
    },
    range: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.primus,
        overflow: "hidden",
        paddingHorizontal: 4,
        paddingVertical: 5,
        borderRadius: 999,
        backgroundColor: COLORS.tertius,
    },
    statsRow: {
        flexDirection: "row",
        marginBottom: 8,
        gap: 8,
    },
    statCard: {
        flex: 1,
        padding: 12,
        borderRadius: 18,
        backgroundColor: COLORS.quartus,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primus,
        opacity: 0.7,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "900",
        color: COLORS.primus,
        marginTop: 4,
    },
    navRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.tertius,
        justifyContent: "center",
        alignItems: "center",
    },
    navButtonSymbol: {
        fontSize: 28,
        fontWeight: "700",
        color: COLORS.primus,
        lineHeight: 30,
    },
    periodeText: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.primus,
        textTransform: "uppercase",
    },
    chartScroll: {
        paddingTop: 14,
        paddingRight: 24,
    },
    axisText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primus,
        opacity: 0.55,
    },
    noDataText: {
        fontSize: 16,
        color: COLORS.primus,
        textAlign: "center",
        marginVertical: 24,
        opacity: 0.7,
    },
    detailBox: {
        padding: 14,
        marginTop: 14,
        borderRadius: 18,
        backgroundColor: COLORS.quartus,
    },
    detailLabel: {
        fontSize: 14,
        fontWeight: "900",
        color: COLORS.primus,
    },
    detailValueText: {
        fontSize: 16,
        color: COLORS.primus,
        marginTop: 4,
    },
});