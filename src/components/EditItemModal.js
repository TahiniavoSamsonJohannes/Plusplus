import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScaleButton from "./ScaleButton";

const BILLS = {
  Ar: [100, 200, 500, 1000, 2000, 5000, 10000, 20000],
  "€": [5, 10, 20, 50, 100, 200],
  $: [1, 2, 5, 10, 20, 50, 100],
};

export default function EditItemModal({
  visible,
  article,
  onClose,
  currency = 'Ar',
  onEdit,
  Colors,
}) {
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // État interne pour gérer l'affichage pendant l'animation
  const [isVisible, setIsVisible] = useState(false);
  // État pour savoir si le modal doit être complètement démonté
  const [shouldRender, setShouldRender] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const nameInputRef = useRef(null);
  const priceInputRef = useRef(null);
  const qtyInputRef = useRef(null);

  const scrollToInput = (ref) => {
    setTimeout(() => {
      ref.current?.measureLayout(scrollRef.current, (x, y) => {
        scrollRef.current.scrollTo({
          y: y - 20,
          animated: true,
        });
      });
    }, 100);
  };

  useEffect(() => {

    const hide = Keyboard.addListener("keyboardDidHide", () => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    });

    return () => {
      hide.remove();
    };
  }, []);

  const bills = BILLS[currency] || BILLS["Ar"];

  useEffect(() => {
    if (visible) {
      setName(article.name || "Nom de la liste");
      setUnitPrice(article.unitPrice || 0);
      setQuantity(article.quantity || 1);

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
          setTimeout(() => nameInputRef.current?.focus(), 100);
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
  }, [visible]);

  const handleEdit = () => {
    if (!name.trim()) return;
    onEdit({
      name: name.trim(),
      unitPrice: parseFloat(unitPrice) || 0,
      quantity: parseInt(quantity) || 1,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setUnitPrice(0);
    setQuantity(1);
  };

  const handleClose = () => {
    Keyboard.dismiss();
    resetForm();
    onClose();
  };

  const addBill = (val) =>
    setUnitPrice((prev) => (parseFloat(prev) || 0) + val);
  const resetPrice = () => setUnitPrice(0);

  // Boutons quantité
  const incrementQty = () => setQuantity((prev) => (parseInt(prev) || 0) + 1);
  const decrementQty = () =>
    setQuantity((prev) => Math.max(1, (parseInt(prev) || 1) - 1));
  const handleQtyChange = (val) => {
    const parsed = parseInt(val);
    setQuantity(isNaN(parsed) ? 1 : Math.max(1, parsed));
  };

  // Ne rien rendre si le modal ne doit pas être affiché
  if (!shouldRender) return null;

  return (
    <Animated.View
      style={[
        st(Colors).overlay,
        {
          opacity: fadeAnim,
          // Si le modal n'est pas visible (en animation de sortie),
          // on désactive les interactions
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
              <Text style={st(Colors).title}>Modifier un article</Text>
              <ScaleButton onPress={handleClose} scale={0.88}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </ScaleButton>
            </View>

            <ScrollView
              ref={scrollRef}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={st(Colors).scrollContent}
            >
              {/* Nom */}
              <Text style={st(Colors).label}>Nom de l'article</Text>
              <TextInput
                ref={nameInputRef}
                onFocus={() => scrollToInput(nameInputRef)}
                style={st(Colors).input}
                placeholder="Entrez le nom de l'article"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />

              {/* Prix unitaire */}
              <Text style={st(Colors).label}>Prix unitaire ({currency})</Text>
              <View style={st(Colors).priceRow}>
                <TextInput
                  ref={priceInputRef}
                  onFocus={() => scrollToInput(priceInputRef)}
                  style={[st(Colors).input, { flex: 1 }]}
                  keyboardType="decimal-pad"
                  value={String(unitPrice)}
                  onChangeText={(v) => setUnitPrice(v)}
                />
                <ScaleButton
                  style={st(Colors).resetBtn}
                  onPress={resetPrice}
                  scale={0.9}
                >
                  <Ionicons name="refresh" size={16} color={Colors.danger} />
                  <Text style={st(Colors).resetText}>Reset</Text>
                </ScaleButton>
              </View>

              {/* Billets */}
              <View style={st(Colors).billsWrap}>
                {bills.map((b) => (
                  <ScaleButton
                    key={b}
                    style={st(Colors).billBtn}
                    onPress={() => addBill(b)}
                    scale={0.9}
                  >
                    <Text style={st(Colors).billText}>+{b}</Text>
                  </ScaleButton>
                ))}
              </View>

              {/* Quantité avec boutons +/- */}
              <Text style={st(Colors).label}>Quantité</Text>
              <View style={st(Colors).qtyRow}>
                <ScaleButton
                  style={st(Colors).qtyBtn}
                  onPress={decrementQty}
                  scale={0.88}
                >
                  <Ionicons name="remove" size={18} color={Colors.primary} />
                </ScaleButton>
                <TextInput
                  ref={qtyInputRef}
                  onFocus={() => scrollToInput(qtyInputRef)}
                  style={st(Colors).qtyInput}
                  keyboardType="numeric"
                  value={String(quantity)}
                  onChangeText={handleQtyChange}
                  textAlign="center"
                  selectTextOnFocus
                />
                <ScaleButton
                  style={st(Colors).qtyBtn}
                  onPress={incrementQty}
                  scale={0.88}
                >
                  <Ionicons name="add" size={18} color={Colors.primary} />
                </ScaleButton>
              </View>

              {/* Actions */}
              <View style={st(Colors).actions}>
                <ScaleButton style={st(Colors).btnCancel} onPress={handleClose}>
                  <Text style={st(Colors).btnCancelText}>Annuler</Text>
                </ScaleButton>
                <ScaleButton
                  style={[
                    st(Colors).btnAdd,
                    !name.trim() && st(Colors).btnDisabled,
                  ]}
                  onPress={handleEdit}
                  scale={0.96}
                >
                  <Text style={st(Colors).btnAddText}>Modifier</Text>
                </ScaleButton>
              </View>
            </ScrollView>
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
      maxHeight: "94%",
    },
    sheet: {
      padding: 20,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 280,
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
      marginBottom: 16,
    },
    title: { fontSize: 18, fontWeight: "700", color: Colors.text },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors.textSecondary,
      marginBottom: 6,
      marginTop: 14,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: Colors.text,
      backgroundColor: Colors.surfaceSecondary,
    },
    priceRow: { flexDirection: "row", gap: 8, alignItems: "center" },
    resetBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: Colors.danger,
      backgroundColor: Colors.dangerLight,
    },
    resetText: { fontSize: 13, fontWeight: "600", color: Colors.danger },
    billsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 10,
    },
    billBtn: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor: Colors.primaryLight,
      minWidth: 56,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 2,
      elevation: 4,
      borderBottomWidth: 3,
      borderBottomColor: Colors.primaryLight,
    },
    billText: {
      fontSize: 13,
      fontWeight: "800",
      color: Colors.primary,
    },

    // Quantité
    qtyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    qtyBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    qtyInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 10,
      paddingVertical: 10,
      fontSize: 16,
      fontWeight: "700",
      color: Colors.text,
      backgroundColor: Colors.surfaceSecondary,
      textAlign: "center",
    },

    actions: {
      flexDirection: "row",
      marginTop: 24,
      gap: 12,
      marginBottom: 20,
    },
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
    btnAdd: {
      flex: 1,
      padding: 14,
      borderRadius: 12,
      backgroundColor: Colors.primary,
      alignItems: "center",
    },
    btnDisabled: { opacity: 0.4 },
    btnAddText: {
      color: Colors.textInverse,
      fontWeight: "700",
      fontSize: 15,
    },
  });
