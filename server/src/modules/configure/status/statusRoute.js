import createMasterRoute from "../shared/createMasterRoute.js";
import {
  createStatus,
  deleteStatus,
  getStatusById,
  getStatuses,
  updateStatus,
} from "./statusController.js";

export default createMasterRoute({
  getItems: getStatuses,
  getItemById: getStatusById,
  createItem: createStatus,
  updateItem: updateStatus,
  deleteItem: deleteStatus,
});
