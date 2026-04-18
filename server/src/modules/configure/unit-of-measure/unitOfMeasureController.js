import createMasterController from "../shared/createMasterController.js";
import UnitOfMeasure from "./unitOfMeasureModel.js";

const controller = createMasterController(
  UnitOfMeasure,
  "unitOfMeasure",
  "Unit of Measure",
);

export const getUnitsOfMeasure = controller.getItems;
export const getUnitOfMeasureById = controller.getItemById;
export const createUnitOfMeasure = controller.createItem;
export const updateUnitOfMeasure = controller.updateItem;
export const deleteUnitOfMeasure = controller.deleteItem;
