/* Mit hieraki er Drawer -> Tab -> Stack med screen oprettet i stack'en og som er tilgængelig i drawer.
Jeg har flyttet det fra en fil til flere for bedre overblik. Kunne se det var standard ved flere vid's.

video inspiration for drawer: https://www.youtube.com/watch?v=65xmaJNpZVY&t=1s 
for bottom tabs: https://www.youtube.com/watch?v=xC6VawAfy2A&t=796s 
*/


import React, { useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { FontAwesome5 } from "@expo/vector-icons";

import BottomTabs from "./BottomTabs";
import COLORS from "../constants/colors";

const transparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

const Drawer = createDrawerNavigator();

function AppDrawerNavContent(props: any){
  const closeDrawer = () => {
    props.navigation.closeDrawer();
  };

  const navigateToHomeStackScreen = (screenName: string) => {
    props.navigation.navigate("MainTabs", {
      screen: "Home",
      params: { screen:screenName},
    });

    closeDrawer();
  };

  return(
    <DrawerContentScrollView {...props}>
      <DrawerItem
        label="Dashboard"
        icon={({ color, size }) => <FontAwesome5 name="home" color={COLORS.primus} size={28} />}
        onPress={() => { props.navigation.navigate("MainTabs", { screen: "Home"});
          closeDrawer();
        }}
       />

        <DrawerItem
          label="Data deling & nødkontakt"
          icon={({ color, size}) => <FontAwesome5 name="exclamation-triangle" color={COLORS.primus} size={28} />}
          onPress={() => navigateToHomeStackScreen( "Emergency")}
       />

        <DrawerItem
          label="F.A.Q."
          icon={({ color, size}) => <FontAwesome5 name="question-circle" color={COLORS.primus} size={28} />}
          onPress={() => navigateToHomeStackScreen( "FAQ")}
       />


        <DrawerItem
        label="Indstillinger"
        icon={({ color, size}) => <FontAwesome5 name="cog" color={COLORS.primus} size={28} />}
        onPress={() => navigateToHomeStackScreen( "Settings")}
       />

    </DrawerContentScrollView>
  );
};

export default function AppNavigator(){
  return(
    <NavigationContainer theme={transparentTheme}>
      <Drawer.Navigator 
        drawerContent={(props) => <AppDrawerNavContent {...props} />} 
        screenOptions={{ headerShown: false,
        
        drawerStyle:{
          paddingTop: 70,
          backgroundColor: COLORS.diaphanus,
        },
        }}
        >
        <Drawer.Screen name="MainTabs" component={BottomTabs} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

// ======================================================
// GAMMELT KODE
// ======================================================

// 7. maj 2025

/* SCREENS: Stack */

// import BiometricDetailScreen from "../screens/BiometricDetailScreen";
// import ProfileScreen from "../screens/ProfileScreen";
// import NotificationsScreen from "../screens/NotificationsScreen";
// import SettingsScreen from "../screens/SettingsScreen";
// import EmergencyScreen from "../screens/EmergencyScreen";
// import ArticleWebViewScreen from "../screens/ArticleWebViewScreen";

/* SCREENS: Tabstack */

// import DashboardScreen from "../screens/DashboardScreen";
// import YourDataScreen from "../screens/YourDataScreen";
// import MedicinScreen from "../screens/MedicinScreen";
// import DagbogScreen from "../screens/DagbogScreen";
// import NewsScreen from "../screens/NewsScreen";

// import createStackNavigator from "./StackNavigator";

// const Tab = createBottomTabNavigator();
// const Stack = createNativeStackNavigator();

// function createStack(ScreenComponent: any, initialName: string, title = "EEGo"){
//   return function StackNavigator(){
//     const scrollY = useRef(new Animated.Value(0)).current;

//     return(
//       <Stack.Navigator
//         screenOptions={({ navigation, route}) => ({
//           contentStyle: { backgroundColor: "transparent" },
//           headerTransparent: true,
//           header: () => (
//             <Header
//               title={title}
//               bleStatus="Køb en NeuroKrown i dag!"
//               scrollY={scrollY}
//               showBackButton={route.name === "BiometricDetail" && navigation.canGoBack()}
//               onBackPress={() => navigation.goBack()}
//             />
//           ),
//         })}
//       >
//         <Stack.Screen
//           name={initialName}>
//             {(props) => (
//               <ScreenComponent
//                 {...props}
//                 onScroll={Animated.event(
//                   [{ nativeEvent: { contentOffset: { y: scrollY }}}],
//                   { useNativeDriver: false}
//                 )}
//               />
//             )}
//           </Stack.Screen>

//           <Stack.Screen name="BiometricDetail" component={BiometricDetailScreen} />
//           <Stack.Screen name="Profile" component={ProfileScreen} />
//           <Stack.Screen name="Notifications" component={NotificationsScreen} />
//           <Stack.Screen name="Settings" component={SettingsScreen} />
//           <Stack.Screen name="Emergency" component={EmergencyScreen} />
//       </Stack.Navigator>
//     );
//   };
// }

// const HomeStack = createStackNavigator({component: DashboardScreen, initialName: "HomeMain"});
// const YourDataStack = createStackNavigator({component: YourDataScreen, initialName: "YourDataMain"});
// const MedicinStack = createStackNavigator({component: MedicinScreen, initialName: "MedicinMain"});
// const DagbogStack = createStackNavigator({component: DagbogScreen, initialName: "DagbogMain"});
// const NewsStack = createStackNavigator({component: NewsScreen, initialName: "NewsMain"});

// function BottomTabNavigator(){
//   return(
//     <Tab.Navigator
//       screenOptions={({route}) => ({
//         headerShown: false,
//         sceneStyle: { backgroundColor: "transparent" },

//         tabBarShowLabel: false,
//         tabBarIcon: ({ size, focused}) => {
//           let iconName: any;

//           if(route.name === "Home") iconName = "home";
//           else if(route.name === "Your Data") iconName = "heartbeat";
//           else if(route.name === "Medicin") iconName = "capsules";
//           else if(route.name === "Dagbog") iconName = "book";
//           else if(route.name === "News") iconName = "newspaper";

//           return (
//             <View style={styles.tabBarPill}>
//               <FontAwesome5
//                 name={iconName}
//                 size={focused ? size + 2 : size - 6}
//                 color={focused ? COLORS.primus : "rgba(0,0,0,0.4)"}
//                 solid={focused}
//               />
//               <Text style={[styles.tabBarLabel, focused && styles.tabBarLabelActive]}>
//                 {route.name}
//               </Text>
//             </View>
//           );
//         },

//         tabBarStyle: {
//           position: "absolute",
//           left: 20,
//           right: 20,
//           bottom: 24,
//           height: 60,
//           marginLeft: 8,
//           marginRight: 8,
//           paddingTop: 10,
//           borderRadius: 999,
//           borderTopWidth: 0,
//           backgroundColor: COLORS.lightGray,
//         },
//         tabBarItemStyle: {
//           height: 76,
//         },
//         tabBarActiveTintColor: COLORS.primus,
//         tabBarInactiveTintColor: "#8A8A8A",
//         tabBarHideOnKeyboard: true,
//       })}
//     >
//       <Tab.Screen name="Home" component={HomeStack} />
//       <Tab.Screen 
//         name="Your Data" 
//         component={YourDataStack}
//         options={{tabBarLabel: "Dine Data"}} />
//       <Tab.Screen name="Medicin" component={MedicinStack} />
//       <Tab.Screen name="Dagbog" component={DagbogStack} />
//       <Tab.Screen name="News" component={NewsStack} />
//     </Tab.Navigator>
//     );
// }

// const styles = StyleSheet.create({
//   tabBarPill: {
//     width: 82,
//     height: 50,
//     borderRadius: 999,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 3,
//   },

//   tabBarLabel: {
//     fontSize: 11,
//     fontWeight: "400",
//   },
//   tabBarLabelActive: {
//     color: COLORS.primus,
//     fontWeight: "800",
//   },
// });







// ======================================================

// import React, {useRef} from 'react';
// import {NavigationContainer, DefaultTheme} from "@react-navigation/native";
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { Animated, StyleSheet, Text, View } from 'react-native';
// import Header from '../components/Header';
// import COLORS from '../constants/colors';
// import {FontAwesome5} from '@expo/vector-icons';
// import {BlurView} from 'expo-blur';


// import DashboardScreen from '../screens/DashboardScreen';
// import YourDataScreen from '../screens/YourDataScreen';
// import MedicinScreen from '../screens/MedicinScreen';
// import DagbogScreen from '../screens/DagbogScreen';
// import NewsScreen from '../screens/NewsScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import NotificationsScreen from '../screens/NotificationsScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import EmergencyScreen from '../screens/EmergencyScreen';
// import BiometricDetailScreen from '../screens/BiometricDetailScreen';

// const Tab = createBottomTabNavigator();
// const Drawer = createDrawerNavigator();
// const Stack = createNativeStackNavigator();

// const transparentTheme = {
//   ...DefaultTheme,
//   colors: {
//     ...DefaultTheme.colors,
//     background: "transparent",
//   },
// };

// const BottomTabNavigator = () => {
//   const scrollY = useRef(new Animated.Value(0)).current;

//   const handleScroll = Animated.event(
//     [{nativeEvent: {contentOffset: {y: scrollY}}}],
//     {useNativeDriver: false},
//   );

//   return ( 
//     <Tab.Navigator 
//       screenOptions={({ route, navigation }) => ({
//         sceneStyle: {
//           backgroundColor: "transparent",
//         },
//         headerTransparent: true,
//         headerStyle: {
//           backgroundColor: "transparent",
//         },
//       header: () => (
//         <Header
//           title={route.name === "Dashboard" ||
//                   route.name === "Your Data" ||
//                   route.name === "Medicin" ||
//                   route.name === "Dagbog" ||
//                   route.name === "Home" ||
//                   route.name === "News" ?
//                   "EEGo" : route.name}
//           bleStatus={ route.name === "Dashboard" ||
//                       route.name === "Your Data" ||
//                       route.name === "Medicin" ||
//                       route.name === "Dagbog" ||
//                       route.name === "Home" ||
//                       route.name === "News" ? 
//                       "Køb en NeuroKrown i dag!" : null}
//           scrollY={scrollY}
//         />
//       ),

//       tabBarShowLabel: false,
//       tabBarIcon: ({ color, size, focused }) => {
//         let iconName: any;
//         if(route.name === "Home") iconName = "home";
//         else if(route.name === "Your Data") iconName = "heartbeat";
//         else if(route.name === "Medicin") iconName = "capsules";
//         else if(route.name === "Dagbog") iconName = "book";
//         else if(route.name === "News") iconName = "newspaper";

//         return (
//           <View 
//             style={[
//               styles.tabBarPill, 
//             ]}>
//           <FontAwesome5
//             name={iconName} 
//             size={focused ? size + 2 : size -6} 
//             color={focused ? COLORS.primus : "rgba(0,0,0,0.4)"} 
//             solid={focused}
//             />
//             <Text style={[styles.tabBarLabel, focused && styles.tabBarLabelActive]}>
//               {route.name}
//             </Text>
//         </View>
//         );
//       },
//       tabBarStyle: {
//         position: "absolute",
//         left: 20,
//         right: 20,
//         bottom: 24,
//         height: 60,
//         marginLeft:8,
//         marginRight:8,
//         paddingTop: 10,
//         borderRadius: 999,
//         borderTopWidth: 0,
//         backgroundColor: COLORS.lightGray,
//       },
      
//       tabBarItemStyle: {
//         height: 76,
//       },
      
//       tabBarActiveTintColor: COLORS.primus,
//       tabBarInactiveTintColor: "#8A8A8A",
      
//       tabBarHideOnKeyboard: true,
    
//     })}>
//       <Tab.Screen 
//         name="Home"
//         listeners={{
//           tabPress: () => {
//             scrollY.setValue(0);
//           },
//         }}
//       >{(props) => <DashboardScreen {...props} onScroll={handleScroll} />}
//         </Tab.Screen>

//       <Tab.Screen 
//         name="Your Data"
//         listeners={{
//           tabPress: () => {
//             scrollY.setValue(0);
//           },
//         }} 
//         >{(props) => <YourDataScreen {...props} onScroll={handleScroll} />}
//       </Tab.Screen>

//       <Tab.Screen 
//         name="Medicin"
//         listeners= {{
//           tabPress: () => {
//             scrollY.setValue(0);
//           },
//         }} 
//         >{(props) => <MedicinScreen {...props} onScroll={handleScroll} />}
//       </Tab.Screen>

//       <Tab.Screen 
//         name="Dagbog"
//         listeners={{
//           tabPress: () => {
//             scrollY.setValue(0);
//           },
//         }}
//          >{(props) => <DagbogScreen {...props} onScroll={handleScroll} />}
//       </Tab.Screen>

//       <Tab.Screen 
//         name="News"
//         listeners={{
//           tabPress: () => {
//             scrollY.setValue(0);
//           },
//         }} 
//         >{(props) => <NewsScreen {...props} onScroll={handleScroll} />}
//       </Tab.Screen>

//     </Tab.Navigator>
//   );
// }

// function MainStackNavigator(){
//   return(
//     <Stack.Navigator
//       screenOptions={{
//         contentStyle: {
//           backgroundColor: "transparent",
//         },
//       }}
//     >
//       <Stack.Screen
//         name="Tabs"
//         component={BottomTabNavigator}
//         options={{
//           title: "Home",
//           headerShown: false,
//         }}
//       />
//       <Stack.Screen
//         name="BiometricDetail"
//         component={BiometricDetailScreen}
//         options={{
//           title: "Biometrisk detalje",
//           headerShown: true,
//         }}
//       />
//       <Stack.Screen
//         name="Profile"
//         component={ProfileScreen}
//         options={{
//           title: "Profil",
//         }}
//       />
//       <Stack.Screen
//         name="Notifications"
//         component={NotificationsScreen}
//         options={{
//           title: "Notifikationer",
//         }}
//       />
//     </Stack.Navigator>
//   )
// }

// export default function AppNavigator() {
//   return (
//     <NavigationContainer theme={transparentTheme}>
//       <Drawer.Navigator 
//         screenOptions={{ 
//           headerShown: false, 
//         }}
//       >
//         <Drawer.Screen 
//         name="Main" 
//         component={MainStackNavigator} 
//         />
//         <Drawer.Screen 
//         name="Settings" 
//         component={SettingsScreen}
//         options={{
//           title: "Indstillinger",
//         }}
//         />
//         <Drawer.Screen 
//         name="Setup Emergency" 
//         component={EmergencyScreen}
//         options={{
//           title: "Opsæt Nødstilstand",
//         }}
//         />
//       </Drawer.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   tabBarPill: {
//     width: 82,
//     height: 50,
//     borderRadius: 999,
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 3,
//   },

//   tabBarLabel: {
//     fontSize: 11,
//     fontWeight: "400",
//   },
//   tabBarLabelActive: {
//     color: COLORS.primus,
//     fontWeight: "800",
//   },
// });