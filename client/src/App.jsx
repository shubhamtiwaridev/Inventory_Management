import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { GlobalStyles } from "@mui/material";

import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PermissionRoute from "./routes/PermissionRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import RouteLoader from "./components/RouteLoader.jsx";
import { inventorySidebarItems } from "./components/sidebars/inventorySidebarItems.jsx";
import { machineMaintenanceSidebarItems } from "./components/sidebars/machineMaintenanceSidebarItems.jsx";
import { sparesSidebarItems } from "./components/sidebars/sparesSidebarItems.jsx";
import { ecomSidebarItems } from "./components/sidebars/ecomSidebarItems.jsx";
import {
  AssetListPage,
  BreakdownListPage,
  ComplaintAssetsPage,
  ComplaintSparePage,
  ComplaintTaskMasterPage,
  ComplaintVendorPage,
  ConsumeEntryPage,
  ContractTypeListPage,
  CriticalLevelListPage,
  Dashboard,
  DepartmentListPage,
  ForgetPassword,
  FrequencyListPage,
  InventoryDownloadCenterPage,
  InventoryMasterListPage,
  InventoryPage,
  InventoryTransactionPage,
  InventoryUploadCenterPage,
  InventoryWarehousePage,
  EcomPage,
  EcomOverviewPage,
  EcomAmazonPage,
  EcomFlipkartPage,
  EcomMesshoPage,
  LogActivityPage,
  Login,
  MachineMaintenancePage,
  PlantSiteListPage,
  Register,
  ShiftTimingListPage,
  SparesPage,
  SpareListPage,
  StaffList,
  StaffPage,
  StaffType,
  StatusListPage,
  TaskCategoryListPage,
  TaskListPage,
  UnitOfMeasureListPage,
  UserListPage,
  VendorListPage,
} from "./routes/routeModules.js";

const withPermissionRoute = (
  element,
  sidebarItems,
  featurePath,
  featureLabel = "",
) => (
  <PermissionRoute
    sidebarItems={sidebarItems}
    featurePath={featurePath}
    featureLabel={featureLabel}
  >
    {element}
  </PermissionRoute>
);

const renderLazyPage = (element, fullScreen = false) => (
  <Suspense fallback={<RouteLoader fullScreen={fullScreen} />}>
    {element}
  </Suspense>
);

function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          "*::-webkit-scrollbar:vertical": {
            width: 0,
            display: "none",
          },
          "*::-webkit-scrollbar:horizontal": {
            height: 10,
            display: "block",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicRoute />}>
          <Route
            path="/register"
            element={renderLazyPage(<Register />, true)}
          />
          <Route path="/login" element={renderLazyPage(<Login />, true)} />
          <Route
            path="/forgot-password"
            element={renderLazyPage(<ForgetPassword />, true)}
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={renderLazyPage(<Dashboard />, true)}
          />
          <Route path="/orders" element={renderLazyPage(<Dashboard />, true)} />
          <Route
            path="/suppliers"
            element={renderLazyPage(<Dashboard />, true)}
          />
          <Route
            path="/warehouses"
            element={renderLazyPage(<Dashboard />, true)}
          />
          <Route
            path="/categories"
            element={renderLazyPage(<Dashboard />, true)}
          />
          <Route
            path="/reports"
            element={renderLazyPage(<Dashboard />, true)}
          />

          <Route path="/staff" element={renderLazyPage(<StaffPage />, true)} />
          <Route
            path="/staff-list"
            element={renderLazyPage(<StaffList />, true)}
          />
          <Route
            path="/staff-type"
            element={renderLazyPage(<StaffType />, true)}
          />
          <Route
            path="/log-activity"
            element={renderLazyPage(<LogActivityPage />, true)}
          />

          <Route
            path="/machine-maintenance"
            element={
              <PermissionRoute
                sidebarItems={machineMaintenanceSidebarItems}
                requireModuleAccess
              >
                {renderLazyPage(<MachineMaintenancePage />, true)}
              </PermissionRoute>
            }
          >
            <Route
              index
              element={
                <Navigate to="/machine-maintenance/assets/list" replace />
              }
            />

            <Route
              path="assets/list"
              element={withPermissionRoute(
                renderLazyPage(<AssetListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/assets/list",
                "List of Assets",
              )}
            />
            <Route
              path="assets/register"
              element={withPermissionRoute(
                renderLazyPage(<AssetListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/assets/register",
                "Machine Registration",
              )}
            />
            <Route
              path="assets/register/:id"
              element={withPermissionRoute(
                renderLazyPage(<AssetListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/assets/register",
                "Machine Registration",
              )}
            />

            <Route
              path="spare-master/list"
              element={withPermissionRoute(
                renderLazyPage(<SpareListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/spare-master/list",
                "List of Spares",
              )}
            />
            <Route
              path="spare-master/register"
              element={withPermissionRoute(
                renderLazyPage(<SpareListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/spare-master/register",
                "Spare Registration",
              )}
            />
            <Route
              path="spare-master/register/:id"
              element={withPermissionRoute(
                renderLazyPage(<SpareListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/spare-master/register",
                "Spare Registration",
              )}
            />

            <Route
              path="tasks/list"
              element={withPermissionRoute(
                renderLazyPage(<TaskListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/tasks/list",
                "List of Tasks",
              )}
            />
            <Route
              path="tasks/schedule"
              element={withPermissionRoute(
                renderLazyPage(<TaskListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/tasks/schedule",
                "Schedule",
              )}
            />
            <Route
              path="tasks/schedule/:id"
              element={withPermissionRoute(
                renderLazyPage(<TaskListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/tasks/schedule",
                "Schedule",
              )}
            />

            <Route
              path="user-allocation/list"
              element={withPermissionRoute(
                renderLazyPage(<UserListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/user-allocation/list",
                "List of Users",
              )}
            />
            <Route
              path="user-allocation/allocation"
              element={withPermissionRoute(
                renderLazyPage(<UserListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/user-allocation/allocation",
                "Allocation",
              )}
            />
            <Route
              path="user-allocation/allocation/:id"
              element={withPermissionRoute(
                renderLazyPage(<UserListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/user-allocation/allocation",
                "Allocation",
              )}
            />

            <Route
              path="vendors/list"
              element={withPermissionRoute(
                renderLazyPage(<VendorListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/vendors/list",
                "List of Vendors",
              )}
            />
            <Route
              path="vendors/register"
              element={withPermissionRoute(
                renderLazyPage(<VendorListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/vendors/register",
                "Vendor Registration",
              )}
            />
            <Route
              path="vendors/register/:id"
              element={withPermissionRoute(
                renderLazyPage(<VendorListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/vendors/register",
                "Vendor Registration",
              )}
            />

            <Route
              path="consume/breakdown-list"
              element={withPermissionRoute(
                renderLazyPage(<BreakdownListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/consume/breakdown-list",
                "Breakdown List",
              )}
            />
            <Route
              path="consume/entry"
              element={withPermissionRoute(
                renderLazyPage(<ConsumeEntryPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/consume/entry",
                "Consume Entry",
              )}
            />
            <Route
              path="complient"
              element={
                <Navigate to="/machine-maintenance/complient/assets" replace />
              }
            />
            <Route
              path="complient/assets"
              element={withPermissionRoute(
                renderLazyPage(<ComplaintAssetsPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/complient/assets",
                "Assets",
              )}
            />
            <Route
              path="complient/spare"
              element={withPermissionRoute(
                renderLazyPage(<ComplaintSparePage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/complient/spare",
                "Spare",
              )}
            />
            <Route
              path="complient/task-master"
              element={withPermissionRoute(
                renderLazyPage(<ComplaintTaskMasterPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/complient/task-master",
                "Task Master",
              )}
            />
            <Route
              path="complient/vendor-supplier"
              element={withPermissionRoute(
                renderLazyPage(<ComplaintVendorPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/complient/vendor-supplier",
                "Vendor/Supplier",
              )}
            />

            <Route
              path="configure"
              element={
                <Navigate
                  to="/machine-maintenance/configure/department"
                  replace
                />
              }
            />
            <Route
              path="configure/department"
              element={withPermissionRoute(
                renderLazyPage(<DepartmentListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/department",
                "Department",
              )}
            />
            <Route
              path="configure/shift-timing"
              element={withPermissionRoute(
                renderLazyPage(<ShiftTimingListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/shift-timing",
                "Shift Timing",
              )}
            />
            <Route
              path="configure/plant-site"
              element={withPermissionRoute(
                renderLazyPage(<PlantSiteListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/plant-site",
                "Plant Site",
              )}
            />
            <Route
              path="configure/status"
              element={withPermissionRoute(
                renderLazyPage(<StatusListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/status",
                "Status",
              )}
            />
            <Route
              path="configure/critical-level"
              element={withPermissionRoute(
                renderLazyPage(<CriticalLevelListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/critical-level",
                "Critical Level",
              )}
            />
            <Route
              path="configure/unit-of-measure"
              element={withPermissionRoute(
                renderLazyPage(<UnitOfMeasureListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/unit-of-measure",
                "Units of Measure",
              )}
            />
            <Route
              path="configure/task-category"
              element={withPermissionRoute(
                renderLazyPage(<TaskCategoryListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/task-category",
                "Task Category",
              )}
            />
            <Route
              path="configure/frequency"
              element={withPermissionRoute(
                renderLazyPage(<FrequencyListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/frequency",
                "Frequency",
              )}
            />
            <Route
              path="configure/contract-type"
              element={withPermissionRoute(
                renderLazyPage(<ContractTypeListPage />),
                machineMaintenanceSidebarItems,
                "/machine-maintenance/configure/contract-type",
                "Contract Type",
              )}
            />
          </Route>

          <Route
            path="/spares/*"
            element={
              <PermissionRoute
                sidebarItems={sparesSidebarItems}
                requireModuleAccess
              >
                {renderLazyPage(<SparesPage />, true)}
              </PermissionRoute>
            }
          />

          <Route
            path="/inventory/*"
            element={
              <PermissionRoute
                sidebarItems={inventorySidebarItems}
                requireModuleAccess
              >
                {renderLazyPage(<InventoryPage />, true)}
              </PermissionRoute>
            }
          >
            <Route
              path="inbound"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  featurePath="/inventory/inbound"
                  featureLabel="Inbound"
                >
                  {renderLazyPage(<InventoryTransactionPage type="inbound" />)}
                </PermissionRoute>
              }
            />
            <Route
              path="outbound"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  featurePath="/inventory/outbound"
                  featureLabel="Outbound"
                >
                  {renderLazyPage(<InventoryTransactionPage type="outbound" />)}
                </PermissionRoute>
              }
            />
            <Route
              path="goodslist/list"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  featurePath="/inventory/goodslist/list"
                  featureLabel="Goods List"
                >
                  {renderLazyPage(<InventoryMasterListPage />)}
                </PermissionRoute>
              }
            />
            <Route
              path="warehouses"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  featurePath="/inventory/warehouses"
                  featureLabel="Warehouses"
                >
                  {renderLazyPage(<InventoryWarehousePage />)}
                </PermissionRoute>
              }
            />
            <Route
              path="upload-center"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  featurePath="/inventory/upload-center"
                  featureLabel="Upload Center"
                >
                  {renderLazyPage(<InventoryUploadCenterPage />)}
                </PermissionRoute>
              }
            />
            <Route
              path="download-center"
              element={
                <PermissionRoute
                  sidebarItems={inventorySidebarItems}
                  featurePath="/inventory/download-center"
                  featureLabel="Download Center"
                >
                  {renderLazyPage(<InventoryDownloadCenterPage />)}
                </PermissionRoute>
              }
            />
          </Route>

          <Route
            path="/ecom/*"
            element={
              <PermissionRoute
                sidebarItems={ecomSidebarItems}
                requireModuleAccess
              >
                {renderLazyPage(<EcomPage />, true)}
              </PermissionRoute>
            }
          >
            <Route
              path=""
              element={withPermissionRoute(
                renderLazyPage(<EcomOverviewPage />),
                ecomSidebarItems,
                "/ecom",
                "Ecom Products",
              )}
            />
            <Route
              path="amazon"
              element={withPermissionRoute(
                renderLazyPage(<EcomAmazonPage />),
                ecomSidebarItems,
                "/ecom/amazon",
                "Amazon",
              )}
            />
            <Route
              path="flipkart"
              element={withPermissionRoute(
                renderLazyPage(<EcomFlipkartPage />),
                ecomSidebarItems,
                "/ecom/flipkart",
                "Flipkart",
              )}
            />
            <Route
              path="messho"
              element={withPermissionRoute(
                renderLazyPage(<EcomMesshoPage />),
                ecomSidebarItems,
                "/ecom/messho",
                "Meesho",
              )}
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
