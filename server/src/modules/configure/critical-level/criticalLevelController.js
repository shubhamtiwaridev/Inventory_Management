import createMasterController from "../shared/createMasterController.js";
import CriticalLevel from "./criticalLevelModel.js";

const controller = createMasterController(
  CriticalLevel,
  "criticalLevel",
  "Critical Level",
);

export const getCriticalLevels = controller.getItems;
export const getCriticalLevelById = controller.getItemById;
export const createCriticalLevel = controller.createItem;
export const updateCriticalLevel = controller.updateItem;
export const deleteCriticalLevel = controller.deleteItem;
