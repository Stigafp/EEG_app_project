import { View, Text, TextInput, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable, Switch } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'

import { useNotificationStore } from '../stores/notificationStore';
import { DeviceState, useDeviceDataStore } from '../stores/deviceDataStore';
import COLORS from '../constants/colors';
import Header from '../components/Header';
import { FlatList } from 'react-native-gesture-handler';

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
}

const isCriticalState = (deviceState: DeviceState, audioState: DeviceState) =>
  deviceState === "ALARM" || audioState === "ALARM";

const getAlarmSource = (deviceState: DeviceState, audioState: DeviceState) => {
  if (deviceState === "ALARM" && audioState === "ALARM") return "SYSTEM";
  if (audioState === "ALARM") return "AUDIO_AI";
  return "VITALS";
};

export default function EmergencyScreen() {
  const deviceState = useDeviceDataStore((state) => state.deviceState);
  const audioState = useDeviceDataStore((state) => state.audioState);

  const bpm = useDeviceDataStore((state) => state.bpm);
  const spo2 = useDeviceDataStore((state) => state.spo2);
  const temp = useDeviceDataStore((state) => state.temp);
  const eegIrregular = useDeviceDataStore((state) => state.eegIrregular);
  const eegTrend = useDeviceDataStore((state) => state.eegTrendHistory);

  const addNotification = useNotificationStore((state) => state.addNotification);

  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  const [doctorSharingEnabled, setDoctorSharingEnabled] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");

  const wasCriticalState = useRef(false);

  const addContact = () => {
    const name = emergencyContactName.trim();
    const phone = emergencyContactPhone.trim();

    if(!name || !phone){
      Alert.alert("Manglende oplysninger", "Du skal indtaste et navn og et telefonnummer");
      return;
    }
    setEmergencyContacts((currentContacts) => [...currentContacts, { id: Date.now().toString(), name, phone }]);
    setEmergencyContactName("");
    setEmergencyContactPhone("");
  };

  const removeContact = (id: string) => {
    setEmergencyContacts((currentContacts) => currentContacts.filter((item) => item.id !== id));
  };
  
  const emergencyMessageToContact = (triggeredBySystem = false) => {
    if(emergencyContacts.length > 0){

      const recipients = emergencyContacts.map((contact) => contact.name).join(", ");

      addNotification({
        severity: "ALARM",
        title: "Nødkontakter informeret",
        message: "Nødbesked sendt til: " + recipients,
        source: getAlarmSource(deviceState, audioState),
        dismissed: false,
      });
    }
  }

  const dataSharingWithDoctor = () => {
    const email = doctorEmail.trim();

    if(doctorSharingEnabled && !email || !doctorSharingEnabled){
      Alert.alert("Manglende oplysninger", "Du skal acceptere data deling og indtaste email adresse");
      return;
    }

    if(doctorSharingEnabled && email){

      addNotification({
        severity: "INFO",
        title: "Data delt med læge",
        message: "Data delt med læge: " + email,
        source: "SYSTEM",
        dismissed: false,
      })

      Alert.alert("Data deling med læge", "Din data er blevet delt med læge: " + email);
    };
  };

  useEffect(() => {
    const isCritical = isCriticalState(deviceState, audioState);

    if(isCritical && !wasCriticalState.current){
      emergencyMessageToContact();
    }
    wasCriticalState.current = isCritical;
  }, [deviceState, audioState]);

  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView style={{flex: 1}}>

 {/* 
 ================================
 titel for siden 
 ================================ */}
    <View>
      <Text style={styles.title}>Læge & Nødkontakt</Text>
    </View>

    {/* 
    ================================
    data sharing med doktor sektion 
    ================================ */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Data deling med læge</Text>
      <Switch
        value={doctorSharingEnabled}
        onValueChange={setDoctorSharingEnabled}
      />
      <TextInput
        style={styles.input}
        placeholder="Lægens email"
        value={doctorEmail}
        onChangeText={setDoctorEmail}
        keyboardType="email-address"
      />
      <Pressable style={styles.addButton} onPress={dataSharingWithDoctor}>
        <Text style={styles.addButtonText}>Del data med læge</Text>
      </Pressable>
    </View>


{/* ================================
           nødkontakt sektion 
 ================================ */}
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Opsæt nødkontakt</Text>

      <TextInput
        style={styles.input}
        placeholder="Navn"
        value={emergencyContactName}
        onChangeText={setEmergencyContactName}
      />

      <TextInput
        style={styles.input}
        placeholder="Telefonnummer"
        value={emergencyContactPhone}
        onChangeText={setEmergencyContactPhone}
        keyboardType="phone-pad"
      />
      <Pressable style={styles.addButton} onPress={addContact}>
        <Text style={styles.addButtonText}>Tilføj nødkontakt</Text>
      </Pressable>

      <FlatList
        data={emergencyContacts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.sectionSubTitle}>Tilføjede nødkontakter</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>Ingen nødkontakter tilføjet</Text>}
        renderItem={({item}) => (
          <View style={styles.contactItemRow}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <Pressable style={styles.removeButton} onPress={() => removeContact(item.id)}>
              <Text style={styles.removeButtonText}>Fjern</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 140,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primus,
    marginBottom: 16,
  },
  section: {
    backgroundColor: COLORS.diaphanus,
    padding: 16,
    borderRadius: 18,
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primus,
    marginBottom: 16,
  },
  input: {

    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: COLORS.primus,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: COLORS.diaphanus,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.primus,
    textAlign: 'center',
    marginTop: 20,
  },
  contactItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primus,
  },
  contactPhone: {
    fontSize: 14,
    color: COLORS.primus,
  },
  removeButton: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  removeButtonText: {
    color: COLORS.diaphanus,
    fontWeight: '800',
  },
  sectionSubTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primus,
    marginBottom: 10,
    marginTop: 30,
  },
});