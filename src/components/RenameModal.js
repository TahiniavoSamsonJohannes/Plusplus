import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScaleButton from "./ScaleButton";

export default function RenameModal({
  visible,
  currentName,
  onClose,
  onRename,
  Colors,
}) {
  const [name, setName] = useState("");

  // États internes pour gérer l'animation
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const keyboardAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const translateY = Animated.add(
    slideAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [500, 0],
    }),
    keyboardAnim,
  );

  useEffect(() => {

    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardAnim, {
        toValue: -e.endCoordinates.height - 20,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(keyboardAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      // Mettre à jour le nom quand le modal s'ouvre
      setName(currentName || "");
      // Le modal doit être rendu
      setShouldRender(true);
      // Un léger délai pour s'assurer que le composant est monté
      setTimeout(() => {
        setIsVisible(true);
        // Animer l'entrée
        slideAnim.setValue(0);
        fadeAnim.setValue(0);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(() => inputRef.current?.focus(), 100);
        });
      }, 10);
    } else {
      if (isVisible) {
        // Animer la sortie
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Une fois l'animation terminée, on cache le modal
          setIsVisible(false);
          // On démonte complètement après un court délai
          setTimeout(() => {
            setShouldRender(false);
          }, 50);
        });
      }
    }
  }, [visible, currentName]);

  const handleRename = () => {
    if (!name.trim()) return;
    Keyboard.dismiss();
    onRename(name.trim());
    onClose();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  // Ne rien rendre si le modal ne doit pas être affiché
  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        st(Colors).overlay,
        {
          opacity: fadeAnim,
          pointerEvents: isVisible ? "auto" : "none",
        },
      ]}
    >
      <Animated.View
        style={[
          st(Colors).sheetContainer,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={st(Colors).sheet}>
            <View style={st(Colors).handle} />

            <View style={st(Colors).headerRow}>
              <Text style={st(Colors).title}>Renommer la liste</Text>
              <ScaleButton onPress={handleClose} scale={0.88}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </ScaleButton>
            </View>

            <Text style={st(Colors).label}>Nom de la liste</Text>
            <TextInput
              ref={inputRef}
              style={st(Colors).input}
              placeholder="Donnez un nom à la liste"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <View style={st(Colors).actions}>
              <ScaleButton style={st(Colors).btnCancel} onPress={handleClose}>
                <Text style={st(Colors).btnCancelText}>Annuler</Text>
              </ScaleButton>

              <ScaleButton
                style={[
                  st(Colors).btnRename,
                  !name.trim() && st(Colors).btnDisabled,
                ]}
                onPress={handleRename}
                scale={0.96}
              >
                <Text style={st(Colors).btnRenameText}>Renommer</Text>
              </ScaleButton>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </Animated.View>
  );
}

const st = (Colors) =>
  StyleSheet.create({
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheetContainer: {
      backgroundColor: Colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },
    sheet: {
      padding: 20,
      paddingBottom: 40,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: Colors.border,
      alignSelf: "center",
      marginBottom: 16,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    title: { fontSize: 18, fontWeight: "700", color: Colors.text },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: Colors.text,
      backgroundColor: Colors.surfaceSecondary,
      marginBottom: 20,
    },
    actions: { flexDirection: "row", gap: 12 },
    btnCancel: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: Colors.surfaceSecondary,
      alignItems: "center",
    },
    btnCancelText: {
      color: Colors.textSecondary,
      fontWeight: "600",
      fontSize: 15,
    },
    btnRename: {
      padding: 14,
      borderRadius: 12,
      backgroundColor: Colors.primary,
      textAlign: "center",
    },
    btnDisabled: { opacity: 0.4 },
    btnRenameText: {
      color: Colors.textInverse,
      fontWeight: "700",
      fontSize: 15,
    },
  });
