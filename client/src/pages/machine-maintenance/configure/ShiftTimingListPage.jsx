import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createShiftTiming,
  deleteShiftTiming,
  getShiftTimingById,
  getShiftTimings,
  mapShiftTimingFormValues,
  mapShiftTimingListRow,
  updateShiftTiming,
} from "./configureApi.js";

const shiftTimingConfig = {
  createDialogTitle: "Add New Shift Timing",
  editDialogTitle: "Update Shift Timing",
  searchPlaceholder: "Search Word",
  emptyMessage: "No shift timing found",
  downloadFileName: "shift-timing-list.csv",
  deleteLabelKey: "fromTime",
  tableMinWidth: 1100,
  fields: [
    {
      name: "fromTime",
      label: "From Time",
      required: true,
      placeholder: "e.g. 09:00 AM",
    },
    {
      name: "toTime",
      label: "To Time",
      required: true,
      placeholder: "e.g. 06:00 PM",
    },
  ],
  buildPayload: (formData) => ({
    fromTime: String(formData.fromTime || "").trim(),
    toTime: String(formData.toTime || "").trim(),
  }),
  columns: [
    {
      key: "fromTime",
      label: "From Time",
      width: "18%",
      chip: true,
      align: "center",
    },
    {
      key: "toTime",
      label: "To Time",
      width: "18%",
      chip: true,
      align: "center",
    },
    {
      key: "createdAt",
      label: "Created Time",
      width: "22%",
      softText: true,
      align: "center",
    },
    {
      key: "updatedAt",
      label: "Updated Time",
      width: "22%",
      softText: true,
      align: "center",
    },
  ],
};

const ShiftTimingListPage = () => {
  return (
    <ConfigureMasterPage
      config={shiftTimingConfig}
      getItems={getShiftTimings}
      getItemById={getShiftTimingById}
      createItem={createShiftTiming}
      updateItem={updateShiftTiming}
      deleteItem={deleteShiftTiming}
      mapListRow={mapShiftTimingListRow}
      mapFormValues={mapShiftTimingFormValues}
    />
  );
};

export default ShiftTimingListPage;
