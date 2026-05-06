import ConfigureMasterPage from "./ConfigureMasterPage.jsx";
import {
  createTaskCategory,
  deleteTaskCategory,
  getTaskCategories,
  getTaskCategoryById,
  mapTaskCategoryFormValues,
  mapTaskCategoryListRow,
  updateTaskCategory,
} from "./configureApi.js";

const taskCategoryConfig = {
  createDialogTitle: "Add New Task Category",
  editDialogTitle: "Update Task Category",
  searchPlaceholder: "Search Word",
  emptyMessage: "No task category found",
  downloadFileName: "task-category-list.csv",
  deleteLabelKey: "taskCategory",
  tableMinWidth: 900,
  fields: [
    {
      name: "taskCategory",
      label: "Task Category",
      required: true,
    },
  ],
  columns: [
    {
      key: "taskCategory",
      label: "Task Category",
      width: "25%",
      chip: true,
      align: "center",
    },
    {
      key: "createdAt",
      label: "Created Time",
      width: "25%",
      softText: true,
      align: "center",
    },
    {
      key: "updatedAt",
      label: "Updated Time",
      width: "28%",
      softText: true,
      align: "center",
    },
  ],
};

const TaskCategoryListPage = () => {
  return (
    <ConfigureMasterPage
      config={taskCategoryConfig}
      getItems={getTaskCategories}
      getItemById={getTaskCategoryById}
      createItem={createTaskCategory}
      updateItem={updateTaskCategory}
      deleteItem={deleteTaskCategory}
      mapListRow={mapTaskCategoryListRow}
      mapFormValues={mapTaskCategoryFormValues}
    />
  );
};

export default TaskCategoryListPage;
