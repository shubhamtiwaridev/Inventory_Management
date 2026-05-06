import { useState } from "react";
import { Box } from "@mui/material";
import MachineMaintenanceListView from "../machine-maintenance/components/MachineMaintenanceListView.jsx";
import { brand } from "../machine-maintenance/components/machineMaintenanceUi.jsx";

const logActivityColumns = [
  { key: "userEmail", label: "User Email", width: "260px" },
  { key: "userName", label: "User Name", width: "220px" },
  { key: "role", label: "Role", width: "180px" },
  { key: "action", label: "Action", width: "220px" },
  { key: "time", label: "Time", width: "220px", nowrap: true },
];

const LogActivityPage = () => {
  const [rows, setRows] = useState([]);

  const handleDelete = (row) => {
    setRows((prev) => prev.filter((item) => item.id !== row.id));
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: brand.pageBg,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <MachineMaintenanceListView
        title="Log Activity"
        columns={logActivityColumns}
        rows={rows}
        showPrimaryAction={false}
        showActions
        onDelete={handleDelete}
        onRefresh={() => setRows([])}
      />
    </Box>
  );
};

export default LogActivityPage;
