import { View, Text, Animated, StyleSheet, Platform, KeyboardAvoidingView, TextInput, TouchableOpacity } from 'react-native'
import React, {useState, useMemo} from 'react'
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context'
import COLORS from '../constants/colors'
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import { useDeviceDataStore, SeizureSeverity, SeizureLogEntry } from '../stores/deviceDataStore';
import InteractiveRangeChart from '../components/charts/InteractiveRangeChart';
import { buildEventCountSourcePoints } from '../utils/buildTimeRangeData';

import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type Props = {
  onScroll: any;
};

type QuickTagGroup = 'triggers' | 'symptoms' | 'emotions' ;

const SEVERITIES: { key: SeizureSeverity; label: string} [] = [
  { key: 'mild', label: 'Let' },
  { key: 'moderate', label: 'Moderat' },
  { key: 'severe', label: 'Alvorligt' },
  { key: 'critical', label: 'Kritisk' },
];

//tilføj fatigue enten i triggers, symptoms eller emotion
const TRIGGER_TAGS = ['Søvn', 'Stress', 'Medicin', 'Lys', 'Alkohol', 'Feber']
const SYMPTOM_TAGS = ['Aura', 'Kramper', 'Muskelryk', 'Fravær', 'Forvirring', 'Hovedpine', 'Træthed', 'Dårligt humør', 'Taleproblemer', 'Bevidsthedstab', 'Synsforstyrrelser', 'Andet']

// tilføj disse tags
const EMOTION_TAGS = ['Trist', 'Irritabel', 'Vrede', 'Frustration', 'Skam', 'Overbåren', 'Nervøs', 'Andet']
const AFTEREFFECT_TAGS =['Træthed', 'Hovedpine', 'BalanceProblemer', 'Andet']

function formatDateTime(timestampMs: number){
  return new Date(timestampMs).toLocaleDateString('da-DK', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDelta(deltaMs: number | null){
  if(deltaMs === null) return 'ingen data';

  const minutes = Math.round(deltaMs / 60000);

  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${minutes} min`;

  return `${(minutes / 60).toFixed(1)} t`;
}

function parseCsvTags(value: string){
  return value
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean);
};

function toggleTag(current:string[], tag:string){
  return current.includes(tag)
  ? current.filter((item) => item !== tag)
  : [...current, tag];
};

function getSeverityLabel(severity: SeizureSeverity){
  return SEVERITIES.find((item) => item.key === severity) ?.label ?? severity;
};

function LinkedDataSummary({entry}: {entry: SeizureLogEntry}){
  const vital = entry.linkedData.nearestVital;
  const trend = entry.linkedData.nearestEEGTrend;

  return (
    <View style={styles.linkedDataContainer}>
      <Text style={styles.linkedDataTitle}>Koblet datapunkt</Text>
      <Text style={styles.linkedDataText}>
        Vitals: {vital ? `${vital.bpm ?? '--' } BPM • ${vital.spo2 ?? '--'}% SpO2 • ${vital.temp ?? '--'}°C` : 'ingen Vitals'}
      </Text>

      <Text style={styles.linkedDataMeta}> 
        Afstand: {formatDelta(entry.linkedData.nearestVitalDeltaMs)}
      </Text>

      <Text style={styles.linkedDataText}>
        EEG trend: {trend ? `score ${trend.score.toFixed(1)} • spikes ${trend.spikeCount}` : 'ingen trend'}
      </Text>

      <Text style={styles.linkedDataMeta}> 
        Afstand: {formatDelta(entry.linkedData.nearestEEGTrendDeltaMs)}
      </Text>

      <Text style={styles.linkedDataMeta}>
        EEG samples ±5 min: {entry.linkedData.eegSamplesAroundEvent.length}
      </Text>

    </View>
  );
}

export default function DagbogScreen({onScroll}: Props) {
  const [eventDate, setEventDate] = useState<Date>(new Date());
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [durationMinutes, setDurationMinutes] = useState('');
  
  const [severity, setSeverity] = useState<SeizureSeverity>('moderate');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]); // tilføj denne 

  const [customTriggers, setCustomTriggers] = useState<string>('');
  const [customSymptoms, setCustomSymptoms] = useState<string>('');
  const [customEmotions, setCustomEmotions] = useState<string>('');

  const [activeTagGroup, setActiveTagGroup] = useState<QuickTagGroup>('triggers');
  const [expandedTagGroup, setExpandedTagGroup] = useState<Record<QuickTagGroup, boolean>>({
    triggers: false,
    symptoms: false,
    emotions: false,
  });
  
  const [note, setNote] = useState<string>('');

  const seizureLogs = useDeviceDataStore((state) => state.seizureLogs);
  const addSeizureLog = useDeviceDataStore((state) => state.addSeizureLog);
  const removeSeizureLog = useDeviceDataStore((state) => state.removeSeizureLog);

  const eventCountData = useMemo(() => buildEventCountSourcePoints(seizureLogs), [seizureLogs]);

  const latestLog = seizureLogs[0];
  const logsThisWeek = seizureLogs.filter((log) => Date.now() - log.timestampMs <= 7 * 24 * 60 * 60 * 1000).length;


  function handleDateChange(_: DateTimePickerEvent, selected?: Date){

    if(Platform.OS !== 'ios') setShowDatePicker(false);
    if(!selected) return;

    const next = new Date(eventDate);
    next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
    setEventDate(next);
  };

  function handleTimeChange(_: DateTimePickerEvent, selected?: Date){
    if(Platform.OS !== 'ios') setShowTimePicker(false);
    if(!selected) return;

    const next = new Date(eventDate);
    next.setHours(selected.getHours(), selected.getMinutes(), 0);
    setEventDate(next);
  };
  
  function handleSaveLog(){
    const durationNumber = Number(durationMinutes.replace(',', '.'));
    const durationSeconds = durationNumber > 0 ? Math.round(durationNumber * 60) : null;

    addSeizureLog({
      timestampMs: eventDate?.getTime(),
      durationSeconds,
      severity,
      triggers: [...selectedTriggers, ...parseCsvTags(customTriggers)],
      symptoms: [...selectedSymptoms, ...parseCsvTags(customSymptoms)],
      emotions: [...selectedEmotions, ...parseCsvTags(customEmotions)],
      note,
    });

    setEventDate(new Date());
    setDurationMinutes('');
    setSeverity('moderate');
    setSelectedTriggers([]);
    setSelectedSymptoms([]);
    setSelectedEmotions([]);
    setCustomTriggers('');
    setCustomSymptoms('');
    setCustomEmotions('');
    setNote('');
  };

  function renderTagButton(tag: string, group: QuickTagGroup){
    const selected = 
      group === 'triggers' 
      ? selectedTriggers.includes(tag) 
      : group === "symptoms" 
        ? selectedSymptoms.includes(tag) 
        : selectedEmotions.includes(tag);

    return (
      <TouchableOpacity
        key={tag}
        style={[styles.tagButton, selected && styles.tagButtonActive]}
        onPress={() => {
          if (group === 'triggers') {setSelectedTriggers((current) => toggleTag(current, tag));}
          else if (group === 'symptoms') {setSelectedSymptoms((current) => toggleTag(current, tag));}
          else {setSelectedEmotions((current) => toggleTag(current, tag));}
        }}
      >
        <Text style={[styles.tagButtonText, selected && styles.tagButtonTextActive]}>{tag}</Text>
      </TouchableOpacity>
    );
  }

  function renderTagGroup(
    title: string,
    tags: string[],
    group: QuickTagGroup,
    primaryCount = 3,
  ){
    const expanded = expandedTagGroup[group];
    const visibleTags = expanded ? tags: tags.slice(0, primaryCount);
    const hiddenCount = tags.length - primaryCount;

    return (
      
      <View style={styles.tagGroupSection}>
        <View style={styles.tagGroupHeaderRow}>
          <Text style={styles.inputLabel}>{title}</Text>

          {hiddenCount > 0 && (
            <TouchableOpacity
              onPress={() =>
                setExpandedTagGroup((current) => ({
                  ...current,
                  [group]: !current[group],
                }))
              }
            >
              <Text style={styles.showMoreText}>{expanded ? 'Vis færre' : `Vis ${hiddenCount} flere`}</Text>
              <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.primus} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.tagGrid}>
          {visibleTags.map((tag) => renderTagButton(tag, group))}
        </View>
      </View>
    );
  }

  function renderTagTabs(){
    return(
      <View style={styles.tagGroupTabRow}>
        {(['triggers', 'symptoms', 'emotions'] as QuickTagGroup[]).map((group) =>{
          const active = activeTagGroup === group;

          const count =
            group === 'triggers'
            ? selectedTriggers.length
            : group === 'symptoms'
              ? selectedSymptoms.length
              : selectedEmotions.length;

          return(
            <TouchableOpacity
              key={group}
              style={[
                styles.tagGroupTabButton,
                active && styles.tagGroupTabButtonActive,
              ]}
              onPress={() => setActiveTagGroup(group)}
            >
              <Text style={[styles.tagGroupTabButtonText, active && styles.tagGroupTabButtonTextActive,]}>
                {group === 'triggers' 
                  ? `Triggere (${count})`
                  : group === 'symptoms' 
                    ? `Symptomer (${count})`
                    : `Følelser (${count})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animated.ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
        >
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Anfaldslog</Text>
            <Text style={styles.introText}>
              Registrer tidspunkt, triggers, symptomer, og mulige følelser. Hver log kobles automatisk med nærmeste datapunkt fra vitals og EEG trend.
            </Text>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Loggede anfald</Text>
                <Text style={styles.summaryCardValue}>{logsThisWeek}</Text>
              </View>

              <View style={styles.summaryCard}>
                <Text style={styles.summaryCardLabel}>Seneste</Text>
                <Text style={styles.summaryCardValueSmall}>{latestLog ? formatDateTime(latestLog.timestampMs) : '--'}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ny registrering</Text>

              <View style={styles.dateRow}>

                {/* =============== Dato knap ================== */}
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateButtonLabel}>Dato</Text>
                  <Text style={styles.dateButtonValue}>{eventDate.toLocaleDateString('da-DK')}</Text>
                </TouchableOpacity>

                {/* =============== Tidspunkt knap ================== */}

                <TouchableOpacity style={styles.dateButton} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.dateButtonLabel}>Tidspunkt</Text>
                  <Text style={styles.dateButtonValue}>{eventDate.toLocaleTimeString('da-DK', {hour: '2-digit', minute: '2-digit'})}</Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={eventDate}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}

              {/* =============== Varighed input ================== */}
              <Text style={styles.inputLabel}>Varighed (minutter)</Text>
              <TextInput
                style={styles.input}
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                placeholder="Eks. 2:30"
                keyboardType="decimal-pad"
              />

              {/* =============== Severity picker ================== */}
              <Text style={styles.inputLabel}>Intensitet</Text>
              <View style={styles.segmentedRow}>
                {SEVERITIES.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.segmentButton, severity === item.key && styles.segmentButtonActive]}
                    onPress={() => setSeverity(item.key)}
                  >
                    <Text style={[styles.segmentButtonText, severity === item.key && styles.segmentButtonTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.seperator} />


              {renderTagTabs()}

              {/* =============== Trigger tags ================== */}
              {activeTagGroup === 'triggers' && (
                <>
                {renderTagGroup('Triggere', TRIGGER_TAGS, 'triggers')}

              <TextInput
                style={styles.input}
                value={customTriggers}
                onChangeText={setCustomTriggers}
                placeholder="Eks. Søvn, Stress, Medicin"
                keyboardType="default"
              />
              </>
            )}

              {/* =============== Symptom tags ================== */}

              {activeTagGroup === 'symptoms' && (
                <>
                {renderTagGroup('Symptomer', SYMPTOM_TAGS, 'symptoms')}

              <TextInput
                style={styles.input}
                value={customSymptoms}
                onChangeText={setCustomSymptoms}
                placeholder="Eks. Aura, Kramper, Muskelryk"
                keyboardType="default"
              />
              </>
              )}

              {/* =============== Emotion tags ================== */}
              {activeTagGroup === 'emotions' && (
                <>
                {renderTagGroup('Følelser', EMOTION_TAGS, 'emotions')}

              <TextInput
                style={styles.input}
                value={customEmotions}
                onChangeText={setCustomEmotions}
                placeholder="Eks. Trist, Irritabel, Vrede"
                keyboardType="default"
              />
              </>
              )}

              <View style={styles.seperator} />



              {/* =============== Note input ================== */}
              <Text style={styles.inputLabel}>Noter</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                value={note}
                onChangeText={setNote}
                placeholder="Eks. Anfald varierede mellem moderate og kraftige kramper, der forårsagede store bevidsthedstab. Aktiviteten jeg var igang med var oprydning i køkkenet."
                multiline={true}
                numberOfLines={10}
              />

              <View style={styles.seperator} />

              {/* =============== Save button ================== */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveLog}>
                <Text style={styles.saveButtonText}>Gem log</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <InteractiveRangeChart
                title="Anfald pr. periode"
                unit="log"
                data={eventCountData}
                range="week"
                mode="sum"
                chartVariant="bar"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Historik</Text>
              {seizureLogs.length === 0 ? (
                <Text style={styles.emptyText}>Ingen anfald registreret</Text>
              ) : (
                seizureLogs.map((entry) => (
                  <View key={entry.id} style={styles.logCard}>
                    <View style={styles.logHeaderRow}>
                      <View style={styles.logHeaderTextWrapper}>
                        
                        <Text style={styles.logHeaderTitle}>{formatDateTime(entry.timestampMs)}</Text>
                        
                        <Text style={styles.logMeta}>
                          {getSeverityLabel(entry.severity)} • {entry.durationSeconds ? `${Math.round(entry.durationSeconds /60)} min`: 'ukendt varighed'}
                        </Text>

                      </View>

                      <TouchableOpacity onPress={() => removeSeizureLog(entry.id)} style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>Slet</Text>
                      </TouchableOpacity>
                    </View>

                    {!!entry.triggers.length && 
                      <Text style={styles.logText}>
                        Triggere: {entry.triggers.join(', ')}
                      </Text>}

                    {!!entry.symptoms.length && 
                      <Text style={styles.logText}>
                        Symptomer: {entry.symptoms.join(', ')}
                      </Text>}

                    {!!entry.emotions.length && 
                      <Text style={styles.logText}>
                        Følelser: {entry.emotions.join(', ')}
                      </Text>}

                    {!!entry.note && 
                      <Text style={styles.logText}>
                        Noter: {entry.note}
                      </Text>}

                    <LinkedDataSummary entry={entry} />
                  </View>
                ))
              )}
            </View>

          
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  screenContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 90,
    color: COLORS.primus,
  },
  introText: {
    fontSize: 16,
    marginBottom: 24,
    color: COLORS.lux,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  summaryCard: {
    flex: 1,
    minHeight: 86,
    backgroundColor: COLORS.diaphanus,
    borderRadius: 12,
    padding: 12,
  },

  summaryCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primus,
    opacity: 0.7,
    textTransform: 'uppercase',
  },

  summaryCardValue: {
    fontSize: 30,
    fontWeight: '900',
    color: COLORS.primus,
    marginTop: 8,
  },

  summaryCardValueSmall: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primus,
    marginTop: 10,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.diaphanus,
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 14,
    color: COLORS.primus,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dateButton: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.quartus,
  },

  dateButtonLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primus,
    opacity: 0.7,
    marginBottom: 4,
  },

  dateButtonValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primus,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primus,
    marginTop: 12,
    marginBottom: 8,
  },

  input: {
    minHeight: 46,
    borderRadius: 16,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.quartus,
  },

  noteInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },

  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    backgroundColor: COLORS.quartus,
    alignItems: 'center',
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primus,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.primus,
  },
  segmentButtonTextActive: {
    color: COLORS.white,
  },
  segmentTextActive: {
    color: COLORS.white,
  },
  seperator: {
    height: 1.5,
    backgroundColor: COLORS.quartus,
    marginVertical: 18,
    marginTop: 30,
    marginBottom: 25,
  },

  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  tagButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.quartus,
  },
  tagButtonActive: {
    backgroundColor: COLORS.primus,
  },
  tagButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primus,
  },
  tagButtonTextActive: {
    color: COLORS.white,
  },
  tagGroupSection: {
    marginTop: 14,
  },
  tagGroupHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagGroupTabRow: {
    flexDirection: 'row',
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    backgroundColor: COLORS.quartus,
  },
  tagGroupTabButtonActive: {
    backgroundColor: COLORS.primus,
  },
  tagGroupTabButtonText: {
    color: COLORS.primus,
  },
  tagGroupTabButtonTextActive: {
    color: COLORS.white,
  },
  tagGroupTabButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primus,
  },
  saveButton: {
    borderRadius: 18,
    minHeight: 52,
    backgroundColor: COLORS.primus,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.white,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    opacity: 0.7,
  },

  logCard: {
    backgroundColor: COLORS.quartus,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },
  logHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },

  logHeaderTextWrapper: {
    flex: 1,
  },
  logHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primus,
  },
  logMeta: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.tertius,
    opacity: 0.7,
    marginTop: 2,
  },
  deleteButton: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.tertius,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  deleteButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.red,
  },
  logText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primus,
    marginTop: 5,
  },
  logNote: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.black,
    marginTop: 8,
  },
  linkedDataContainer: {
    marginTop: 12,
    borderRadius: 16,
    padding: 12,
    backgroundColor: COLORS.diaphanus2,
  },
  linkedDataTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.primus,
    marginBottom: 6,
  },
  linkedDataText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 4,
  },
  linkedDataMeta: {
    fontSize: 12,
    color: COLORS.primus,
    opacity: 0.7,
    marginTop: 2,
  },
});