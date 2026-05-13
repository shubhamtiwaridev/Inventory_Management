import User from "../auth/authModel.js";
import GoodsList from "../inventory/goods-list/goodsListModel.js";
import { getAggregatedBalances } from "../inventory/stock-transaction/stockTransactionController.js";
import Warehouse from "../inventory/warehouse/warehouseModel.js";
import LogActivity from "../log-activity/logActivityModel.js";
import Asset from "../machine-maintenance/asset/assetModel.js";
import Complient from "../machine-maintenance/complient/complientModel.js";
import Spare from "../machine-maintenance/spare/spareModel.js";

const LOW_STOCK_EXPR = {
  $and: [
    {
      $gt: [{ $max: ["$minQty", "$reorderLevel"] }, 0],
    },
    {
      $lte: ["$currentStock", { $max: ["$minQty", "$reorderLevel"] }],
    },
  ],
};

const mapRecentComplaint = (item) => ({
  id: String(item?._id || ""),
  complaintCode: item?.complaintCode || "",
  complaintTitle: item?.complaintTitle || "",
  section: item?.section || "",
  priority: item?.priority || "",
  issueDate: item?.issueDate || null,
  createdBy: item?.createdBy || "",
});

const mapComplaintCategory = (item) => ({
  section: item?._id || "",
  count: Number(item?.count || 0),
});

const mapLowStockSpare = (item) => ({
  id: String(item?._id || ""),
  spareCode: item?.spareCode || "",
  spareName: item?.spareName || "",
  currentStock: Number(item?.currentStock || 0),
  minQty: Number(item?.minQty || 0),
  reorderLevel: Number(item?.reorderLevel || 0),
});

const mapBreakdownAsset = (item) => ({
  id: String(item?._id || ""),
  assetCode: item?.assetCode || "",
  assetName: item?.assetName || "",
  department: item?.department || "",
  plant: item?.plant || "",
});

const mapLatestLog = (item) => ({
  id: String(item?._id || ""),
  action: item?.action || "",
  page: item?.page || "",
  targetName: item?.targetName || "",
  role: item?.role || "",
  userName: item?.userName || "",
  createdAt: item?.createdAt || null,
});

export const getDashboardSummary = async (req, res) => {
  try {
    const [
      breakdownAssetsCount,
      recentBreakdownAssets,
      lowStockSparesCount,
      recentLowStockSpares,
      totalComplaints,
      openComplaintsCount,
      recentComplaints,
      complaintCategories,
      totalStaffUsers,
      activeStaffUsers,
      logCount,
      latestLogs,
      goodsCount,
      warehouseCount,
      inventoryBalances,
    ] = await Promise.all([
      Asset.countDocuments({ status: /^breakdown$/i }),
      Asset.find({ status: /^breakdown$/i })
        .select("assetCode assetName department plant")
        .sort({ createdAt: -1 })
        .limit(2)
        .lean(),
      Spare.countDocuments({ $expr: LOW_STOCK_EXPR }),
      Spare.find({ $expr: LOW_STOCK_EXPR })
        .select("spareCode spareName currentStock minQty reorderLevel")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      Complient.countDocuments({}),
      Complient.countDocuments({ status: { $not: /^(closed|resolved)$/i } }),
      Complient.find({})
        .select(
          "complaintCode complaintTitle section priority issueDate createdBy",
        )
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Complient.aggregate([
        {
          $group: {
            _id: "$section",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1, _id: 1 },
        },
      ]),
      User.countDocuments({}),
      User.countDocuments({ isVerified: { $ne: false } }),
      LogActivity.countDocuments({}),
      LogActivity.find({})
        .select("action page targetName role userName createdAt")
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
      GoodsList.countDocuments({}),
      Warehouse.countDocuments({}),
      getAggregatedBalances(),
    ]);

    const inventoryTotals = inventoryBalances.reduce(
      (acc, item) => {
        acc.inboundQuantity += Number(item?.inboundQuantity || 0);
        acc.outboundQuantity += Number(item?.outboundQuantity || 0);
        acc.currentQuantity += Number(item?.currentQuantity || 0);
        return acc;
      },
      {
        inboundQuantity: 0,
        outboundQuantity: 0,
        currentQuantity: 0,
      },
    );

    return res.status(200).json({
      success: true,
      data: {
        counts: {
          breakdownAssets: breakdownAssetsCount,
          lowStockSpares: lowStockSparesCount,
          totalComplaints,
          openComplaints: openComplaintsCount,
          totalStaffUsers,
          activeStaffUsers,
          pendingStaffUsers: Math.max(totalStaffUsers - activeStaffUsers, 0),
          logActivities: logCount,
          goodsItems: goodsCount,
          warehouses: warehouseCount,
          inventoryItems: inventoryBalances.length,
          inventoryCurrentQuantity: inventoryTotals.currentQuantity,
        },
        recentComplaints: recentComplaints.map(mapRecentComplaint),
        complaintCategories: complaintCategories.map(mapComplaintCategory),
        lowStockSpares: recentLowStockSpares.map(mapLowStockSpare),
        breakdownAssets: recentBreakdownAssets.map(mapBreakdownAsset),
        latestLogs: latestLogs.map(mapLatestLog),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard summary",
    });
  }
};
