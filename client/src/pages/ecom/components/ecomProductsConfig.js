export const ecomProductsConfig = {
  title: "Ecom Products",
  primaryButtonLabel: "New Product",
  dialogTitle: "Product Registration",
  primaryValueKey: "productSku",
  columns: [
    { key: "productSku", label: "SKU", width: 160 },
    { key: "title", label: "Title", width: 360 },
    { key: "channel", label: "Channel", width: 140 },
    { key: "price", label: "Price", width: 120, nowrap: true },
    { key: "stockQuantity", label: "Stock", width: 100 },
    { key: "updatedAt", label: "Updated At", width: 180, nowrap: true },
  ],
  fields: [
    { name: "productSku", label: "Product SKU", required: true },
    {
      name: "title",
      label: "Title",
      required: true,
      multiline: true,
      minRows: 2,
    },
    { name: "listingId", label: "Listing ID" },
    {
      name: "channel",
      label: "Channel",
      required: true,
      type: "select",
      options: [
        { value: "amazon", label: "Amazon" },
        { value: "flipkart", label: "Flipkart" },
        { value: "messho", label: "Meesho" },
      ],
    },
    { name: "price", label: "Price (INR)", required: true, type: "number" },
    {
      name: "stockQuantity",
      label: "Stock Quantity",
      required: true,
      type: "number",
    },
    { name: "description", label: "Description", multiline: true, minRows: 3 },
  ],
};
