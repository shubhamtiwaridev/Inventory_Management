import createMasterController from "../shared/createMasterController.js";
import Frequency from "./frequencyModel.js";

const controller = createMasterController(Frequency, "frequency", "Frequency");

export const getFrequencies = controller.getItems;
export const getFrequencyById = controller.getItemById;
export const createFrequency = controller.createItem;
export const updateFrequency = controller.updateItem;
export const deleteFrequency = controller.deleteItem;
