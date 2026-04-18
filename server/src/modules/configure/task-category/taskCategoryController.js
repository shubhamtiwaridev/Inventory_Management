import createMasterController from "../shared/createMasterController.js";
import TaskCategory from "./taskCategoryModel.js";

const controller = createMasterController(
  TaskCategory,
  "taskCategory",
  "Task Category",
);

export const getTaskCategories = controller.getItems;
export const getTaskCategoryById = controller.getItemById;
export const createTaskCategory = controller.createItem;
export const updateTaskCategory = controller.updateItem;
export const deleteTaskCategory = controller.deleteItem;
