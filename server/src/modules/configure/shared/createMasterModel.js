import mongoose from "mongoose";

const createMasterModel = (modelName, fieldName, collectionName) => {
  const schema = new mongoose.Schema(
    {
      [fieldName]: {
        type: String,
        required: true,
        trim: true,
        unique: true,
      },
      createdBy: {
        type: String,
        trim: true,
        default: "System",
      },
    },
    {
      timestamps: true,
      collection: collectionName,
    },
  );

  return mongoose.models[modelName] || mongoose.model(modelName, schema);
};

export default createMasterModel;
