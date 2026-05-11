import { inventorySidebarItems } from "../components/sidebars/inventorySidebarItems";
import { machineMaintenanceSidebarItems } from "../components/sidebars/machineMaintenanceSidebarItems";
import { sparesSidebarItems } from "../components/sidebars/sparesSidebarItems";

export const ACTIONS = ["create", "update", "delete"];

export const ACTION_LABELS = {
  create: "New",
  update: "Update",
  delete: "Delete",
};

const LOG_ACTIVITY_PERMISSION_ACTIONS = [
  { action: "create", label: "Export CSV" },
  { action: "update", label: "Export Excel" },
];

const createDefaultActions = (actionState = true) =>
  ACTIONS.reduce((acc, action) => {
    acc[action] = actionState;
    return acc;
  }, {});

const normalizeKey = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, "_");

const normalizePath = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\/+$/, "");

const isSuperadminRole = (roles = "") =>
  String(roles || "")
    .trim()
    .toLowerCase() === "superadmin";

const getSidebarRootKey = (path = "") => {
  if (!path || typeof path !== "string") return "";

  const parts = path.split("/").filter(Boolean);
  return normalizeKey(parts[0] || "");
};

const formatCardLabel = (value = "") =>
  String(value || "")
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const buildPermissionKey = (cardName, featureLabel) =>
  `${normalizeKey(cardName)}_${normalizeKey(featureLabel)}`;

const isLogActivityPermission = (cardName, feature = {}) => {
  const normalizedCardName = normalizeKey(cardName);
  const normalizedFeaturePath = normalizePath(feature?.path || "");

  return (
    normalizedCardName === "log_activity" ||
    normalizedFeaturePath === "/log-activity"
  );
};

export const getPermissionActionOptions = (cardName, feature = {}) => {
  if (isLogActivityPermission(cardName, feature)) {
    return LOG_ACTIVITY_PERMISSION_ACTIONS;
  }

  return ACTIONS.map((action) => ({
    action,
    label: ACTION_LABELS[action] || action,
  }));
};

const allSidebarItems = [
  ...inventorySidebarItems,
  ...machineMaintenanceSidebarItems,
  ...sparesSidebarItems,
];

const buildCardGroups = (sidebarItems) => {
  const groups = {};

  sidebarItems.forEach((item) => {
    const rootKey = getSidebarRootKey(item.path);

    if (!rootKey || rootKey === "dashboard") return;

    if (!groups[rootKey]) {
      groups[rootKey] = {
        name: rootKey,
        label: formatCardLabel(rootKey),
        sidebarItem: {
          label: formatCardLabel(rootKey),
          path: `/${rootKey}`,
          children: [],
        },
        sections: [],
      };
    }

    const group = groups[rootKey];
    group.sections.push({
      ...item,
      children: Array.isArray(item.children) ? [...item.children] : [],
    });

    if (Array.isArray(item.children) && item.children.length > 0) {
      group.sidebarItem.children.push(...item.children);
      return;
    }

    group.sidebarItem.children.push(item);
  });

  return Object.values(groups);
};

export const ALL_CARDS = buildCardGroups(allSidebarItems);

const createStandalonePermissionCard = (card) => {
  const cardName =
    String(card?.name || card?.title || card?.label || "")
      .trim()
      .toLowerCase()
      .replace(/[-\s]+/g, "_") || "card";
  const cardTitle =
    String(card?.title || card?.name || card?.label || "")
      .trim() || formatCardLabel(cardName);
  const cardPath = String(card?.path || `/${cardName}`).trim() || `/${cardName}`;

  return {
    ...card,
    name: cardName,
    title: cardTitle,
    label: cardTitle,
    sidebarItem: {
      label: cardTitle,
      path: cardPath,
      children: [
        {
          label: cardTitle,
          path: cardPath,
        },
      ],
    },
    sections: [
      {
        label: cardTitle,
        path: cardPath,
        children: [
          {
            label: cardTitle,
            path: cardPath,
          },
        ],
      },
    ],
  };
};

export const getCardSections = (card) =>
  Array.isArray(card?.sections) && card.sections.length > 0
    ? card.sections
    : card?.sidebarItem
      ? [card.sidebarItem]
      : [];

export const getSectionFeatures = (section) => {
  const children = Array.isArray(section?.children) ? section.children : [];
  return children.length > 0 ? children : section ? [section] : [];
};

const getAssignedCardNames = (assignedCards = []) =>
  assignedCards
    .map((card) => normalizeKey(card?.name || card?.title || card))
    .filter(Boolean);

export const getPermissionCardsForStaffType = (staffType) => {
  const assignedCards = Array.isArray(staffType?.assignedCards)
    ? staffType.assignedCards
    : [];
  const assignedNames = getAssignedCardNames(assignedCards);
  const matchedCards = ALL_CARDS.filter((card) =>
    assignedNames.includes(normalizeKey(card.name)),
  );
  const matchedNames = new Set(matchedCards.map((card) => normalizeKey(card.name)));
  const fallbackCards = assignedCards
    .filter((card) => {
      const cardName = normalizeKey(card?.name || card?.title || card);
      return cardName && !matchedNames.has(cardName);
    })
    .map((card) => createStandalonePermissionCard(card));

  return [...matchedCards, ...fallbackCards];
};

export const generateCardPermissions = (
  card,
  enabled = true,
  actionState = true,
) => {
  const permissions = {};
  const children = getCardSections(card).flatMap((section) =>
    getSectionFeatures(section),
  );

  children.forEach((child) => {
    const featureKey = buildPermissionKey(card.name, child.label);

    permissions[featureKey] = {
      card: card.name,
      feature: child.label,
      path: child.path,
      enabled,
      actions: createDefaultActions(actionState),
    };
  });

  return permissions;
};

export const getDefaultPermissionRecord = (
  cardName,
  feature,
  enabled = true,
  actionState = true,
) => ({
  card: cardName,
  feature: feature.label,
  path: feature.path,
  enabled,
  actions: createDefaultActions(actionState),
});

export const filterUserPermissionsForCards = (
  staffTypeCards = [],
  permissions = {},
  { initializeMissing = false, enabled = true, actionState = true } = {},
) => {
  const filteredPermissions = {};
  const assignedNames = getAssignedCardNames(staffTypeCards);

  ALL_CARDS.filter((card) =>
    assignedNames.includes(normalizeKey(card.name)),
  ).forEach((card) => {
    getCardSections(card).forEach((section) => {
      getSectionFeatures(section).forEach((feature) => {
        const featureKey = buildPermissionKey(card.name, feature.label);
        const existingPermission = permissions?.[featureKey];
        const defaultPermission = getDefaultPermissionRecord(
          card.name,
          feature,
          enabled,
          actionState,
        );

        if (existingPermission) {
          filteredPermissions[featureKey] = {
            ...defaultPermission,
            ...existingPermission,
            card: card.name,
            feature: feature.label,
            path: feature.path,
            enabled: Boolean(existingPermission.enabled),
            actions: {
              ...defaultPermission.actions,
              ...(existingPermission.actions || {}),
            },
          };
          return;
        }

        if (initializeMissing) {
          filteredPermissions[featureKey] = defaultPermission;
        }
      });
    });
  });

  return filteredPermissions;
};

export const initializeUserPermissions = (
  staffTypeCards = [],
  enabled = true,
  actionState = true,
) =>
  filterUserPermissionsForCards(staffTypeCards, {}, {
    initializeMissing: true,
    enabled,
    actionState,
  });

export const getFeaturePermission = (
  userPermissions,
  cardName,
  featureName,
) => {
  if (!userPermissions || typeof userPermissions !== "object") return null;

  const featureKey = buildPermissionKey(cardName, featureName);
  return userPermissions[featureKey] || null;
};

const hasExplicitPermissions = (user) =>
  user?.permissions &&
  typeof user.permissions === "object" &&
  Object.keys(user.permissions).length > 0;

const hasAssignedCard = (user, cardName) => {
  if (isSuperadminRole(user?.roles)) return true;

  const assignedCards = user?.staffType?.assignedCards || [];
  const assignedNames = getAssignedCardNames(assignedCards);

  return assignedNames.includes(normalizeKey(cardName));
};

export const isDashboardCardVisible = (user, card) => {
  if (!card || typeof card !== "object") return false;
  if (isSuperadminRole(user?.roles)) return true;

  const cardName = normalizeKey(card.name || card.title || "");
  const cardPath = String(card.path || "").trim();
  const pathRoot = getSidebarRootKey(cardPath);
  const hasCardAccess =
    hasAssignedCard(user, cardName) || hasAssignedCard(user, pathRoot);

  if (!hasCardAccess) return false;
  if (!pathRoot) return true;
  if (!hasAssignedCard(user, pathRoot)) return true;

  return isSidebarFeatureVisible(user, cardPath, card.title || card.name);
};

export const getVisibleDashboardCardsForUser = (cards = [], user) =>
  cards.filter((card) => isDashboardCardVisible(user, card));

const findPermissionByPathOrLabel = (userPermissions, path, label) => {
  const targetPath = normalizePath(path);
  const targetLabel = normalizeKey(label);

  return Object.values(userPermissions || {}).find((permission) => {
    const permissionPath = normalizePath(permission?.path);
    const permissionLabel = normalizeKey(permission?.feature);

    return (
      permissionPath === targetPath ||
      targetPath.startsWith(`${permissionPath}/`) ||
      permissionLabel === targetLabel
    );
  });
};

export const isSidebarFeatureVisible = (user, path, label) => {
  if (isSuperadminRole(user?.roles)) return true;

  const cardName = getSidebarRootKey(path);

  if (!hasAssignedCard(user, cardName)) return false;

  if (!hasExplicitPermissions(user)) return true;

  const permission = findPermissionByPathOrLabel(user.permissions, path, label);

  return Boolean(permission?.enabled);
};

export const hasActionPermission = (user, path, action) => {
  if (isSuperadminRole(user?.roles)) return true;

  const cardName = getSidebarRootKey(path);

  if (!hasAssignedCard(user, cardName)) return false;

  if (!hasExplicitPermissions(user)) return true;

  const permission = findPermissionByPathOrLabel(user.permissions, path, "");

  return Boolean(permission?.enabled && permission?.actions?.[action]);
};

export const getVisibleSidebarItemsForUser = (sidebarItems = [], user) => {
  if (isSuperadminRole(user?.roles)) return sidebarItems;

  const moduleRoot = sidebarItems
    .map((item) => getSidebarRootKey(item.path))
    .find((root) => root && root !== "dashboard");

  return sidebarItems
    .map((item) => {
      const isDashboardItem = normalizePath(item.path) === "/dashboard";
      const itemRoot = isDashboardItem
        ? moduleRoot
        : getSidebarRootKey(item.path);

      if (!hasAssignedCard(user, itemRoot)) return null;

      const children = Array.isArray(item.children) ? item.children : [];

      if (children.length === 0) {
        if (isDashboardItem) return item;

        return isSidebarFeatureVisible(user, item.path, item.label)
          ? item
          : null;
      }

      const visibleChildren = children.filter((child) =>
        isSidebarFeatureVisible(user, child.path, child.label),
      );

      return visibleChildren.length > 0
        ? {
            ...item,
            path: visibleChildren[0].path || item.path,
            children: visibleChildren,
          }
        : null;
    })
    .filter(Boolean);
};

export const hasVisibleSidebarAccess = (sidebarItems = [], user) =>
  getVisibleSidebarItemsForUser(sidebarItems, user).some(
    (item) => normalizePath(item.path) !== "/dashboard",
  );

export const getFirstAccessibleSidebarPath = (sidebarItems = [], user) => {
  const visibleItems = getVisibleSidebarItemsForUser(sidebarItems, user);
  const firstNonDashboardItem = visibleItems.find(
    (item) => normalizePath(item.path) !== "/dashboard",
  );

  if (!firstNonDashboardItem) return "/dashboard";

  const children = Array.isArray(firstNonDashboardItem.children)
    ? firstNonDashboardItem.children
    : [];

  return children[0]?.path || firstNonDashboardItem.path || "/dashboard";
};
