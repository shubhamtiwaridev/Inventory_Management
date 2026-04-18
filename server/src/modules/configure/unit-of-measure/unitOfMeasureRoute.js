import createMasterRoute from "../shared/createMasterRoute.js";
import {
  createUnitOfMeasure,
  deleteUnitOfMeasure,
  getUnitOfMeasureById,
  getUnitsOfMeasure,
  updateUnitOfMeasure,
} from "./unitOfMeasureController.js";

export default createMasterRoute({
  getItems: getUnitsOfMeasure,
  getItemById: getUnitOfMeasureById,
  createItem: createUnitOfMeasure,
  updateItem: updateUnitOfMeasure,
  deleteItem: deleteUnitOfMeasure,
});
