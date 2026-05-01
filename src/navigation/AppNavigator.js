// src/navigation/AppNavigator.js
import React, { useCallback, useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useApp } from "../context/AppContext";
import RecordsScreen from "../screens/RecordsScreen";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { useFirstLaunch } from "../hooks/useFirstLaunch";
import * as ExpoSplashScreen from "expo-splash-screen";
import SplashScreen from "../screens/SplashScreen";

// Empêche le splash natif de disparaître automatiquement
ExpoSplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { dbReady, Colors } = useApp();
  const isFirstLaunch = useFirstLaunch();
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  // Quand la DB et le check first-launch sont prêts → cacher le splash natif
  const onLayoutReady = useCallback(async () => {
    if (dbReady && isFirstLaunch !== null) {
      await ExpoSplashScreen.hideAsync();
      // Si ce n'est pas le premier lancement, on saute le splash custom
      if (!isFirstLaunch) {
        setShowCustomSplash(false);
      }
    }
  }, [dbReady, isFirstLaunch]);

  useEffect(() => {
    onLayoutReady();
  }, [onLayoutReady]);

  // Chargement DB ou check first launch encore en cours
  if (!dbReady || isFirstLaunch === null) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: Colors.background }}>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyleInterpolator: ({ current, layouts }) => ({
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              }),
            }}
          >
            <Stack.Screen name="Records" component={RecordsScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </View>
      </NavigationContainer>

      {/* Splash custom par-dessus, seulement au premier lancement */}
      {showCustomSplash && isFirstLaunch && (
        <SplashScreen onFinish={() => setShowCustomSplash(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
