import PlantSite from "./plantSiteModel.js";

const getUserName = (req) =>
  req.user?.name || req.user?.username || req.user?.email || "System";

export const getPlantSites = async (req, res) => {
  try {
    const plantSites = await PlantSite.find().sort({ createdAt: -1 });
    res.status(200).json({ data: plantSites });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plant sites" });
  }
};

export const getPlantSiteById = async (req, res) => {
  try {
    const plantSite = await PlantSite.findById(req.params.id);

    if (!plantSite) {
      return res.status(404).json({ message: "Plant site not found" });
    }

    res.status(200).json({ data: plantSite });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plant site" });
  }
};

export const createPlantSite = async (req, res) => {
  try {
    const plantSiteValue = String(req.body.plantSite || "").trim();

    if (!plantSiteValue) {
      return res.status(400).json({ message: "Plant site is required" });
    }

    const existingPlantSite = await PlantSite.findOne({
      plantSite: new RegExp(`^${plantSiteValue}$`, "i"),
    });

    if (existingPlantSite) {
      return res.status(400).json({ message: "Plant site already exists" });
    }

    const plantSite = await PlantSite.create({
      plantSite: plantSiteValue,
      createdBy: getUserName(req),
    });

    res.status(201).json({
      message: "Plant site created successfully",
      data: plantSite,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create plant site" });
  }
};

export const updatePlantSite = async (req, res) => {
  try {
    const plantSiteValue = String(req.body.plantSite || "").trim();

    if (!plantSiteValue) {
      return res.status(400).json({ message: "Plant site is required" });
    }

    const existingPlantSite = await PlantSite.findOne({
      _id: { $ne: req.params.id },
      plantSite: new RegExp(`^${plantSiteValue}$`, "i"),
    });

    if (existingPlantSite) {
      return res.status(400).json({ message: "Plant site already exists" });
    }

    const plantSite = await PlantSite.findByIdAndUpdate(
      req.params.id,
      {
        plantSite: plantSiteValue,
        createdBy: getUserName(req),
      },
      { new: true, runValidators: true },
    );

    if (!plantSite) {
      return res.status(404).json({ message: "Plant site not found" });
    }

    res.status(200).json({
      message: "Plant site updated successfully",
      data: plantSite,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update plant site" });
  }
};

export const deletePlantSite = async (req, res) => {
  try {
    const plantSite = await PlantSite.findByIdAndDelete(req.params.id);

    if (!plantSite) {
      return res.status(404).json({ message: "Plant site not found" });
    }

    res.status(200).json({ message: "Plant site deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete plant site" });
  }
};
