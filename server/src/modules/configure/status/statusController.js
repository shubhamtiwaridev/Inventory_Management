import createMasterController from "../shared/createMasterController.js";
import Status from "./statusModel.js";

const controller = createMasterController(Status, "status", "Status");

export const getStatuses = controller.getItems;
export const getStatusById = controller.getItemById;
export const createStatus = controller.createItem;
export const updateStatus = controller.updateItem;
export const deleteStatus = controller.deleteItem;
