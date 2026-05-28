import xlsx from "xlsx";
import EcomProduct from "./ecomModel.js";

const formatDateTime = (value) => {
  const pad = (v) => String(v).padStart(2, "0");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const hours = date.getHours();
  const hours12 = hours % 12 || 12;
  const amPm = hours >= 12 ? "PM" : "AM";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${hours12}:${pad(date.getMinutes())} ${amPm}`;
};

const mapProduct = (item = {}) => ({
  id: String(item._id),
  productSku: item.productSku || "",
  title: item.title || "",
  listingId: item.listingId || "",
  channel: item.channel || "",
  price: item.price || 0,
  stockQuantity: item.stockQuantity || 0,
  description: item.description || "",
  createdBy: item.createdBy || "System",
  createdAt: formatDateTime(item.createdAt),
  updatedAt: formatDateTime(item.updatedAt),
});

const normalizeValue = (v) => String(v || "").trim();

const normalizePayload = (payload = {}) => ({
  productSku: normalizeValue(payload.productSku),
  title: normalizeValue(payload.title),
  listingId: normalizeValue(payload.listingId),
  channel: normalizeValue(payload.channel),
  price: Number(payload.price) || 0,
  stockQuantity: Number(payload.stockQuantity) || 0,
  description: normalizeValue(payload.description),
});

export const getEcomProducts = async (req, res) => {
  try {
    const items = await EcomProduct.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: items.map(mapProduct) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch ecom products",
    });
  }
};

export const createEcomProduct = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    const duplicate = payload.productSku
      ? await EcomProduct.findOne({
          productSku: { $regex: `^${payload.productSku}$`, $options: "i" },
        })
      : null;

    if (duplicate) {
      return res
        .status(409)
        .json({ success: false, message: "Duplicate product SKU exists" });
    }

    const item = await EcomProduct.create({
      ...payload,
      createdBy: req.user?.name || "System",
      updatedBy: req.user?.name || "System",
    });

    return res.status(201).json({
      success: true,
      message: "Product created",
      data: mapProduct(item.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

export const updateEcomProduct = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);

    if (payload.productSku) {
      const dup = await EcomProduct.findOne({
        productSku: { $regex: `^${payload.productSku}$`, $options: "i" },
        _id: { $ne: req.params.id },
      }).lean();
      if (dup) {
        return res
          .status(409)
          .json({ success: false, message: "Duplicate product SKU exists" });
      }
    }

    const item = await EcomProduct.findByIdAndUpdate(
      req.params.id,
      { ...payload, updatedBy: req.user?.name || "System" },
      { returnDocument: "after", runValidators: true },
    ).lean();

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    return res.status(200).json({
      success: true,
      message: "Product updated",
      data: mapProduct(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

export const deleteEcomProduct = async (req, res) => {
  try {
    const item = await EcomProduct.findByIdAndDelete(req.params.id).lean();
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.status(200).json({
      success: true,
      message: "Product deleted",
      data: mapProduct(item),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete product",
    });
  }
};

export const importEcomProductsFromExcel = async (req, res) => {
  try {
    if (!req.file?.buffer)
      return res
        .status(400)
        .json({ success: false, message: "Excel file is required" });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet)
      return res
        .status(400)
        .json({ success: false, message: "No worksheet found" });

    const worksheet = workbook.Sheets[firstSheet];
    const rows = xlsx.utils.sheet_to_json(worksheet, { defval: "" });

    const normalized = rows
      .map((row) => {
        const keys = Object.keys(row || {});
        const get = (names) => {
          for (const k of keys) {
            if (names.includes(String(k).toLowerCase()))
              return String(row[k] || "").trim();
          }
          return "";
        };

        return normalizePayload({
          productSku: get(["productsku", "sku", "sku code", "code"]),
          title: get(["title", "producttitle", "name"]),
          listingId: get(["listingid", "asin", "listing id"]),
          channel: get(["channel"]),
          price: Number(get(["price"])) || 0,
          stockQuantity: Number(get(["stock", "qty", "quantity"])) || 0,
          description: get(["description", "desc"]),
        });
      })
      .filter((r) => r.productSku || r.title);

    if (normalized.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No importable rows" });
    await EcomProduct.deleteMany({});
    const toInsert = normalized.map((r) => ({
      ...r,
      createdBy: req.user?.name || "System",
      updatedBy: req.user?.name || "System",
    }));
    const inserted = await EcomProduct.insertMany(toInsert, { ordered: false });

    return res.status(200).json({
      success: true,
      message: "Import completed",
      data: inserted.map(mapProduct).reverse(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to import products",
    });
  }
};
