export const CATEGORY_COLORS = {
  FOOD: "#EF4444", // red
  CLOTHING: "#0EA5E9", // sky
  MEDICINE: "#10B981", // emerald
  EDUCATION: "#F59E0B", // amber
  HOUSEHOLD: "#F97316", // orange
  OTHER: "#8B5CF6", // violet
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
