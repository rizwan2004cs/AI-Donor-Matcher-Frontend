export const CATEGORY_COLORS = {
  FOOD: "#EF4444", // red
  CLOTHING: "#3B82F6", // blue
  MEDICINE: "#22C55E", // green
  EDUCATION: "#EAB308", // yellow
  HOUSEHOLD: "#F97316", // orange
  OTHER: "#A855F7", // purple
};

export const CATEGORY_LABELS = {
  FOOD: "Food",
  CLOTHING: "Clothing",
  MEDICINE: "Medicine",
  EDUCATION: "Education",
  HOUSEHOLD: "Household",
  OTHER: "Other",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(
  ([value, label]) => ({ value, label })
);
