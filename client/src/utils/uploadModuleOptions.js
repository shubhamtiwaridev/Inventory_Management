// Import all sidebar definitions
import { machineMaintenanceSidebarItems } from "../components/sidebars/machineMaintenanceSidebarItems";
import { inventorySidebarItems } from "../components/sidebars/inventorySidebarItems";
import { ecomSidebarItems } from "../components/sidebars/ecomSidebarItems";

const extractModuleOptions = (sidebarItems, modulePrefix) => {
  return sidebarItems
    .filter((item) => item.label !== "Dashboard")
    .map((item) => ({
      value: `${modulePrefix}:${item.label}`,
      label: item.label,
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

export const getModuleLabel = (value) => {
  const option = uploadModuleOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
};
