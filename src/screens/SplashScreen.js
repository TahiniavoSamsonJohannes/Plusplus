import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Image } from "react-native";
import { Colors } from "../theme/colors";

export default function SplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1400),
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish?.());
  }, []);

  return (
    <Animated.View style={[st.container, { opacity: fadeOutAnim }]}>
      <Animated.View
        style={[
          st.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/logo.png")}
          style={st.logo}
          resizeMode="contain"
        />
        <Text style={st.appName}>Plusplus</Text>
        <Text style={st.tagline}>Gérez vos dépenses simplement</Text>
      </Animated.View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
  },
  content: { alignItems: "center", gap: 16 },
  logo: {
    width: 110,
    height: 110,
    borderRadius: 24,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -1,
    marginTop: 8,
  },
  tagline: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "400",
  },
});
