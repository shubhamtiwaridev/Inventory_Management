import createMasterRoute from "../shared/createMasterRoute.js";
import {
  createFrequency,
  deleteFrequency,
  getFrequencies,
  getFrequencyById,
  updateFrequency,
} from "./frequencyController.js";

export default createMasterRoute({
  getItems: getFrequencies,
  getItemById: getFrequencyById,
  createItem: createFrequency,
  updateItem: updateFrequency,
  deleteItem: deleteFrequency,
});
