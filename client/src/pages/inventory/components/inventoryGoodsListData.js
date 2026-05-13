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
    ],
    rows: [],
  },
};
