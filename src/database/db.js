import * as SQLite from "expo-sqlite";

let db = null;

export const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("plusplus.db");
  }
  return db;
};

// ─── Initialisation des tables ───────────────────────────────────────────────
export const initDatabase = async () => {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS lists (
      id        TEXT PRIMARY KEY,
      name      TEXT NOT NULL,
      discount  REAL DEFAULT 0,
      currency  TEXT DEFAULT 'Ar',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id        TEXT PRIMARY KEY,
      listId    TEXT NOT NULL,
      name      TEXT NOT NULL,
      unitPrice REAL DEFAULT 0,
      quantity  INTEGER DEFAULT 1,
      FOREIGN KEY (listId) REFERENCES lists(id) ON DELETE CASCADE
    );
  `);
};

// ─── LISTS ────────────────────────────────────────────────────────────────────
export const dbGetAllLists = async () => {
  const db = await getDb();
  // Récupère les listes triées par updatedAt décroissant
  const lists = await db.getAllAsync(
    `SELECT * FROM lists ORDER BY updatedAt DESC`,
  );
  // Récupère les articles de chaque liste
  const result = await Promise.all(
    lists.map(async (list) => {
      const articles = await db.getAllAsync(
        `SELECT * FROM articles WHERE listId = ?`,
        [list.id],
      );
      return {
        ...list,
        discount: Number(list.discount),
        articles,
      };
    }),
  );
  return result;
};

export const dbSaveList = async (list) => {
  const db = await getDb();
  const now = new Date().toISOString();

  // Upsert de la liste
  await db.runAsync(
    `INSERT INTO lists (id, name, discount, currency, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name      = excluded.name,
       discount  = excluded.discount,
       currency  = excluded.currency,
       updatedAt = excluded.updatedAt`,
    [
      list.id,
      list.name,
      list.discount ?? 0,
      list.currency ?? "Ar",
      list.createdAt ?? now,
      now,
    ],
  );

  // Supprime les anciens articles puis réinsère
  await db.runAsync(`DELETE FROM articles WHERE listId = ?`, [list.id]);
  for (const article of list.articles) {
    await db.runAsync(
      `INSERT INTO articles (id, listId, name, unitPrice, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [article.id, list.id, article.name, article.unitPrice, article.quantity],
    );
  }

  return { ...list, updatedAt: now };
};

export const dbDeleteList = async (id) => {
  const db = await getDb();
  // CASCADE supprime aussi les articles grâce à FOREIGN KEY
  await db.runAsync(`DELETE FROM lists WHERE id = ?`, [id]);
};

export const dbRenameList = async (id, newName) => {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(`UPDATE lists SET name = ?, updatedAt = ? WHERE id = ?`, [
    newName,
    now,
    id,
  ]);
};

// ─── ARTICLES ─────────────────────────────────────────────────────────────────
export const dbAddArticle = async (listId, article) => {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO articles (id, listId, name, unitPrice, quantity)
     VALUES (?, ?, ?, ?, ?)`,
    [article.id, listId, article.name, article.unitPrice, article.quantity],
  );
  // Met à jour updatedAt de la liste
  await db.runAsync(`UPDATE lists SET updatedAt = ? WHERE id = ?`, [
    new Date().toISOString(),
    listId,
  ]);
};

export const dbEditArticle = async (listId, article) => {
  const db = await getDb();
  await db.runAsync(
    `UPDATE articles SET name = ?, unitPrice = ?, quantity = ? WHERE id = ?`,
    [article.name, article.unitPrice, article.quantity],
  );
  await db.runAsync(`UPDATE lists SET updatedAt = ? WHERE id = ?`, [
    new Date().toISOString(),
    listId,
  ]);
};

export const dbRemoveArticle = async (articleId, listId) => {
  const db = await getDb();
  await db.runAsync(`DELETE FROM articles WHERE id = ?`, [articleId]);
  await db.runAsync(`UPDATE lists SET updatedAt = ? WHERE id = ?`, [
    new Date().toISOString(),
    listId,
  ]);
};
