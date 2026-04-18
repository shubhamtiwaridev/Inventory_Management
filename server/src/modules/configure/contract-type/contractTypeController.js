import createMasterController from "../shared/createMasterController.js";
import ContractType from "./contractTypeModel.js";

const controller = createMasterController(
  ContractType,
  "contractType",
  "Contract Type",
);

export const getContractTypes = controller.getItems;
export const getContractTypeById = controller.getItemById;
export const createContractType = controller.createItem;
export const updateContractType = controller.updateItem;
export const deleteContractType = controller.deleteItem;
