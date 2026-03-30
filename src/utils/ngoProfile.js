export const NGO_PROFILE_FIELDS = [
  { key: "name", label: "Organization Name" },
  { key: "address", label: "Address" },
  { key: "contactEmail", label: "Contact Email" },
  { key: "contactPhone", label: "Contact Phone" },
  { key: "description", label: "Description" },
  { key: "categoryOfWork", label: "Category of Work" },
];

export function normalizeNgoProfile(profile = {}) {
  const trustLabelMap = {
    NEW: "New",
    ESTABLISHED: "Established",
    TRUSTED: "Trusted",
  };
  const trustLabel =
    typeof profile.trustLabel === "string"
      ? trustLabelMap[profile.trustLabel.toUpperCase()] ?? profile.trustLabel
      : null;

  return {
    name: profile.name ?? profile.organizationName ?? "",
    address: profile.address ?? "",
    contactEmail: profile.contactEmail ?? "",
    contactPhone: profile.contactPhone ?? "",
    description: profile.description ?? "",
    categoryOfWork: profile.categoryOfWork ?? profile.category ?? "",
    photoUrl: profile.photoUrl ?? profile.profilePhotoUrl ?? "",
    trustScore:
      typeof profile.trustScore === "number"
        ? profile.trustScore
        : Number.isFinite(Number(profile.trustScore))
          ? Number(profile.trustScore)
          : null,
    trustLabel,
  };
}

export function getNgoProfileCompletion(normalizedProfile) {
  const filledFields = NGO_PROFILE_FIELDS.filter(({ key }) =>
    Boolean(normalizedProfile?.[key]?.toString().trim())
  );

  return {
    filledCount: filledFields.length,
    totalCount: NGO_PROFILE_FIELDS.length,
    percent: Math.round((filledFields.length / NGO_PROFILE_FIELDS.length) * 100),
    isComplete: filledFields.length === NGO_PROFILE_FIELDS.length,
  };
}
