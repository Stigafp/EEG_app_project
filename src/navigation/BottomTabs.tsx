import { View, Text, Animated, StyleSheet } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import COLORS from '../constants/colors';
import { FontAwesome5 } from '@expo/vector-icons';

import createStackNavigator from './StackNavigator';

import DashboardScreen from '../screens/DashboardScreen';
import YourDataScreen from '../screens/YourDataScreen';
import MedicinScreen from '../screens/MedicinScreen';
import DagbogScreen from '../screens/DagbogScreen';
import NewsScreen from '../screens/NewsScreen';

const Tab = createBottomTabNavigator();

const HomeStack = createStackNavigator({component: DashboardScreen, initialName: "HomeMain"});
const YourDataStack = createStackNavigator({component: YourDataScreen, initialName: "YourDataMain"});
const MedicinStack = createStackNavigator({component: MedicinScreen, initialName: "MedicinMain"});
const DagbogStack = createStackNavigator({component: DagbogScreen, initialName: "DagbogMain"});
const NewsStack = createStackNavigator({component: NewsScreen, initialName: "NewsMain"});

export default function BottomTabs() {
    return(
        <Tab.Navigator
          screenOptions={({route}) => ({
            headerShown: false,
            sceneStyle: { backgroundColor: "transparent" },
    
            tabBarShowLabel: false,
            tabBarIcon: ({ size, focused}) => {
              let iconName: any;
    
              if(route.name === "Home") iconName = "home";
              else if(route.name === "Your Data") iconName = "heartbeat";
              else if(route.name === "Medicin") iconName = "capsules";
              else if(route.name === "Dagbog") iconName = "book";
              else if(route.name === "News") iconName = "newspaper";
    
              return (
                <View style={styles.tabBarPill}>
                  <FontAwesome5
                    name={iconName}
                    size={focused ? size + 2 : size - 6}
                    color={focused ? COLORS.primus : "rgba(0,0,0,0.4)"}
                    solid={focused}
                  />
                  <Text style={[styles.tabBarLabel, focused && styles.tabBarLabelActive]}>
                    {route.name}
                  </Text>
                </View>
              );
            },
    
            tabBarStyle: {
              position: "absolute",
              left: 20,
              right: 20,
              bottom: 24,
              height: 60,
              marginLeft: 8,
              marginRight: 8,
              paddingTop: 10,
              borderRadius: 999,
              borderTopWidth: 0,
              backgroundColor: COLORS.lightGray,
            },
            tabBarItemStyle: {
              height: 76,
            },
            tabBarActiveTintColor: COLORS.primus,
            tabBarInactiveTintColor: "#8A8A8A",
            tabBarHideOnKeyboard: true,
          })}
        >
          <Tab.Screen name="Home" component={HomeStack} />
          <Tab.Screen 
            name="Your Data" 
            component={YourDataStack}
            options={{tabBarLabel: "Dine Data"}} />
          <Tab.Screen name="Medicin" component={MedicinStack} />
          <Tab.Screen name="Dagbog" component={DagbogStack} />
          <Tab.Screen name="News" component={NewsStack} />
        </Tab.Navigator>
        );
    }

    const styles = StyleSheet.create({
        tabBarPill: {
          width: 82,
          height: 50,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
        },
      
        tabBarLabel: {
          fontSize: 11,
          fontWeight: "400",
        },
        tabBarLabelActive: {
          color: COLORS.primus,
          fontWeight: "800",
        },
      });
      