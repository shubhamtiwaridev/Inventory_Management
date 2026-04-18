import createMasterRoute from "../shared/createMasterRoute.js";
import {
  createCriticalLevel,
  deleteCriticalLevel,
  getCriticalLevelById,
  getCriticalLevels,
  updateCriticalLevel,
} from "./criticalLevelController.js";

export default createMasterRoute({
  getItems: getCriticalLevels,
  getItemById: getCriticalLevelById,
  createItem: createCriticalLevel,
  updateItem: updateCriticalLevel,
  deleteItem: deleteCriticalLevel,
});
