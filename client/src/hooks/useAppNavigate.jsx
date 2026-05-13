import { startTransition, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { preloadRouteModules } from "../routes/routeModules.js";

const getNavigationPath = (to) => {
  if (typeof to === "string") {
    return to;
  }

  return to?.pathname || "";
};

export const useAppNavigate = () => {
  const navigate = useNavigate();

  return useCallback(
    (to, options) => {
      const pathname = getNavigationPath(to);

      if (pathname) {
        preloadRouteModules(pathname);
      }

      startTransition(() => {
        navigate(to, options);
      });
    },
    [navigate],
  );
};

export { preloadRouteModules };
