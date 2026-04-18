import createMasterModel from "../shared/createMasterModel.js";

const ContractType = createMasterModel(
  "ConfigureContractType",
  "contractType",
  "configure_contract_types",
);

export default ContractType;
