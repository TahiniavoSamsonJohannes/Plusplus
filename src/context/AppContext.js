import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { LightColors, DarkColors } from "../theme/colors.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  initDatabase,
  dbGetAllLists,
  dbSaveList,
  dbDeleteList,
  dbRenameList,
  dbAddArticle,
  dbRemoveArticle,
  dbEditArticle,
} from "../database/db.js";

const AppContext = createContext();

// Générateur d'ID unique
export const generateId = () =>
  Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const AppProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [originList, setOriginList] = useState(null);
  const [currentList, setCurrentList] = useState(null);
  const [themeMode, setThemeMode] = useState("system");
  const [darkMode, setDarkMode] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  const Colors = darkMode ? DarkColors : LightColors;

  // ─── Init DB ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        await loadLists();
        await loadThemePreference();
        setDbReady(true);
      } catch (e) {
        console.error("DB init error:", e);
      }
    };
    init();
  }, []);

  // ─── Chargement ─────────────────────────────────────────────────────────────
  const loadLists = async () => {
    const data = await dbGetAllLists();
    setLists(data);
  };

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem("theme_mode");
      if (saved) {
        setThemeMode(saved);
        setDarkMode(saved === "dark");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Thème ──────────────────────────────────────────────────────────────────
  const changeTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem("theme_mode", mode);
    setDarkMode(mode === "dark");
  };

  // ─── Nom unique ─────────────────────────────────────────────────────────────
  const getUniqueName = useCallback(
    (baseName, excludeId = null) => {
      const base = baseName.replace(/ \(\d+\)$/, ""); // strip "(n)" existant
      const siblings = lists.filter(
        (l) =>
          l.id !== excludeId &&
          (l.name === base ||
            l.name.match(
              new RegExp(
                `^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(\\d+\\)$`,
              ),
            )),
      );
      if (siblings.length === 0) return base;
      let n = 2;
      while (
        lists.find((l) => l.id !== excludeId && l.name === `${base} (${n})`)
      )
        n++;
      return `${base} (${n})`;
    },
    [lists],
  );

  // ─── CRUD Listes ────────────────────────────────────────────────────────────
  const createNewList = () => {
    const name = getUniqueName("Nouvelle liste");
    const now = new Date().toISOString();
    const newList = {
      id: generateId(),
      name,
      createdAt: now,
      updatedAt: now,
      discount: 0,
      currency: "Ar",
      articles: [],
    };
    setCurrentList(newList);
    return newList;
  };

  const saveList = async (list) => {
    try {
      const saved = await dbSaveList(list);
      setLists((prev) => {
        const exists = prev.find((l) => l.id === saved.id);
        if (exists)
          return prev
            .map((l) => (l.id === saved.id ? saved : l))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return [saved, ...prev];
      });
      setCurrentList(saved);
      return saved;
    } catch (e) {
      console.error("saveList error:", e);
    }
  };

  const renameList = async (id, newName) => {
    const unique = getUniqueName(newName, id);
    try {
      await dbRenameList(id, unique);
      const now = new Date().toISOString();
      setLists((prev) =>
        prev
          .map((l) =>
            l.id === id ? { ...l, name: unique, updatedAt: now } : l,
          )
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
      if (currentList?.id === id) {
        setCurrentList((c) => ({ ...c, name: unique, updatedAt: now }));
      }
    } catch (e) {
      console.error("renameList error:", e);
    }
  };

  const deleteList = async (id) => {
    try {
      await dbDeleteList(id);
      setLists((prev) => prev.filter((l) => l.id !== id));
      setCurrentList(null);
    } catch (e) {
      console.error("deleteList error:", e);
    }
  };

  // ─── CRUD Articles ───────────────────────────────────────────────────────────
  const addArticle = async (article) => {
    if (!currentList) return;
    const newArticle = { ...article, id: generateId() };
    const updated = {
      ...currentList,
      articles: [...currentList.articles, newArticle],
      updatedAt: new Date().toISOString(),
    };
    setCurrentList(updated);
    try {
      await dbSaveList(updated);
      setLists((prev) =>
        prev
          .map((l) => (l.id === updated.id ? updated : l))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
    } catch (e) {
      console.error("addArticle error:", e);
    }
  };

  const editArticle = async (article) => {
    if (!currentList) return;
    const updated = {
      ...currentList,
      articles: currentList.articles.map((a) =>
        a.id === article.id
          ? {
              ...a,
              name: article.name,
              unitPrice: article.unitPrice,
              quantity: article.quantity,
            }
          : a,
      ),
      updatedAt: new Date().toISOString(),
    };
    setCurrentList(updated);
    try {
      await dbEditArticle(currentList.id, updated);
      setLists((prev) =>
        prev
          .map((l) => (l.id === updated.id ? updated : l))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
    } catch (e) {
      console.error("editArticle error:", e);
    }
  };

  const removeArticle = async (articleId) => {
    if (!currentList) return;
    const updated = {
      ...currentList,
      articles: currentList.articles.filter((a) => a.id !== articleId),
      updatedAt: new Date().toISOString(),
    };
    setCurrentList(updated);
    try {
      await dbRemoveArticle(articleId, currentList.id);
      setLists((prev) =>
        prev
          .map((l) => (l.id === updated.id ? updated : l))
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)),
      );
    } catch (e) {
      console.error("removeArticle error:", e);
    }
  };

  // ─── Discount / Currency (local uniquement, sauvegardé au saveList) ─────────
  const updateDiscount = (discount) => {
    if (!currentList) return;
    setCurrentList((c) => ({ ...c, discount }));
  };

  const updateCurrency = (currency) => {
    if (!currentList) return;
    setCurrentList((c) => ({ ...c, currency }));
  };

  // ─── Calculs ────────────────────────────────────────────────────────────────
  const getSubtotal = (list) => {
    const l = list || currentList;
    if (!l) return 0;
    return l.articles.reduce((sum, a) => sum + a.unitPrice * a.quantity, 0);
  };

  const getTotal = (list) => {
    const l = list || currentList;
    if (!l) return 0;
    const sub = getSubtotal(l);
    return sub - (sub * (l.discount || 0)) / 100;
  };

  const formatAmount = (amount, list) => {
    const l = list || currentList;
    const cur = l?.currency || "Ar";
    const formatted = Number(amount).toLocaleString("fr-FR");
    return `${formatted} ${cur}`;
  };

  // ─── Provider ───────────────────────────────────────────────────────────────
  return (
    <AppContext.Provider
      value={{
        lists, // déjà triées par updatedAt DESC depuis la DB
        originList,
        setOriginList,
        currentList,
        setCurrentList,
        darkMode,
        themeMode,
        changeTheme,
        Colors,
        dbReady,
        createNewList,
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
