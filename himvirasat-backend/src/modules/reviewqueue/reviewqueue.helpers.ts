import { RawContribution } from "@himvirasat/shared";

export function formatContribution(
  item: RawContribution | null,
): RawContribution | null {
  if (!item) return item;
  return {
    ...item,
    contributor_name:
      (item as any).users?.full_name ||
      (item as any).users?.username ||
      "Contributor",
    dialect_name: item.dialect_name || "Standard",
    category_name: (item as any).categories?.name || "General Vocabulary",
    part_of_speech_name:
      (item as any).parts_of_speech?.name || "General",
  };
}

export function sanitizeContributionInput(
  input: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const {
    id,
    categories,
    users,
    parts_of_speech,
    category_name,
    contributor_name,
    part_of_speech_name,
    review_comments,
    history,
    created_at,
    updated_at,
    ...cleanColumns
  } = input || {};

  return cleanColumns;
}
