import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {LinearGradient} from 'expo-linear-gradient';
import COLORS from '../constants/colors';


type HeaderProps = {
    title?: string;
    bleStatus?: string | null;
    deviceName?: string | null;
    showBackButton?: boolean;
    onBackPress?: () => void;
    scrollY: Animated.Value;
};

export default function Header({
    title = "EEGo",
    bleStatus,
    showBackButton = false,
    onBackPress,
    scrollY,
}: HeaderProps){
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();

    const headerHeight = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [80 + insets.top, 64 + insets.top],
        extrapolate: "clamp",
    });

    const titleSize = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [34, 28],
        extrapolate: "clamp",
    });

    const iconScale = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [1, 0.9],
        extrapolate: "clamp",
    });

    const bleStatusOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });
    const bleTranslateY = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [0, -6],
        extrapolate: "clamp",
    });

    const iconOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    const headerBackgroundOpacity = scrollY.interpolate({
        inputRange: [0,80],
        outputRange: [
            COLORS.diaphanus,
            COLORS.diaphanus2,
        ],
        extrapolate: "clamp",
    });

    const titleMarginBottom = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [6, 0],
        extrapolate: "clamp",
    });

    const pilleScale = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [1, 0.85],
        extrapolate: "clamp",
    });

    const headerPaddingBottom = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [8, 2],
        extrapolate: "clamp",
    });

    const gradientOpacity = scrollY.interpolate({
        inputRange: [0, 80],
        outputRange: [0.6, 1],
        extrapolate: "clamp",
      });

    return (
        <Animated.View
            style={[styles.header, {
                    height: headerHeight,
                    paddingTop: insets.top,
                    //backgroundColor: headerBackgroundOpacity,
                    //marginBottom: titleMarginBottom,
                    paddingBottom: headerPaddingBottom,

                    },
                    ]}
                >
                    
                    <View style={styles.content}>
                    <View style={styles.left}>
          {showBackButton && (
            <Pressable onPress={onBackPress} style={styles.backButton}>
              <Text style={styles.icon}>←</Text>
            </Pressable>
          )}

          <View>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Animated.Text style={[styles.title, { fontSize: titleSize }]}>
              {title}
            </Animated.Text>
            </TouchableOpacity>

            {!!bleStatus && (
              <Animated.Text
                style={[
                  styles.bleStatus,
                  {
                    opacity: bleStatusOpacity,
                    transform: [{ translateY: bleTranslateY }],
                  },
                ]}
              >
                {bleStatus}
              </Animated.Text>
            )}
          </View>
        </View>

        <View style={styles.right}>
            <Animated.View style={[styles.pille, {
                transform: [{ scale: pilleScale }],
            },
            ]}
            >
          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Pressable 
              style={styles.iconButton}
              onPress={() => navigation.navigate("Notifications")}
            >
              <Text style={styles.icon}>🔔</Text>
            </Pressable>
          </Animated.View>
          <View style={styles.separator}/>

          <Animated.View style={{ transform: [{ scale: iconScale }] }}>
            <Pressable 
              style={styles.avatarButton}
              onPress={() => navigation.navigate("Profile")}
            >
              <Text style={styles.avatarText}>👤</Text>
            </Pressable>
          </Animated.View>
          </Animated.View>
        </View>
      </View>
                        </Animated.View>
                        );
                    }

                    const styles = StyleSheet.create({
                        header: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          zIndex: 10,
                          backgroundColor: COLORS.diaphanus,
                        },
                        content: {
                          flex: 1,
                          paddingHorizontal: 24,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        },
                        left: {
                          flexDirection: "row",
                          alignItems: "center",
                          flex: 1,
                        },
                        backButton: {
                          marginRight: 12,
                        },
                        title: {
                          fontWeight: "800",
                          color: "#111",
                        },
                        bleStatus: {
                          marginTop: 2,
                          fontSize: 14,
                          fontWeight: "500",
                          color: COLORS.primus,
                        },
                        right: {
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          //marginBottom: 8,
                        },
                        pille: {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          
                            paddingHorizontal: 8,
                            paddingVertical: 6,
                          
                            borderRadius: 999,
                            backgroundColor: COLORS.lightGray,
                          
                            shadowColor: "#000",
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            shadowOffset: { width: 0, height: 4 },
                          
                            elevation: 3,
                          },
                        iconButton: {
                          width: 36,
                          height: 36,
                          alignItems: "center",
                          //backgroundColor: "rgba(0,0,0,0.01)",
                          justifyContent: "center",
                          //marginBottom: 10,
                        },
                        separator: {
                          width: 1,
                          height: 20,
                          backgroundColor: COLORS.diaphanus2,
                        },
                        avatarButton: {
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          //backgroundColor: "rgba(0,0,0,0.02)",
                          alignItems: "center",
                          justifyContent: "center",
                        },
                        icon: {
                          fontSize: 22,
                        },
                        avatarText: {
                          fontSize: 18,
                        },
                      });