/**
 * Checks if an ID exists in a space-separated list of IDs.
 * This is safer than using String.prototype.includes() which can cause false positives
 * when the target ID is a substring of another ID in the list.
 *
 * @param idList - The space-separated list of IDs (e.g., "id1 id2 id3")
 * @param targetId - The ID to search for
 * @returns true if the target ID exists in the list, false otherwise
 */
export function hasIdInList(idList: string | undefined, targetId: string): boolean {
  if (!idList) return false;
  return idList.split(" ").includes(targetId);
}
