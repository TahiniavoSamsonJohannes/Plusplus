import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScaleButton from "./ScaleButton";

export default function DeleteItemModal({
  visible,
  itemName,
  onClose,
  onDelete,
  Colors,
}) {
  // États internes pour gérer l'animation
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
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
        ]).start();
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
  }, [visible]);

  const handleDelete = () => {
    Keyboard.dismiss();
    onDelete();
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
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [500, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={st(Colors).sheet}>
            <View style={st(Colors).handle} />

            <View style={st(Colors).headerRow}>
              <Text style={st(Colors).title}>Supprimer l'article</Text>
              <ScaleButton onPress={handleClose} scale={0.88}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </ScaleButton>
            </View>

            <Text style={st(Colors).label}>
              Voulez-vous supprimer cet article ?
            </Text>

            <View style={st(Colors).nameBox}>
              <Text style={st(Colors).nameText}>{itemName}</Text>
            </View>

            <View style={st(Colors).actions}>
              <ScaleButton style={st(Colors).btnCancel} onPress={handleClose}>
                <Text style={st(Colors).btnCancelText}>Annuler</Text>
              </ScaleButton>

              <ScaleButton
                style={st(Colors).btnDelete}
                onPress={handleDelete}
                scale={0.96}
              >
                <Text style={st(Colors).btnDeleteText}>Supprimer</Text>
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
      fontSize: 15,
      color: Colors.textSecondary,
      marginBottom: 12,
      textAlign: "center",
    },
    nameBox: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 12,
      backgroundColor: Colors.dangerLight,
      marginBottom: 20,
      alignItems: "center",
    },
    nameText: {
      fontSize: 15,
      color: Colors.danger,
      fontWeight: "600",
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    btnCancel: {
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
    btnDelete: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: Colors.danger,
      alignItems: "center",
    },
    btnDeleteText: {
      color: Colors.textInverse,
      fontWeight: "700",
      fontSize: 15,
    },
  });
