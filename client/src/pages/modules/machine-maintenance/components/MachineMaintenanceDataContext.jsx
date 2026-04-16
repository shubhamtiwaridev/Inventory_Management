import { createContext, useContext, useMemo, useState } from "react";
import { pageTableData } from "./machineMaintenanceUi.jsx";

const MachineMaintenanceDataContext = createContext(null);

const withId = (rows = []) =>
  rows.map((row, index) => ({
    id: row.id || Date.now() + index,
    ...row,
  }));

export const MachineMaintenanceDataProvider = ({ children }) => {
  const [assets, setAssets] = useState(withId(pageTableData.assetList.rows));
  const [spares, setSpares] = useState(withId(pageTableData.spareList.rows));
  const [tasks, setTasks] = useState(withId(pageTableData.taskList.rows));
  const [users, setUsers] = useState(withId(pageTableData.userList.rows));
  const [vendors, setVendors] = useState(withId(pageTableData.vendorList.rows));
  const [breakdowns] = useState(withId(pageTableData.breakdownList.rows));
  const [consume] = useState(withId(pageTableData.consumeList.rows));

  const addAsset = (payload) => {
    const row = {
      id: Date.now(),
      assetCode: payload.assetCode || "-",
      assetName: payload.assetName || "-",
      category: payload.category || "-",
      serialNumber: payload.serialNumber || "-",
      department: payload.department || "-",
      installDate: payload.installDate || "-",
      status: payload.status || "Active",
    };
    setAssets((prev) => [row, ...prev]);
    return row;
  };

  const addSpare = (payload) => {
    const row = {
      id: Date.now(),
      spareCode: payload.spareCode || "-",
      spareName: payload.spareName || "-",
      partNo: payload.partNo || "-",
      unit: payload.unit || "-",
      minQty: payload.minQty || "-",
      maxQty: payload.maxQty || "-",
      vendor: payload.vendor || "-",
      status: "Active",
    };
    setSpares((prev) => [row, ...prev]);
    return row;
  };

  const addTask = (payload) => {
    const row = {
      id: Date.now(),
      taskCode: payload.taskCode || "-",
      taskName: payload.taskName || "-",
      frequency: payload.frequency || "-",
      assignedUser: payload.assignedUser || "-",
      startDate: payload.startDate || "-",
      endDate: payload.endDate || "-",
      shift: payload.shift || "-",
      status: "Active",
    };
    setTasks((prev) => [row, ...prev]);
    return row;
  };

  const addUser = (payload) => {
    const row = {
      id: Date.now(),
      employeeId: payload.employeeId || "-",
      userName: payload.userName || "-",
      machine: payload.machine || "-",
      task: payload.task || "-",
      shift: payload.shift || "-",
      status: "Active",
    };
    setUsers((prev) => [row, ...prev]);
    return row;
  };

  const addVendor = (payload) => {
    const row = {
      id: Date.now(),
      vendorCode: payload.vendorCode || "-",
      vendorName: payload.vendorName || "-",
      contactPerson: payload.contactPerson || "-",
      phone: payload.phone || "-",
      email: payload.email || "-",
      city: payload.city || "-",
      contractType: payload.contractType || "-",
      status: "Active",
    };
    setVendors((prev) => [row, ...prev]);
    return row;
  };

  const value = useMemo(
    () => ({
      assets,
      spares,
      tasks,
      users,
      vendors,
      breakdowns,
      consume,
      addAsset,
      addSpare,
      addTask,
      addUser,
      addVendor,
    }),
    [assets, spares, tasks, users, vendors, breakdowns, consume],
  );

  return (
    <MachineMaintenanceDataContext.Provider value={value}>
      {children}
    </MachineMaintenanceDataContext.Provider>
  );
};

export const useMachineMaintenanceData = () => {
  const context = useContext(MachineMaintenanceDataContext);
  if (!context) {
    throw new Error(
      "useMachineMaintenanceData must be used inside MachineMaintenanceDataProvider",
    );
  }
  return context;
};
