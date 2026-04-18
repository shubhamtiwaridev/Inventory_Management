import createMasterRoute from "../shared/createMasterRoute.js";
import {
  createContractType,
  deleteContractType,
  getContractTypeById,
  getContractTypes,
  updateContractType,
} from "./contractTypeController.js";

export default createMasterRoute({
  getItems: getContractTypes,
  getItemById: getContractTypeById,
  createItem: createContractType,
  updateItem: updateContractType,
  deleteItem: deleteContractType,
});
