import xlsx from "xlsx";
import GoodsList from "./goodsListModel.js";

const GOODS_LIST_SELECT_FIELDS =
  "goodsCode goodsDesc goodsSupplier goodsSku goodsBarcode createdBy createdAt updatedAt";
const LEGACY_DEFAULT_GOODS_FILTERS = [
  {
    goodsCode: "GD-001",
    goodsDesc: "PVC Ceiling Panel Premium White",
    goodsSupplier: "Shree Supplier",
    createdBy: "System",
    updatedBy: "System",
  },
  {
    goodsCode: "GD-002",
    goodsDesc: "Wall Cladding Sheet Teak Finish",
    goodsSupplier: "Mahalaxmi Traders",
    createdBy: "System",
    updatedBy: "System",
  },
];

const REQUIRED_FIELDS = ["goodsCode", "goodsDesc", "goodsSupplier"];
const DEPRECATED_GOODS_FIELDS = [
  "goodsUnit",
  "goodsClass",
  "goodsBrand",
  "goodsColor",
  "goodsSpecs",
  "goodsOrigin",
];
const DEPRECATED_GOODS_FIELD_UNSET = Object.fromEntries(
  DEPRECATED_GOODS_FIELDS.map((field) => [field, ""]),
);
let deprecatedGoodsCleanupPromise = null;

const EXCEL_FIELD_MAP = {
  goodscode: "goodsCode",
  productcode: "goodsCode",
  productsku: "goodsCode",
  sku: "goodsSku",
  itemcode: "goodsCode",
  materialcode: "goodsCode",
  goodsdesc: "goodsDesc",
  itemname: "goodsDesc",
  nameofitem: "goodsDesc",
  goodsdescription: "goodsDesc",
  itemdescription: "goodsDesc",
  itemdesc: "goodsDesc",
  particulars: "goodsDesc",
  description: "goodsDesc",
  goodssupplier: "goodsSupplier",
  supplier: "goodsSupplier",
  goodsbarcode: "goodsBarcode",
  barcode: "goodsBarcode",
};

const KNOWN_EXCEL_HEADER_KEYS = new Set([
  ...Object.keys(EXCEL_FIELD_MAP),
  "closingstock",
  "purcorderspending",
  "purchorderspending",
  "purchaseorderspending",
  "saleordersdue",
  "salesordersdue",
  "nettavailable",
  "netavailable",
  "reorderlevel",
  "reorderqty",
  "shortfall",
  "minreorderqty",
  "minimumreorderqty",
  "ordertobeplaced",
]);

const EXCEL_COLUMN_FIELD_ORDER = [
  "goodsCode",
  "goodsDesc",
  "goodsSupplier",
  "goodsSku",
  "goodsBarcode",
];
const IMPORT_PLACEHOLDER_CODE_PREFIX = "__IMPORT_PLACEHOLDER__";
const QUANTITY_LIKE_VALUE_PATTERN =
  /^[\d,]+(?:\.\d+)?(?:\s*[a-zA-Z.%/()-]+(?:\s*[a-zA-Z.%/()-]+)*)?$/;

const pad = (value) => String(value).padStart(2, "0");
const normalizeValue = (value) => String(value || "").trim();
const normalizeKey = (value) =>
  normalizeValue(value)
    .toLowerCase()
    .replace(/[\s/_-]+/g, "");
const escapeRegex = (value = "") =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

const isPlaceholderGoodsCode = (value) =>
  normalizeValue(value).startsWith(IMPORT_PLACEHOLDER_CODE_PREFIX);

const normalizeDisplayText = (value) =>
  String(value || "")
    .replace(/^"+|"+$/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const isQuantityLikeValue = (value) => {
  const normalized = normalizeDisplayText(value);

  return Boolean(normalized) && QUANTITY_LIKE_VALUE_PATTERN.test(normalized);
};

const looksLikeDescriptiveGoodsCode = (value) => {
  const normalized = normalizeDisplayText(value);

  if (!normalized) return false;

  const compactCodePattern = /^[a-zA-Z0-9._/-]{1,24}$/;

  return !compactCodePattern.test(normalized) && /\s/.test(normalized);
};

const sanitizeLegacyImportedItem = (item = {}) => {
  const goodsCode = normalizeDisplayText(item.goodsCode);
  const goodsDesc = normalizeDisplayText(item.goodsDesc);
  const goodsSupplier = normalizeDisplayText(item.goodsSupplier);
  const goodsSku = normalizeDisplayText(item.goodsSku);
  const goodsBarcode = normalizeDisplayText(item.goodsBarcode);

  const auxiliaryValues = [goodsDesc, goodsSupplier].filter(Boolean);

  const hasOnlyQuantityAuxiliaryValues =
    auxiliaryValues.length > 0 &&
    auxiliaryValues.every((value) => isQuantityLikeValue(value));

  if (goodsDesc && hasOnlyQuantityAuxiliaryValues) {
    return {
      ...item,
      goodsCode,
      goodsDesc,
      goodsSupplier: "",
      goodsSku,
      goodsBarcode,
    };
  }

  if (
    looksLikeDescriptiveGoodsCode(goodsCode) &&
    hasOnlyQuantityAuxiliaryValues
  ) {
    return {
      ...item,
      goodsCode: "",
      goodsDesc: goodsCode,
      goodsSupplier: "",
      goodsSku,
      goodsBarcode,
    };
  }

  return {
    ...item,
    goodsCode,
    goodsDesc,
    goodsSupplier,
    goodsSku,
    goodsBarcode,
  };
};

const mapGoodsItem = (item) => ({
  id: String(item._id),
  goodsCode: isPlaceholderGoodsCode(item.goodsCode) ? "" : item.goodsCode || "",
  goodsDesc: item.goodsDesc || "",
  goodsSupplier: item.goodsSupplier || "",
  goodsSku: item.goodsSku || "",
  goodsBarcode: item.goodsBarcode || "",
  createdBy: item.createdBy || "System",
  createdAt: formatDateTime(item.createdAt),
  updatedAt: formatDateTime(item.updatedAt),
});

const normalizeGoodsPayload = (payload = {}) => ({
  goodsCode: normalizeValue(payload.goodsCode),
  goodsDesc: normalizeValue(payload.goodsDesc),
  goodsSupplier: normalizeValue(payload.goodsSupplier),
  goodsSku: normalizeValue(payload.goodsSku),
  goodsBarcode: normalizeValue(payload.goodsBarcode),
});

const normalizeExcelRow = (row = {}) => {
  const normalized = {};

  Object.entries(row).forEach(([key, value]) => {
    const mappedKey = EXCEL_FIELD_MAP[normalizeKey(key)];

    if (mappedKey) {
      normalized[mappedKey] = value;
    }
  });

  if (!normalized.goodsCode && normalized.goodsSku) {
    normalized.goodsCode = normalized.goodsSku;
  }

  return normalizeGoodsPayload(normalized);
};

const normalizeExcelArrayRow = (row = []) => {
  const normalized = {};
  const firstValueIndex = row.findIndex((value) => normalizeValue(value));
  const alignedRow = firstValueIndex > 0 ? row.slice(firstValueIndex) : row;

  EXCEL_COLUMN_FIELD_ORDER.forEach((field, index) => {
    if (alignedRow[index] !== undefined) {
      normalized[field] = alignedRow[index];
    }
  });

  if (!normalized.goodsCode && normalized.goodsSku) {
    normalized.goodsCode = normalized.goodsSku;
  }

  return normalizeGoodsPayload(normalized);
};

const materializeMergedWorksheetCells = (worksheet) => {
  const merges = Array.isArray(worksheet?.["!merges"])
    ? worksheet["!merges"]
    : [];

  merges.forEach((merge) => {
    const startCellAddress = xlsx.utils.encode_cell(merge.s);
    const startCell = worksheet[startCellAddress];

    if (!startCell || startCell.v === undefined || startCell.v === null) {
      return;
    }

    for (let rowIndex = merge.s.r; rowIndex <= merge.e.r; rowIndex += 1) {
      for (let colIndex = merge.s.c; colIndex <= merge.e.c; colIndex += 1) {
        const cellAddress = xlsx.utils.encode_cell({
          r: rowIndex,
          c: colIndex,
        });

        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = {
            t: startCell.t || "s",
            v: startCell.v,
            w: startCell.w || String(startCell.v),
          };
        }
      }
    }
  });
};

const isEmptyPayload = (payload = {}) =>
  Object.values(payload).every((value) => !normalizeValue(value));

const hasImportableGoodsData = (payload = {}) =>
  [
    payload.goodsCode,
    payload.goodsDesc,
    payload.goodsSupplier,
    payload.goodsSku,
    payload.goodsBarcode,
  ].some((value) => normalizeValue(value));

const getValidationError = (payload = {}) => {
  const missingFields = REQUIRED_FIELDS.filter(
    (field) => !normalizeValue(payload[field]),
  );

  return missingFields.length > 0
    ? `Missing required fields: ${missingFields.join(", ")}`
    : "";
};

const getImportValidationError = (payload = {}) => {
  if (
    !normalizeValue(payload.goodsCode) &&
    !normalizeValue(payload.goodsDesc)
  ) {
    return "Missing item identifier";
  }

  return "";
};

const buildDuplicateKeys = (payload = {}) =>
  [
    payload.goodsCode &&
      !isPlaceholderGoodsCode(payload.goodsCode) &&
      `code:${normalizeKey(payload.goodsCode)}`,
    payload.goodsSku && `sku:${normalizeKey(payload.goodsSku)}`,
    payload.goodsBarcode && `barcode:${normalizeKey(payload.goodsBarcode)}`,
    payload.goodsDesc && `name:${normalizeKey(payload.goodsDesc)}`,
  ].filter(Boolean);

const withImportPlaceholderCode = (payload = {}, rowIndex = 0) => {
  if (normalizeValue(payload.goodsCode)) {
    return payload;
  }

  return {
    ...payload,
    goodsCode: `${IMPORT_PLACEHOLDER_CODE_PREFIX}${Date.now()}_${rowIndex}`,
  };
};

const getExistingDuplicateKeySet = (items = []) =>
  new Set(items.flatMap((item) => buildDuplicateKeys(item)));

const buildDuplicateQuery = (payload = {}, excludedId = null) => {
  const conditions = [
    payload.goodsCode &&
      !isPlaceholderGoodsCode(payload.goodsCode) && {
        goodsCode: {
          $regex: `^${escapeRegex(payload.goodsCode)}$`,
          $options: "i",
        },
      },
    payload.goodsSku && {
      goodsSku: {
        $regex: `^${escapeRegex(payload.goodsSku)}$`,
        $options: "i",
      },
    },
    payload.goodsBarcode && {
      goodsBarcode: {
        $regex: `^${escapeRegex(payload.goodsBarcode)}$`,
        $options: "i",
      },
    },
    payload.goodsDesc && {
      goodsDesc: {
        $regex: `^${escapeRegex(payload.goodsDesc)}$`,
        $options: "i",
      },
    },
  ].filter(Boolean);

  if (conditions.length === 0) {
    return null;
  }

  return {
    ...(excludedId ? { _id: { $ne: excludedId } } : {}),
    $or: conditions,
  };
};

const findDuplicateGoodsItem = async (payload = {}, excludedId = null) => {
  const duplicateQuery = buildDuplicateQuery(payload, excludedId);

  if (!duplicateQuery) {
    return null;
  }

  return GoodsList.findOne(duplicateQuery)
    .select("goodsCode goodsSku goodsBarcode goodsDesc")
    .lean();
};

const removeLegacyDefaultGoodsItems = async () => {
  if (LEGACY_DEFAULT_GOODS_FILTERS.length === 0) return;

  await GoodsList.deleteMany({
    $or: LEGACY_DEFAULT_GOODS_FILTERS,
  });
};

const removeDeprecatedGoodsFields = async () => {
  await GoodsList.updateMany(
    {
      $or: DEPRECATED_GOODS_FIELDS.map((field) => ({
        [field]: { $exists: true },
      })),
    },
    {
      $unset: DEPRECATED_GOODS_FIELD_UNSET,
    },
  );
};

const ensureDeprecatedGoodsFieldsRemoved = async () => {
  if (!deprecatedGoodsCleanupPromise) {
    deprecatedGoodsCleanupPromise = removeDeprecatedGoodsFields().catch(
      (error) => {
        deprecatedGoodsCleanupPromise = null;
        throw error;
      },
    );
  }

  await deprecatedGoodsCleanupPromise;
};

const isLikelyHeaderRow = (row = []) => {
  const normalizedRow = row
    .map((value) => normalizeValue(value))
    .filter(Boolean);

  if (normalizedRow.length === 0) return false;

  const matchedHeaderCount = normalizedRow.filter((value) =>
    KNOWN_EXCEL_HEADER_KEYS.has(normalizeKey(value)),
  ).length;

  return matchedHeaderCount >= Math.min(3, normalizedRow.length);
};

const parseWorksheetRows = (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  materializeMergedWorksheetCells(worksheet);
  const rows = xlsx.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  const nonEmptyRows = rows.filter(
    (row) => Array.isArray(row) && row.some((value) => normalizeValue(value)),
  );

  if (nonEmptyRows.length === 0) return [];

  const headerRowIndex = nonEmptyRows.findIndex((row) =>
    isLikelyHeaderRow(row),
  );

  if (headerRowIndex !== -1) {
    const headers = nonEmptyRows[headerRowIndex];
    const dataRows = nonEmptyRows.slice(headerRowIndex + 1);

    return dataRows.map((row) =>
      normalizeExcelRow(
        Object.fromEntries(
          headers.map((header, index) => [header, row[index]]),
        ),
      ),
    );
  }

  return nonEmptyRows.map((row) => normalizeExcelArrayRow(row));
};

export const getGoodsItems = async (req, res) => {
  try {
    await ensureDeprecatedGoodsFieldsRemoved();
    const items = await GoodsList.find()
      .select(GOODS_LIST_SELECT_FIELDS)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: items
        .map((item) => sanitizeLegacyImportedItem(item))
        .filter(Boolean)
        .map(mapGoodsItem),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch goods list",
    });
  }
};

export const createGoodsItem = async (req, res) => {
  try {
    await Promise.all([
      removeLegacyDefaultGoodsItems(),
      ensureDeprecatedGoodsFieldsRemoved(),
    ]);

    const payload = normalizeGoodsPayload(req.body);
    const validationError = getValidationError(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const duplicateItem = await findDuplicateGoodsItem(payload);

    if (duplicateItem) {
      return res.status(409).json({
        success: false,
        message: "Duplicate goods item already exists",
      });
    }

    const item = await GoodsList.create({
      ...payload,
      createdBy: getUserName(req),
      updatedBy: getUserName(req),
    });

    return res.status(201).json({
      success: true,
      message: "Goods item created successfully",
      data: mapGoodsItem(item.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create goods item",
    });
  }
};

export const updateGoodsItem = async (req, res) => {
  try {
    await ensureDeprecatedGoodsFieldsRemoved();
    const payload = normalizeGoodsPayload(req.body);
    const validationError = getValidationError(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const duplicateItem = await findDuplicateGoodsItem(payload, req.params.id);

    if (duplicateItem) {
      return res.status(409).json({
        success: false,
        message: "Duplicate goods item already exists",
      });
    }

    const item = await GoodsList.findByIdAndUpdate(
      req.params.id,
      {
        ...payload,
        updatedBy: getUserName(req),
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Goods item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goods item updated successfully",
      data: mapGoodsItem(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update goods item",
    });
  }
};

export const deleteGoodsItem = async (req, res) => {
  try {
    const item = await GoodsList.findByIdAndDelete(req.params.id).lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Goods item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goods item deleted successfully",
      data: mapGoodsItem(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete goods item",
    });
  }
};

export const importGoodsItemsFromExcel = async (req, res) => {
  try {
    await Promise.all([
      removeLegacyDefaultGoodsItems(),
      ensureDeprecatedGoodsFieldsRemoved(),
    ]);

    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const normalizedRows = parseWorksheetRows(req.file.buffer).filter(
      (payload) => !isEmptyPayload(payload) && hasImportableGoodsData(payload),
    );

    if (normalizedRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "The uploaded Excel file has no valid data rows",
      });
    }

    await GoodsList.deleteMany({});

    const duplicateKeySet = new Set();
    const rowsToInsert = [];
    let skippedDuplicates = 0;
    let skippedInvalid = 0;

    normalizedRows.forEach((rawPayload, index) => {
      const sanitizedPayload = sanitizeLegacyImportedItem(rawPayload);

      if (!sanitizedPayload) {
        skippedInvalid += 1;
        return;
      }

      const payload = withImportPlaceholderCode(sanitizedPayload, index);
      const validationError = getImportValidationError(payload);

      if (validationError) {
        skippedInvalid += 1;
        return;
      }

      const duplicateKeys = buildDuplicateKeys(payload);

      if (duplicateKeys.some((key) => duplicateKeySet.has(key))) {
        skippedDuplicates += 1;
        return;
      }

      duplicateKeys.forEach((key) => duplicateKeySet.add(key));
      rowsToInsert.push({
        ...payload,
        createdBy: getUserName(req),
        updatedBy: getUserName(req),
      });
    });

    if (rowsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid goods rows were found in the uploaded Excel file",
      });
    }

    const insertedItems = await GoodsList.insertMany(rowsToInsert, {
      ordered: false,
    });

    return res.status(200).json({
      success: true,
      message: "Excel import completed successfully",
      data: insertedItems
        .map((item) => mapGoodsItem(item.toObject()))
        .reverse(),
      summary: {
        importedCount: rowsToInsert.length,
        skippedDuplicates,
        skippedInvalid,
        totalRows: normalizedRows.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to import goods list from Excel",
    });
  }
};
