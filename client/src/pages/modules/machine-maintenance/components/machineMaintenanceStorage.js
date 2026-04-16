const STORAGE_PREFIX = "inventory.management.machineMaintenance";

export const STORAGE_KEYS = {
  assets: `${STORAGE_PREFIX}.assets`,
  spares: `${STORAGE_PREFIX}.spares`,
  tasks: `${STORAGE_PREFIX}.tasks`,
  users: `${STORAGE_PREFIX}.users`,
  vendors: `${STORAGE_PREFIX}.vendors`,
  breakdowns: `${STORAGE_PREFIX}.breakdowns`,
  consume: `${STORAGE_PREFIX}.consume`,
};

const canUseStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

const cloneRows = (rows = []) => rows.map((row) => ({ ...row }));

const normalizeRows = (rows = []) =>
  rows.map((row, index) => ({
    id: row?.id ?? `${Date.now()}-${index}`,
    ...row,
  }));

export const getStoredRows = (storageKey, fallbackRows = []) => {
  if (!canUseStorage()) return normalizeRows(fallbackRows);

  try {
    const rawValue = window.localStorage.getItem(storageKey);

    if (!rawValue) {
      const normalizedFallback = normalizeRows(fallbackRows);
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(normalizedFallback),
      );
      return normalizedFallback;
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? normalizeRows(parsedValue)
      : normalizeRows(fallbackRows);
  } catch {
    return normalizeRows(fallbackRows);
  }
};

export const saveStoredRows = (storageKey, rows = []) => {
  const normalizedRows = normalizeRows(rows);

  if (canUseStorage()) {
    window.localStorage.setItem(storageKey, JSON.stringify(normalizedRows));
  }

  return normalizedRows;
};

export const prependStoredRow = (
  storageKey,
  row,
  uniqueKey,
  fallbackRows = [],
) => {
  const existingRows = cloneRows(getStoredRows(storageKey, fallbackRows));

  const filteredRows = uniqueKey
    ? existingRows.filter(
        (item) =>
          String(item?.[uniqueKey] || "") !== String(row?.[uniqueKey] || ""),
      )
    : existingRows;

  const nextRows = normalizeRows([
    { id: row?.id ?? Date.now(), ...row },
    ...filteredRows,
  ]);
  saveStoredRows(storageKey, nextRows);
  return nextRows;
};

export const resetStoredRows = (storageKey, fallbackRows = []) =>
  saveStoredRows(storageKey, fallbackRows);
