import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Animated, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { CarePlanItemType, useCarePlanStore, CarePlanItem } from '../stores/carePlanStore';
import COLORS from '../constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  onScroll: any;
};

export default function MedicinScreen({onScroll}: Props) {
  const items = useCarePlanStore((state) => state.items);
  const visibleItems = items.filter((item) => item.status !== 'done');

  //const activeItems = items.filter((item) => item.status === "active");

  const addMedication = useCarePlanStore((state) => state.addMedication);
  const addReminder = useCarePlanStore((state) => state.addReminder);
  const addTraining = useCarePlanStore((state) => state.addTraining);
  
  const removeItem = useCarePlanStore((state) => state.removeItem);
  const updateItem = useCarePlanStore((state) => state.updateItem);

  const toggleActive = useCarePlanStore((state) => state.toggleActive);
  const markDone = useCarePlanStore((state) => state.markDone);
  const markDelayed = useCarePlanStore((state) => state.markDelayed);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<CarePlanItemType>("medication");
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dosage, setDosage] = useState("");

  const [scheduledAt, setScheduledAt] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  function resetForm(){
    setTitle("");
    setDescription("");
    setScheduledAt(new Date());
    setDosage("");
    setType("medication");
    setShowForm(false);
    setEditingId(null);
    setShowDatePicker(false);
    setShowTimePicker(false);
  }

  function startEdit(item:CarePlanItem){
    setEditingId(item.id);
    setType(item.type);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setDosage(item.dosage ?? "");
    setScheduledAt(new Date(item.delayedTill ?? item.scheduledAt));
    setShowForm(true);
  }

  async function handleAddPlan(){
    if (!title.trim()) return;

    const scheduledAtIso = scheduledAt.toISOString();
  
    const input = {
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledAt: scheduledAtIso,
      dosage: type === "medication" ? dosage.trim() || undefined : undefined,
    }

    if(editingId){
      await updateItem(editingId, input);
      resetForm()
      return;
    }
    if(type === "medication"){
      await addMedication(input);
    }

    if (type === "reminder"){
      await addReminder(input);
    }

    if (type === "training"){
      await addTraining(input);
    }

    resetForm();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>

    <Animated.ScrollView 
    style={styles.scrollView}
    contentContainerStyle={styles.container}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Opret din Care Plan</Text>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowForm(prev => !prev)}
        >
        <Text style={styles.addButtonText}>
          {showForm ? "Luk" : "Tilføj plan"}
          </Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{editingId ? "Rediger plan" : "Vælg plantype"}</Text>

          <View style={styles.typeRow}>
            <TouchableOpacity style={[styles.typeButton, type === "medication" && styles.typeButtonActive]}
            onPress={() => setType("medication")}
            >
              <Text style={styles.typeButtonText}>Medicin</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.typeButton, type === "reminder" && styles.typeButtonActive]}
            onPress={() => setType("reminder")}
            >
              <Text style={styles.typeButtonText}>Påmindelse</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.typeButton, type === "training" && styles.typeButtonActive]}
            onPress={() => setType("training")}
            >
              <Text style={styles.typeButtonText}>Træning</Text>
            </TouchableOpacity>
          </View>

          <TextInput
          style={styles.input}
          placeholder={type === "medication" ? "Medicin navn" : type === "training" ? "Træningprogram" : "titel for påmindelse"}
          value={title}
          onChangeText={setTitle}
          />

          <TextInput
          style={styles.input}
          placeholder="Beskrivelse"
          value={description}
          onChangeText={setDescription}
          />

          {type === "medication" && (
            <TextInput
            style={styles.input}
            placeholder="Dosering, fx 2 tabletter"
            value={dosage}
            onChangeText={setDosage}
            />
          )}

          {/* <TextInput
          style={styles.input}
          placeholder="Dato"
          value={date}
          onChangeText={setDate}
          />

          <TextInput
          style={styles.input}
          placeholder="Tid"
          value={time}
          onChangeText={setTime}
          /> */}

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            >
              <Text>{scheduledAt.toLocaleDateString('da-dk', {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
              >
                <Text>{scheduledAt.toLocaleTimeString('da-dk', {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                </Text>
              </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={scheduledAt}
                mode="date"
                display="spinner"
                onChange={(_, selectedDate) => {
                  setShowDatePicker(false);

                  if (selectedDate){
                    const nextDate = new Date(scheduledAt)
                    nextDate.setFullYear(selectedDate.getFullYear())
                    nextDate.setMonth(selectedDate.getMonth())
                    nextDate.setDate(selectedDate.getDate())
                    setScheduledAt(nextDate);
                  }
                }}
              />
            )}

            {showTimePicker && (
              <DateTimePicker
                value={scheduledAt}
                mode="time"
                display="spinner"
                is24Hour={true}
                onChange={(_, selectedTime) => {
                  setShowTimePicker(false);
                  
                  if (selectedTime){
                    const nextDate = new Date(scheduledAt)
                    nextDate.setHours(selectedTime.getHours())
                    nextDate.setMinutes(selectedTime.getMinutes())
                    nextDate.setSeconds(0)
                    nextDate.setMilliseconds(0)
                    setScheduledAt(nextDate);
                  }
                }}
              />
            )}

            

          <TouchableOpacity style={styles.addButton} onPress={handleAddPlan}>
            <Text style={styles.addButtonText}>{editingId ? "Gem ændring" : "Gem plan"}</Text>
          </TouchableOpacity>

          </View>
        )}

<View style={styles.planContainer}>
        <Text style={styles.sectionTitle}>Alle aktive planer</Text>

        {visibleItems.length === 0 && (
          <Text style={styles.emptyText}>Ingen planer fundet</Text>
        )}

        {visibleItems.map((item) => (
          <View style={styles.planCard} key={item.id}>
            <View style={styles.planHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.planText}>{getTypeLabel(item.type)}</Text>
                <Text style={styles.sectionTitle}>{item.title}</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => startEdit(item)}>
                  <Text style={styles.editText}>Rediger</Text>
                </TouchableOpacity>
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Text style={styles.removeText}>Fjern</Text>
              </TouchableOpacity>
              </View>
            </View>

            {item.description && (
              <Text style={styles.planText}>{item.description}</Text>
            )}

            {item.dosage && (
              <Text style={styles.planText}>Dosering: {item.dosage}</Text>
            )}

            <Text style={styles.planDate}>
              {new Date(item.scheduledAt).toLocaleString('da-DK', {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            
            <Text style={styles.statusText}> Status: {getStatusLabel(item.status)}</Text>

            <View style={styles.itemActionRow}>
              <TouchableOpacity 
                style={styles.smallButton} 
                onPress={() => toggleActive(item.id)}
              >
                <Text style={styles.smallButtonText}>
                  {item.status === "active" ? "Deaktiver" : "Aktivér"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton} onPress={() => markDelayed(item.id, 15)}>
                <Text style={styles.smallButtonText}>+15 min.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton} onPress={() => markDone(item.id)}>
                <Text style={styles.smallButtonText}>Afslut</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        </View>
    </Animated.ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function getTypeLabel(type:CarePlanItemType){
  switch(type){
    case "medication":
      return "Medicin";
    case "reminder":
      return "Påmindelse";
    case "training":
      return "Træning";
  }
}

function getStatusLabel(status: CarePlanItem['status']){
  switch(status){
    case "active":
      return "Aktiv";
    case "inactive":
      return "Inaktiv";
    case "delayed":
      return "Udskudt";
    case "done":
      return "Afsluttet";
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    //backgroundColor: COLORS.tertius,
  },
  scrollView: {
    flex: 1,
    //backgroundColor: COLORS.tertius,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 100,
    //backgroundColor: COLORS.tertius,
    
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primus,
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: COLORS.primus,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  addButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },

  formContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
  },
  planContainer: {
    backgroundColor: COLORS.diaphanus,
    borderRadius: 18,
    padding: 16,
  },

formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primus,
    marginBottom: 12,
  },

  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  typeButtonActive: {
    borderWidth: 2,
    borderColor: COLORS.primus,
  },

  typeButtonText: {
    fontWeight: '700',
    color: COLORS.primus,
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: COLORS.primus,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
  },

  emptyText: {
    color: '#555',
    fontSize: 15,
  },

  planCard: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  planType: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primus,
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primus,
    marginBottom: 10,
  },

  planText: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
  },
  planDate: {
    marginTop: 6,
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },

  statusText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primus,
  },

  removeText: {
    color: '#e74c3c',
    fontWeight: '800',
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 12,
  },
  editText: {
    color: COLORS.primus,
    fontWeight: '800',
  },
  itemActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  smallButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  smallButtonText: {
    color: COLORS.primus,
    fontWeight: '800',
    fontSize: 12,
    textAlign: 'center',
  },

})