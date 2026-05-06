import {
  createLogActivityFromRequest,
  shouldLogActivity,
} from "./logActivityService.js";

const activityLogger = (req, res, next) => {
  const originalJson = res.json.bind(res);
  let responseBody = null;

  res.json = (payload) => {
    responseBody = payload;
    return originalJson(payload);
  };

  res.on("finish", () => {
    if (!shouldLogActivity(req, res)) return;

    createLogActivityFromRequest({ req, res, responseBody }).catch((error) => {
      if (process.env.NODE_ENV !== "production") {
        console.error("ACTIVITY LOG ERROR:", error.message);
      }
    });
  });

  next();
};

export default activityLogger;
