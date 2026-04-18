import createMasterModel from "../shared/createMasterModel.js";

const TaskCategory = createMasterModel(
  "ConfigureTaskCategory",
  "taskCategory",
  "configure_task_categories",
);

export default TaskCategory;
