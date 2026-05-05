import mongoose from "mongoose";
import dotenv from "dotenv";
import Card from "./src/modules/staff/card/cardModel.js";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedCards = async () => {
  try {
    // Clear existing cards
    await Card.deleteMany({});

    const cards = [
      {
        name: "machine-maintenance",
        title: "Machine Maintenance",
        path: "/machine-maintenance",
        icon: "BuildCircleRoundedIcon",
        iconBg: "#EEF8F7",
        iconColor: "#106C6B",
        subtitle: "Open schedules",
        subtitleTone: "success",
        createdBy: "System",
      },
      {
        name: "spares",
        title: "Spares",
        path: "/spares",
        icon: "HandymanRoundedIcon",
        iconBg: "#FFF3E8",
        iconColor: "#D97706",
        subtitle: "Available items",
        subtitleTone: "error",
        createdBy: "System",
      },
      {
        name: "inventory",
        title: "Inventory",
        path: "/inventory",
        icon: "Inventory2RoundedIcon",
        iconBg: "#EEF8F7",
        iconColor: "#0C5A58",
        subtitle: "Current stock",
        subtitleTone: "success",
        createdBy: "System",
      },
      {
        name: "staff",
        title: "Staff",
        path: "/staff",
        icon: "BadgeRoundedIcon",
        iconBg: "#EEF8F7",
        iconColor: "#12807B",
        subtitle: "Active members",
        subtitleTone: "success",
        createdBy: "System",
      },
    ];

    await Card.insertMany(cards);
    console.log("Cards seeded successfully");
  } catch (error) {
    console.error(`Error seeding cards: ${error.message}`);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedCards();
  process.exit(0);
};

runSeed();