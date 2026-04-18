import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    taskCode: {
      type: String,
      required: [true, "Task code is required"],
      unique: true,
      trim: true,
    },
    taskName: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
    },
    taskCategory: {
      type: String,
      required: [true, "Task category is required"],
      trim: true,
    },
    applicableMachine: {
      type: String,
      required: [true, "Applicable machine is required"],
      trim: true,
    },
    frequency: {
      type: String,
      required: [true, "Frequency is required"],
      trim: true,
    },
    assignedUser: {
      type: String,
      required: [true, "Assigned user is required"],
      trim: true,
    },
    shift: {
      type: String,
      default: "",
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    estimatedDuration: {
      type: String,
      trim: true,
      default: "",
    },
    requiredManpower: {
      type: String,
      trim: true,
      default: "",
    },
    requiredTools: {
      type: String,
      trim: true,
      default: "",
    },
    requiredSpareParts: {
      type: String,
      trim: true,
      default: "",
    },
    checklistSteps: {
      type: String,
      trim: true,
      default: "",
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    safetyPrecautions: {
      type: String,
      trim: true,
      default: "",
    },
    skillRequirement: {
      type: String,
      trim: true,
      default: "",
    },
    escalationLevel: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      default: "Active",
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
      default: "",
    },
    updatedBy: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("MachineMaintenanceTask", taskSchema);

export default Task;
