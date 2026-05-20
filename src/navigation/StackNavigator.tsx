import { View, Text, Animated } from 'react-native'
import React, { useRef } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import Header from '../components/Header'

import BiometricDetailScreen from '../screens/BiometricDetailScreen'
import ProfileScreen from '../screens/ProfileScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import EmergencyScreen from '../screens/EmergencyScreen'

type StackNav = {
    component: React.ComponentType<any>;
    initialName: string;
    title?: string;
};

const Stack = createNativeStackNavigator();

export default function createStackNavigator({component: ScreenComponent, initialName, title = "EEGo"}: StackNav) {
    return function StackNavigator() {
        const scrollY = useRef(new Animated.Value(0)).current;

        const handleScroll = Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY }}}],
            {useNativeDriver: false },
        );

  return (
    <Stack.Navigator
        screenOptions={({ navigation, route}) => ({
          contentStyle: { backgroundColor: "transparent" },
          headerTransparent: true,
          header: () => (
            <Header
              title={title}
              bleStatus="Køb en NeuroKrown i dag!"
              scrollY={scrollY}
              showBackButton={route.name === "BiometricDetail" && navigation.canGoBack()}
              onBackPress={() => navigation.goBack()}
            />
          ),
        })}
      >
        <Stack.Screen
          name={initialName}>
            {(props) => (
              <ScreenComponent
                {...props}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { y: scrollY }}}],
                  { useNativeDriver: false}
                )}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="BiometricDetail" component={BiometricDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Emergency" component={EmergencyScreen} />
      </Stack.Navigator>
  )
}
}