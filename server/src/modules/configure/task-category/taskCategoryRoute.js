import createMasterRoute from "../shared/createMasterRoute.js";
import {
  createTaskCategory,
  deleteTaskCategory,
  getTaskCategories,
  getTaskCategoryById,
  updateTaskCategory,
} from "./taskCategoryController.js";

export default createMasterRoute({
  getItems: getTaskCategories,
  getItemById: getTaskCategoryById,
  createItem: createTaskCategory,
  updateItem: updateTaskCategory,
  deleteItem: deleteTaskCategory,
});
