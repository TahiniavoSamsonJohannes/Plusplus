import React, { useRef, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScaleButton from "./ScaleButton";

export default function ContextMenu({
  visible,
  onClose,
  onRename,
  onExportPDF,
  onChangeCurrency,
  onDelete,
  Colors,
}) {
  // État interne pour gérer l'affichage pendant l'animation
  const [isVisible, setIsVisible] = useState(false);
  // État pour savoir si le modal doit être complètement démonté
  const [shouldRender, setShouldRender] = useState(false);

  const slideY = useRef(new Animated.Value(-20)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Le modal doit être rendu
      setShouldRender(true);
      // Un léger délai pour s'assurer que le composant est monté
      setTimeout(() => {
        setIsVisible(true);
        // Animer l'entrée
        Animated.parallel([
          Animated.spring(slideY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
            speed: 20,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }, 10);
    } else {
      if (isVisible) {
        // Animer la sortie
        Animated.parallel([
          Animated.spring(slideY, {
            toValue: -20,
            useNativeDriver: true,
            bounciness: 6,
            speed: 20,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
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

  const items = [
    {
      icon: "pencil-outline",
      label: "Renommer",
      action: onRename,
      danger: false,
    },
    {
      icon: "document-outline",
      label: "Exporter PDF",
      action: onExportPDF,
      danger: false,
    },
    {
      icon: "cash-outline",
      label: "Changer la devise",
      action: onChangeCurrency,
      danger: false,
    },
    {
      icon: "trash-outline",
      label: "Supprimer la liste",
      action: onDelete,
      danger: true,
    },
  ];

  // Ne rien rendre si le modal ne doit pas être affiché
  if (!shouldRender) return null;

  return (
    <View
      style={[
        {
          position: "absolute",
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
        },
      ]}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={st(Colors).overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                st(Colors).menu,
                { transform: [{ translateY: slideY }], opacity },
              ]}
            >
              {items.map((item, i) => (
                <ScaleButton
                  key={i}
                  style={[
                    st(Colors).item,
                    i < items.length - 1 && st(Colors).itemBorder,
                  ]}
                  onPress={() => {
                    item.action?.();
                    onClose();
                  }}
                  scale={0.97}
                >
                  <Ionicons
                    name={item.icon}
                    size={18}
                    color={item.danger ? Colors.danger : Colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={[
                      st(Colors).label,
                      item.danger && { color: Colors.danger },
                    ]}
                  >
                    {item.label}
                  </Text>
                </ScaleButton>
              ))}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

// overlay sans couleur de fond
const st = (Colors) =>
  StyleSheet.create({
    overlay: { flex: 1 },
    menu: {
      position: "absolute",
      right: 14,
      top: 75,
      backgroundColor: Colors.surface,
      borderRadius: 16,
      paddingVertical: 6,
      minWidth: 215,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 12,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13,
      paddingHorizontal: 16,
    },
    itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
    label: { fontSize: 15, color: Colors.text },
  });
