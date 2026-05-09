const now = (value) => value;

export const inventoryMasterConfigs = {
  goodsList: {
    title: "Goods List",
    primaryButtonLabel: "New Goods",
    dialogTitle: "Goods Registration",
    primaryValueKey: "goodsCode",
    columns: [
      { key: "goodsCode", label: "Goods Code", width: 150 },
      { key: "goodsDesc", label: "Goods Desc", width: 240 },
      { key: "goodsSupplier", label: "Goods Supplier", width: 190 },
      { key: "goodsUnit", label: "Goods Unit", width: 150 },
      { key: "goodsClass", label: "Goods Class", width: 150 },
      { key: "goodsBrand", label: "Goods Brand", width: 160 },
      { key: "goodsColor", label: "Goods Color", width: 150 },
      { key: "goodsSpecs", label: "Goods Specs", width: 200 },
      { key: "goodsOrigin", label: "Goods Origin", width: 150 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [
      { name: "goodsCode", label: "Goods Code", required: true },
      {
        name: "goodsDesc",
        label: "Goods Desc",
        required: true,
        multiline: true,
        minRows: 3,
      },
      { name: "goodsSupplier", label: "Goods Supplier", required: true },
      {
        name: "goodsUnit",
        label: "Goods Unit",
        required: true,
        selectFrom: "units",
      },
      {
        name: "goodsClass",
        label: "Goods Class",
        required: true,
        selectFrom: "class",
      },
      {
        name: "goodsBrand",
        label: "Goods Brand",
        required: true,
        selectFrom: "brand",
      },
      {
        name: "goodsColor",
        label: "Goods Color",
        required: true,
        selectFrom: "color",
      },
      {
        name: "goodsSpecs",
        label: "Goods Specs",
        required: true,
        selectFrom: "specs",
      },
      {
        name: "goodsOrigin",
        label: "Goods Origin",
        required: true,
        selectFrom: "origin",
      },
    ],
    rows: [],
  },

  units: {
    title: "Unit",
    primaryButtonLabel: "New Unit",
    dialogTitle: "Unit Registration",
    primaryValueKey: "goodsUnit",
    columns: [
      { key: "goodsUnit", label: "Goods Unit", width: 220 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [{ name: "goodsUnit", label: "Goods Unit", required: true }],
    rows: [
      {
        id: 101,
        goodsUnit: "Nos",
        createdBy: "Admin",
        createdAt: now("2026-04-18 09:15 AM"),
        updatedAt: now("2026-04-18 09:15 AM"),
      },
      {
        id: 102,
        goodsUnit: "Sheet",
        createdBy: "Admin",
        createdAt: now("2026-04-18 09:20 AM"),
        updatedAt: now("2026-04-18 09:20 AM"),
      },
    ],
  },

  class: {
    title: "Class",
    primaryButtonLabel: "New Class",
    dialogTitle: "Class Registration",
    primaryValueKey: "goodsClass",
    columns: [
      { key: "goodsClass", label: "Goods Class", width: 220 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [{ name: "goodsClass", label: "Goods Class", required: true }],
    rows: [
      {
        id: 201,
        goodsClass: "Panel",
        createdBy: "Admin",
        createdAt: now("2026-04-18 09:35 AM"),
        updatedAt: now("2026-04-18 09:35 AM"),
      },
      {
        id: 202,
        goodsClass: "Cladding",
        createdBy: "Admin",
        createdAt: now("2026-04-18 09:40 AM"),
        updatedAt: now("2026-04-18 09:40 AM"),
      },
    ],
  },

  color: {
    title: "Color",
    primaryButtonLabel: "New Color",
    dialogTitle: "Color Registration",
    primaryValueKey: "goodsColor",
    columns: [
      { key: "goodsColor", label: "Goods Color", width: 220 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [{ name: "goodsColor", label: "Goods Color", required: true }],
    rows: [
      {
        id: 301,
        goodsColor: "White",
        createdBy: "Admin",
        createdAt: now("2026-04-18 09:50 AM"),
        updatedAt: now("2026-04-18 09:50 AM"),
      },
      {
        id: 302,
        goodsColor: "Teak",
        createdBy: "Admin",
        createdAt: now("2026-04-18 09:55 AM"),
        updatedAt: now("2026-04-18 09:55 AM"),
      },
    ],
  },

  brand: {
    title: "Brand",
    primaryButtonLabel: "New Brand",
    dialogTitle: "Brand Registration",
    primaryValueKey: "goodsBrand",
    columns: [
      { key: "goodsBrand", label: "Goods Brand", width: 220 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [{ name: "goodsBrand", label: "Goods Brand", required: true }],
    rows: [
      {
        id: 401,
        goodsBrand: "Decostyle",
        createdBy: "Admin",
        createdAt: now("2026-04-18 10:05 AM"),
        updatedAt: now("2026-04-18 10:05 AM"),
      },
      {
        id: 402,
        goodsBrand: "Prime",
        createdBy: "Admin",
        createdAt: now("2026-04-18 10:10 AM"),
        updatedAt: now("2026-04-18 10:10 AM"),
      },
    ],
  },

  specs: {
    title: "Specs",
    primaryButtonLabel: "New Specs",
    dialogTitle: "Specs Registration",
    primaryValueKey: "goodsSpecs",
    columns: [
      { key: "goodsSpecs", label: "Goods Specs", width: 260 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [{ name: "goodsSpecs", label: "Goods Specs", required: true }],
    rows: [
      {
        id: 501,
        goodsSpecs: "8mm x 250mm x 5.95m",
        createdBy: "Admin",
        createdAt: now("2026-04-18 10:20 AM"),
        updatedAt: now("2026-04-18 10:20 AM"),
      },
      {
        id: 502,
        goodsSpecs: "10mm x 200mm x 2.9m",
        createdBy: "Admin",
        createdAt: now("2026-04-18 10:25 AM"),
        updatedAt: now("2026-04-18 10:25 AM"),
      },
    ],
  },

  origin: {
    title: "Origin",
    primaryButtonLabel: "New Origin",
    dialogTitle: "Origin Registration",
    primaryValueKey: "goodsOrigin",
    columns: [
      { key: "goodsOrigin", label: "Goods Origin", width: 220 },
      { key: "createdAt", label: "Create Time", width: 180, nowrap: true },
      { key: "updatedAt", label: "Update Time", width: 180, nowrap: true },
    ],
    fields: [{ name: "goodsOrigin", label: "Goods Origin", required: true }],
    rows: [
      {
        id: 601,
        goodsOrigin: "India",
        createdBy: "Admin",
        createdAt: now("2026-04-18 10:35 AM"),
        updatedAt: now("2026-04-18 10:35 AM"),
      },
      {
        id: 602,
        goodsOrigin: "China",
        createdBy: "Admin",
        createdAt: now("2026-04-18 10:40 AM"),
        updatedAt: now("2026-04-18 10:40 AM"),
      },
    ],
  },
};

export const cloneInventoryMasterRows = () =>
  Object.fromEntries(
    Object.entries(inventoryMasterConfigs).map(([key, config]) => [
      key,
      (config.rows || []).map((row) => ({ ...row })),
    ]),
  );
