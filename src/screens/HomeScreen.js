import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useApp } from "../context/AppContext";
import SwipeableArticleRow from "../components/SwipeableArticleRow";
import AddArticleModal from "../components/AddArticleModal";
import ContextMenu from "../components/ContextMenu";
import RenameModal from "../components/RenameModal";
import DeleteModal from "../components/DeleteModal";
import DeleteItemModal from "../components/DeleteItemModal";
import { exportToPDF } from "../utils/pdfExport";
import ScaleButton from "../components/ScaleButton";
import EditItemModal from "../components/EditItemModal";
import EditArticleModal from "../components/EditItemModal";

export default function HomeScreen({ navigation }) {
  const {
    originList,
    currentList,
    saveList,
    renameList,
    deleteList,
    addArticle,
    editArticle,
    removeArticle,
    updateDiscount,
    updateCurrency,
    getSubtotal,
    getTotal,
    formatAmount,
    Colors,
  } = useApp();

  const [showAdd, setShowAdd] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showCurrency, setShowCurrency] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [pendingItem, setPendingItem] = useState(null);
  const listRef = useRef(null);

  const keyboardAnim = useRef(new Animated.Value(0)).current;

  const translateY = keyboardAnim;

  const hasChanges = () => {
    return JSON.stringify(originList) !== JSON.stringify(currentList);
  }

  const handleAddArticle = (article) => {
    addArticle(article);

    // attendre le render
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      Animated.timing(keyboardAnim, {
        toValue: -e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardDidHide", (e) => {
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

  useFocusEffect(
    useCallback(() => {
      const handleBack = () => {
        // Si le modal d'ajout est visible, fermez-le d'abord
        if (showAdd) {
          setShowAdd(false);
          return true; // Évite la navigation arrière
        }
        // Si le menu contextuel est visible
        if (showMenu) {
          setShowMenu(false);
          return true;
        }
        // Si le modal de renommage est visible
        if (showRename) {
          setShowRename(false);
          return true;
        }
        // Si le modal de suppression est visible
        if (showDelete) {
          setShowDelete(false);
          return true;
        }
        if (editItem) {
          setEditItem(false);
          return true; // Évite la navigation arrière
        }
        // Si le modal de confirmation de suppression d'article est visible
        if (pendingItem) {
          setPendingItem(null);
          return true;
        }
        
        if (hasChanges()) saveList(currentList);
        navigation.goBack();
        return true;
      };

      const sub = BackHandler.addEventListener("hardwareBackPress", handleBack);
      return () => sub.remove();
    }, [currentList, showAdd, showMenu, showRename, showDelete, pendingItem]),
  );

  const handleRename = (newName) => {
    if (currentList) renameList(currentList.id, newName);
  };

  const handleDeleteList = () => {
    if (currentList) deleteList(currentList.id);
    navigation.goBack();
  };

  const handleExportPDF = async () => {
    if (!currentList) return;
    try {
      await exportToPDF(currentList, formatAmount, getSubtotal, getTotal);
    } catch {}
  };

  const handleEditRequest = (item) => setEditItem(item);
  const confirmEditItem = (item) => {
    if (item) editArticle({ id: editItem.id, ...item });
    setEditItem(null);
  };
  
  const handleDeleteRequest = (item) => setPendingItem(item);
  const confirmDeleteItem = () => {
    if (pendingItem) removeArticle(pendingItem.id);
    setPendingItem(null);
  };

  const list = currentList || {
    name: "Nouvelle liste",
    articles: [],
    discount: 0,
    currency: "Ar",
  };
  const subtotal = getSubtotal(list);
  const total = getTotal(list);
  const discountAmt = subtotal - total;
  const articlesCount = list.articles?.length || 0;

  const handleDiscountChange = (val) => {
    const parsed = parseFloat(val);
    updateDiscount(isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed)));
  };

  const incrementDiscount = () =>
    updateDiscount(Math.min(100, (list.discount || 0) + 1));
  const decrementDiscount = () =>
    updateDiscount(Math.max(0, (list.discount || 0) - 1));

  const CURRENCIES = ["Ar", "$", "€"];

  const renderTableHeader = () => (
    <View style={styles(Colors).tableHeader}>
      <Text style={[styles(Colors).headerCell, styles(Colors).colNo]}>No</Text>
      <Text style={[styles(Colors).headerCell, styles(Colors).colArticle]}>
        ARTICLE
      </Text>
      <Text style={[styles(Colors).headerCell, styles(Colors).colPU]}>PU</Text>
      <Text style={[styles(Colors).headerCell, styles(Colors).colQty]}>
        QTÉ
      </Text>
      <Text style={[styles(Colors).headerCell, styles(Colors).colTotal]}>
        TOTAL
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles(Colors).safe}>
      {/* Header */}
      <View style={styles(Colors).header}>
        <ScaleButton onPress={() => navigation.goBack()} scale={0.9}>
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </ScaleButton>
        <Text style={styles(Colors).listTitle} numberOfLines={1}>
          {list.name}
        </Text>
        <View style={styles(Colors).headerRight}>
          <View style={styles(Colors).badge}>
            <Text style={styles(Colors).badgeText}>
              {articlesCount} article{articlesCount !== 1 ? "s" : ""}
            </Text>
          </View>
          <ScaleButton onPress={() => setShowMenu(true)} scale={0.9}>
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.text} />
          </ScaleButton>
        </View>
      </View>

      {/* Sélecteur devise inline */}
      {showCurrency && (
        <View style={styles(Colors).currencyBar}>
          <Text style={styles(Colors).currencyBarLabel}>Devise :</Text>
          {CURRENCIES.map((c) => (
            <ScaleButton
              key={c}
              style={[
                styles(Colors).currencyChip,
                list.currency === c && styles(Colors).currencyChipActive,
              ]}
              onPress={() => {
                updateCurrency(c);
                setShowCurrency(false);
              }}
            >
              <Text
                style={[
                  styles(Colors).currencyChipText,
                  list.currency === c && styles(Colors).currencyChipTextActive,
                ]}
              >
                {c}
              </Text>
            </ScaleButton>
          ))}
          <ScaleButton onPress={() => setShowCurrency(false)} scale={0.9}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </ScaleButton>
        </View>
      )}

      {/* Liste articles */}
      <View style={styles(Colors).listArea}>
        {articlesCount === 0 ? (
          <View style={styles(Colors).emptyState}>
            <Ionicons name="archive-outline" size={52} color={Colors.border} />
            <Text style={styles(Colors).emptyTitle}>Aucun article ajouté</Text>
            <Text style={styles(Colors).emptySubtitle}>
              Appuyez sur le bouton + pour ajouter votre premier article
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={list.articles}
            style={{ backgroundColor: Colors.surface }}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderTableHeader}
            ListFooterComponent={<View style={{ height: 45 }} />}
            stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => (
              <SwipeableArticleRow
                item={item}
                index={index}
                formatAmount={(amount) => formatAmount(amount, list)}
                onEditRequest={handleEditRequest}
                onDeleteRequest={handleDeleteRequest}
                Colors={Colors}
              />
            )}
          />
        )}
      </View>

      {/* Résumé + remise — KeyboardAvoidingView pour que le champ remise reste visible */}
      <Animated.View
        style={{
          transform: [{ translateY }],
        }}
      >
        <View style={styles(Colors).summary}>
          <View style={styles(Colors).summaryRow}>
            <Text style={styles(Colors).summaryLabel}>Sous-total</Text>
            <Text style={styles(Colors).summaryValue}>
              {formatAmount(subtotal, list)}
            </Text>
          </View>

          {/* Remise avec boutons +/- */}
          <View style={styles(Colors).summaryRow}>
            <Text style={styles(Colors).summaryLabel}>Remise</Text>
            <View style={styles(Colors).discountRow}>
              <ScaleButton
                style={styles(Colors).discountBtn}
                onPress={decrementDiscount}
                scale={0.88}
              >
                <Ionicons name="remove" size={16} color={Colors.primary} />
              </ScaleButton>
              <View style={styles(Colors).discountInput}>
                <TextInput
                  style={styles(Colors).discountText}
                  value={String(list.discount || 0)}
                  onChangeText={handleDiscountChange}
                  keyboardType="numeric"
                  maxLength={3}
                  selectTextOnFocus
                />
                <Text style={styles(Colors).discountPct}>%</Text>
              </View>
              <ScaleButton
                style={styles(Colors).discountBtn}
                onPress={incrementDiscount}
                scale={0.88}
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
              </ScaleButton>
              <Text style={styles(Colors).summaryValue}>
                {formatAmount(discountAmt, list)}
              </Text>
            </View>
          </View>

          <View style={styles(Colors).totalBar}>
            <Text style={styles(Colors).totalLabel}>Total</Text>
            <Text style={styles(Colors).totalValue}>
              {formatAmount(total, list)}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* FAB */}
      <ScaleButton
        style={styles(Colors).fab}
        onPress={() => setShowAdd(true)}
        scale={0.92}
      >
        <Ionicons name="add" size={32} color={Colors.textInverse} />
      </ScaleButton>

      {/* Modals */}
      <AddArticleModal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={handleAddArticle}
        Colors={Colors}
        currency={list.currency}
      />
      <ContextMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onRename={() => setShowRename(true)}
        onExportPDF={handleExportPDF}
        onChangeCurrency={() => {
          setShowMenu(false);
          setShowCurrency(true);
        }}
        onDelete={() => setShowDelete(true)}
        Colors={Colors}
      />
      <RenameModal
        visible={showRename}
        currentName={list.name}
        onClose={() => setShowRename(false)}
        onRename={handleRename}
        Colors={Colors}
      />
      <DeleteModal
        visible={showDelete}
        listName={list.name}
        onClose={() => setShowDelete(false)}
        onDelete={handleDeleteList}
        Colors={Colors}
      />
      <EditItemModal
        visible={!!editItem}
        article={editItem}
        onClose={() => setEditItem(null)}
        onEdit={confirmEditItem}
        currency={list.currency}
        Colors={Colors}
      />
      <DeleteItemModal
        visible={!!pendingItem}
        itemName={pendingItem?.name}
        onClose={() => setPendingItem(null)}
        onDelete={confirmDeleteItem}
        Colors={Colors}
      />
    </SafeAreaView>
  );
}

const styles = (Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      gap: 8,
    },
    listTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: Colors.text },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    badge: {
      backgroundColor: Colors.badgeBg,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: { fontSize: 12, fontWeight: "600", color: Colors.badgeText },

    currencyBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
      gap: 8,
    },
    currencyBarLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors.textSecondary,
      marginRight: 4,
    },
    currencyChip: {
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: Colors.border,
      backgroundColor: Colors.surfaceSecondary,
    },
    currencyChipActive: {
      backgroundColor: Colors.primary,
      borderColor: Colors.primary,
    },
    currencyChipText: {
      fontSize: 14,
      fontWeight: "700",
      color: Colors.textSecondary,
    },
    currencyChipTextActive: { color: Colors.textInverse },

    listArea: { flex: 1, backgroundColor: Colors.surface },
    tableHeader: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.headerBg,
      paddingVertical: 5,
      paddingHorizontal: 12,
    },
    headerCell: {
      color: Colors.headerText,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
    },

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      marginTop: 80,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors.textSecondary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: Colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 40,
      lineHeight: 20,
    },

    summary: {
      backgroundColor: Colors.surface,
      paddingHorizontal: 16,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    summaryLabel: { fontSize: 15, fontWeight: "600", color: Colors.text },
    summaryValue: { fontSize: 15, fontWeight: "600", color: Colors.text },

    discountRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    discountBtn: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: Colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    discountInput: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.border,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: Colors.surfaceSecondary,
    },
    discountText: {
      fontSize: 14,
      color: Colors.text,
      minWidth: 28,
      textAlign: "center",
    },
    discountPct: { fontSize: 14, color: Colors.textSecondary, marginLeft: 2 },

    totalBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: Colors.primary,
      borderRadius: 14,
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginTop: 4,
      marginBottom: 0,
    },
    totalLabel: { fontSize: 17, fontWeight: "800", color: Colors.textInverse },
    totalValue: { fontSize: 17, fontWeight: "800", color: Colors.textInverse },

    fab: {
      position: "absolute",
      bottom: 130,
      alignSelf: "center",
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: Colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 10,
      elevation: 10,
    },
    colNo: { width: 35 },
    colArticle: { flex: 1 },
    colPU: { width: 60, textAlign: "right" },
    colQty: { width: 44, textAlign: "center" },
    colTotal: { width: 72, textAlign: "right" },
  });
