import createMasterModel from "../shared/createMasterModel.js";

const Status = createMasterModel(
  "ConfigureStatus",
  "status",
  "configure_statuses",
);

export default Status;
