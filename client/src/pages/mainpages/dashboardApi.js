import { authFetch } from "../../api/authFetch.js";
import { buildApiUrl } from "../../api/config.js";

const DASHBOARD_SUMMARY_CACHE_TTL_MS = 30 * 1000;

let dashboardSummaryCache = {
  expiresAt: 0,
  data: null,
};

export const clearDashboardSummaryCache = () => {
  dashboardSummaryCache = {
    expiresAt: 0,
    data: null,
  };
};

const request = async (path, options = {}) => {
  const response = await authFetch(buildApiUrl(path), options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const cloneSummary = (data = {}) => ({
  counts: { ...(data.counts || {}) },
  recentComplaints: Array.isArray(data.recentComplaints)
    ? data.recentComplaints.map((item) => ({ ...item }))
    : [],
  complaintCategories: Array.isArray(data.complaintCategories)
    ? data.complaintCategories.map((item) => ({ ...item }))
    : [],
  lowStockSpares: Array.isArray(data.lowStockSpares)
    ? data.lowStockSpares.map((item) => ({ ...item }))
    : [],
  breakdownAssets: Array.isArray(data.breakdownAssets)
    ? data.breakdownAssets.map((item) => ({ ...item }))
    : [],
  recentStaffUsers: Array.isArray(data.recentStaffUsers)
    ? data.recentStaffUsers.map((item) => ({ ...item }))
    : [],
  inventoryBalancesPreview: Array.isArray(data.inventoryBalancesPreview)
    ? data.inventoryBalancesPreview.map((item) => ({ ...item }))
    : [],
  latestLogs: Array.isArray(data.latestLogs)
    ? data.latestLogs.map((item) => ({ ...item }))
    : [],
});

export const getDashboardSummary = async ({ skipCache = false } = {}) => {
  if (
    !skipCache &&
    dashboardSummaryCache.data &&
    dashboardSummaryCache.expiresAt > Date.now()
  ) {
    return cloneSummary(dashboardSummaryCache.data);
  }

  const response = await request("/dashboard/summary");
  const data = cloneSummary(response?.data || {});

  dashboardSummaryCache = {
    expiresAt: Date.now() + DASHBOARD_SUMMARY_CACHE_TTL_MS,
    data,
  };

  return cloneSummary(data);
};
