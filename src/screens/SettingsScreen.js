import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Linking,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import ScaleButton from "../components/ScaleButton";

export default function SettingsScreen({ navigation }) {
  const { themeMode, changeTheme, darkMode, Colors } = useApp();

  const currentYear = new Date().getFullYear();

  const handleSwitchChange = (value) => {
    changeTheme(value ? "dark" : "light");
  };

  const isSwitchOn = () => {
    if (themeMode === "system") {
      return darkMode; // Si mode système, suivre le thème actuel
    }
    return themeMode === "dark";
  };

  return (
    <SafeAreaView style={st(Colors).safe}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={Colors.surface}
      />
      <View style={st(Colors).header}>
        <ScaleButton onPress={() => navigation.goBack()} scale={0.9}>
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </ScaleButton>
        <Text style={st(Colors).title}>Paramètres</Text>
      </View>

      <ScrollView contentContainerStyle={st(Colors).content}>
        {/* Apparence */}
        <Text style={st(Colors).sectionLabel}>Apparence</Text>
        <View style={st(Colors).card}>
          <View style={st(Colors).switchRow}>
            <Ionicons
              name="moon-outline"
              size={18}
              color={Colors.textSecondary}
              style={{ marginRight: 10 }}
            />
            <Text style={st(Colors).switchLabel}>Mode sombre</Text>
            <Switch
              value={isSwitchOn()}
              onValueChange={handleSwitchChange}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
            />
          </View>
        </View>

        {/* Développeur */}
        <Text style={st(Colors).sectionLabel}>À propos du développeur</Text>
        <View style={st(Colors).card}>
          <Text style={st(Colors).devName}>Samson Johannès TAHINIAVO</Text>
          <ScaleButton
            style={st(Colors).devRow}
            onPress={() =>
              Linking.openURL("mailto:samsonjohannestahiniavo777@gmail.com")
            }
          >
            <Ionicons
              name="mail-outline"
              size={16}
              color={Colors.textSecondary}
              style={st(Colors).devIcon}
            />
            <Text style={st(Colors).devLink}>
              samsonjohannestahiniavo777@gmail.com
            </Text>
          </ScaleButton>
          <ScaleButton
            style={st(Colors).devRow}
            onPress={() => Linking.openURL("tel:+261348870322")}
          >
            <Ionicons
              name="call-outline"
              size={16}
              color={Colors.textSecondary}
              style={st(Colors).devIcon}
            />
            <Text style={st(Colors).devLink}>+261 34 88 703 22</Text>
          </ScaleButton>
          <ScaleButton
            style={st(Colors).devRow}
            onPress={() => Linking.openURL("https://samson-tsj.netlify.app")}
          >
            <Ionicons
              name="link-outline"
              size={16}
              color={Colors.textSecondary}
              style={st(Colors).devIcon}
            />
            <Text style={st(Colors).devLink}>SamsonJohannèsTahiniavo</Text>
          </ScaleButton>
        </View>

        {/* App info */}
        <View style={st(Colors).appInfo}>
          <Image
            source={require("../../assets/logo.png")}
            style={st(Colors).logo}
            resizeMode="contain"
          />
          <Text style={st(Colors).appName}>Plusplus Version 1.0.0</Text>
          <Text style={st(Colors).copyright}>
            &copy; {currentYear} Samson Johannès TAHINIAVO
          </Text>
          <Text style={st(Colors).copyright}>Tous droits réservés</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = (Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 14,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      gap: 8,
    },
    title: { fontSize: 20, fontWeight: "800", color: Colors.text },
    content: { padding: 16, gap: 8 },
    logo: {
      width: 70,
      height: 70,
      borderRadius: 15,
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: Colors.textMuted,
      letterSpacing: 0.8,
      marginTop: 14,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    card: {
      backgroundColor: Colors.surface,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
    },
    switchLabel: { flex: 1, fontSize: 15, color: Colors.text },
    devName: {
      fontSize: 15,
      fontWeight: "800",
      color: Colors.text,
      marginBottom: 12,
      marginTop: 8,
    },
    devRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    devIcon: { marginRight: 10 },
    devLink: { fontSize: 13, color: Colors.primary },
    devText: { fontSize: 13, color: Colors.textSecondary },
    appInfo: { alignItems: "center", marginTop: 32, gap: 6 },
    appIcon: {
      width: 68,
      height: 68,
      borderRadius: 18,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    appName: { fontSize: 14, fontWeight: "700", color: Colors.textSecondary },
    copyright: { fontSize: 12, color: Colors.textMuted },
  });
