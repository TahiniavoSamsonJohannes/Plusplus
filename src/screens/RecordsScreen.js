import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import ScaleButton from "../components/ScaleButton";

export default function RecordsScreen({ navigation }) {
  const {
    lists,
    setOriginList,
    setCurrentList,
    getTotal,
    formatAmount,
    Colors,
    createNewList,
  } = useApp();
  const [search, setSearch] = useState("");

  const filtered = lists.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (iso) => {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) +
      ", " +
      d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
    );
  };

  const handleNewList = () => {
    const newList = createNewList();
    setOriginList(newList);
    navigation.navigate("Home");
  };

  const handleOpenList = (item) => {
    setCurrentList(item);
    setOriginList(JSON.parse(JSON.stringify(item)));
    navigation.navigate("Home");
  };

  const renderItem = ({ item }) => (
    <ScaleButton style={st(Colors).card} onPress={() => handleOpenList(item)}>
      <View style={st(Colors).iconWrap}>
        <Ionicons
          name="document-text"
          size={22}
          color={Colors.primary}
        />
      </View>
      <View style={st(Colors).cardContent}>
        <Text style={st(Colors).cardTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={st(Colors).cardMeta}>{formatDate(item.createdAt)}</Text>
        <Text style={st(Colors).cardArticles}>
          {item.articles.length} article{item.articles.length !== 1 ? "s" : ""}
        </Text>
      </View>
      <View style={st(Colors).cardRight}>
        <View style={st(Colors).totalBadge}>
          <Text style={st(Colors).totalBadgeText}>
            {formatAmount(getTotal(item), item)}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={Colors.textMuted}
        />
      </View>
    </ScaleButton>
  );

  // État vide : pas de liste du tout VS pas de résultat de recherche
  const renderEmpty = () => {
    const isSearching = search.trim().length > 0;
    return (
      <View style={st(Colors).empty}>
        <Ionicons
          name={isSearching ? "search-outline" : "archive-outline"}
          size={52}
          color={Colors.border}
        />
        <Text style={st(Colors).emptyTitle}>
          {isSearching ? "Aucune liste trouvée" : "Aucune liste"}
        </Text>
        <Text style={st(Colors).emptySubtitle}>
          {isSearching
            ? `Aucun résultat pour "${search}"`
            : "Appuyez sur + pour créer votre première liste"}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={st(Colors).safe}>
      <StatusBar
        barStyle={Colors.text === "#0F172A" ? "dark-content" : "light-content"}
        backgroundColor={Colors.surface}
      />

      {/* Header */}
      <View style={st(Colors).header}>
        <Text style={st(Colors).appName}>Plusplus</Text>
        <ScaleButton onPress={() => navigation.navigate("Settings")}>
          <Ionicons
            name="settings-outline"
            size={26}
            color={Colors.textSecondary}
          />
        </ScaleButton>
      </View>

      {/* Search */}
      <View style={st(Colors).searchWrap}>
        <Ionicons
          name="search-outline"
          size={16}
          color={Colors.textMuted}
          style={st(Colors).searchIcon}
        />
        <TextInput
          style={st(Colors).searchInput}
          placeholder="Rechercher une liste..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <ScaleButton onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </ScaleButton>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={st(Colors).list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />

      {/* FAB */}
      <ScaleButton style={st(Colors).fab} onPress={handleNewList} scale={0.92}>
        <Ionicons name="add" size={32} color={Colors.textInverse} />
      </ScaleButton>
    </SafeAreaView>
  );
}

const st = (Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: Colors.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: Colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    appName: {
      fontSize: 22,
      fontWeight: "900",
      color: Colors.primary,
      letterSpacing: -0.5,
    },
    searchWrap: {
      flexDirection: "row",
      alignItems: "center",
      margin: 12,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: Colors.border,
      paddingHorizontal: 12,
    },
    searchIcon: { marginRight: 8 },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: Colors.text,
    },
    list: { padding: 12, gap: 10, paddingBottom: 110 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: Colors.surface,
      borderRadius: 14,
      padding: 14,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
      borderWidth: 1,
      borderColor: Colors.borderLight,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: Colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    cardContent: { flex: 1 },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: Colors.text,
      marginBottom: 2,
    },
    cardMeta: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
    cardArticles: { fontSize: 12, color: Colors.textSecondary },
    cardRight: { alignItems: "flex-end", gap: 6 },
    totalBadge: {
      backgroundColor: Colors.primaryLight,
      borderRadius: 20,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    totalBadgeText: { fontSize: 13, fontWeight: "700", color: Colors.primary },
    empty: { alignItems: "center", marginTop: 80, gap: 10 },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: Colors.textSecondary,
    },
    emptySubtitle: {
      fontSize: 13,
      color: Colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 40,
      lineHeight: 20,
    },
    fab: {
      position: "absolute",
      bottom: 28,
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
  });
