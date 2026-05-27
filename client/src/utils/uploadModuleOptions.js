// Import all sidebar definitions
import { machineMaintenanceSidebarItems } from "../components/sidebars/machineMaintenanceSidebarItems";
import { inventorySidebarItems } from "../components/sidebars/inventorySidebarItems";
import { ecomSidebarItems } from "../components/sidebars/ecomSidebarItems";

// Extract top-level module labels and paths (or custom identifiers)
const extractModuleOptions = (sidebarItems, modulePrefix) => {
  return sidebarItems
    .filter((item) => item.label !== "Dashboard") // exclude dashboard
    .map((item) => ({
      value: `${modulePrefix}:${item.label}`,
      label: item.label,
      // optional: add icon, description
    }));
};

export const uploadModuleOptions = [
  ...extractModuleOptions(
    machineMaintenanceSidebarItems,
    "machine-maintenance",
  ),
  ...extractModuleOptions(inventorySidebarItems, "inventory"),
  ...extractModuleOptions(ecomSidebarItems, "ecom"),
];

// Helper to get label by value
export const getModuleLabel = (value) => {
  const option = uploadModuleOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
};
