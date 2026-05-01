import React, { useRef } from "react";
import { View, Text, StyleSheet, Animated, PanResponder } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScaleButton from "./ScaleButton";

const SWIPE_THRESHOLD = 55;
const DELETE_WIDTH = 70;

export default function SwipeableArticleRow({
  item,
  index,
  formatAmount,
  onEditRequest,
  onDeleteRequest,
  Colors,
}) {
  const translateX = useRef(new Animated.Value(0)).current;

  const close = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const openRight = () => {
    Animated.spring(translateX, {
      toValue: -DELETE_WIDTH,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const openLeft = () => {
    Animated.spring(translateX, {
      toValue: DELETE_WIDTH,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dy) < 12,

      onPanResponderMove: (_, g) => {
        const x = Math.max(-DELETE_WIDTH, Math.min(DELETE_WIDTH, g.dx));
        translateX.setValue(x);
      },

      onPanResponderRelease: (_, g) => {
        if (g.dx < -SWIPE_THRESHOLD)
          openRight(); // swipe gauche → bouton à droite
        else if (g.dx > SWIPE_THRESHOLD)
          openLeft(); // swipe droite → bouton à gauche
        else close();
      },
    }),
  ).current;

  const handleEdit = () => {
    close();
    onEditRequest(item);
  };

  const handleDelete = () => {
    close();
    onDeleteRequest(item);
  };

  const rowBg = index % 2 === 0 ? Colors.surface : Colors.surfaceSecondary;

  return (
    <View style={[st.container]}>
      {/* Bouton DELETE à GAUCHE (swipe vers la droite) */}
      <View style={[st.actionArea, st.actionLeft, { backgroundColor: Colors.edit }]}>
        <ScaleButton onPress={handleEdit} scale={0.88}>
          <View style={st.deleteCircle}>
            <Ionicons name="pencil" size={20} color="#fff" />
          </View> 
        </ScaleButton>
      </View>

      {/* Bouton DELETE à DROITE (swipe vers la gauche) */}
      <View style={[st.actionArea, st.actionRight, { backgroundColor: Colors.danger }]}>
        <ScaleButton onPress={handleDelete} scale={0.88}>
          <View style={st.deleteCircle}>
            <Ionicons name="trash" size={20} color="#fff" />
          </View>
        </ScaleButton>
      </View>

      {/* Ligne glissable */}
      <Animated.View
        style={[
          st.row,
          { backgroundColor: rowBg, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers} // Active la détection de swipe
      >
        <View style={st.colNo}>
          <View style={[st.badge, { backgroundColor: Colors.primaryLight }]}>
            <Text style={[st.badgeText, { color: Colors.primary }]}>
              {index + 1}
            </Text>
          </View>
        </View>
        <Text style={[st.colArticle, { color: Colors.text }]}>
          {item.name}
        </Text>
        <Text style={[st.colPU, { color: Colors.textSecondary }]}>
          {formatAmount(item.unitPrice)}
        </Text>
        <Text style={[st.colQty, { color: Colors.text }]}>{item.quantity}</Text>
        <Text style={[st.colTotal, { color: Colors.text }]}>
          {formatAmount(item.unitPrice * item.quantity)}
        </Text>
      </Animated.View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { overflow: "hidden" },
  actionArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: DELETE_WIDTH,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLeft: { left: 0 },
  actionRight: { right: 0 },
  deleteCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  colNo: { width: 35 },
  colArticle: { flex: 1, fontSize: 13, fontWeight: "500" },
  colPU: { width: 60, fontSize: 13, textAlign: "right" },
  colQty: { width: 44, fontSize: 13, textAlign: "center" },
  colTotal: { width: 72, fontSize: 13, fontWeight: "700", textAlign: "right" },
});
