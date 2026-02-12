/**
 * Utility to normalize MongoDB documents by mapping _id to id
 */
type IdLike = { toString: () => string } | string;

function toIdString(id: unknown): string {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && 'toString' in id && typeof id.toString === 'function') {
    return id.toString();
  }
  return '';
}

export function normalizeId<T extends { _id?: IdLike; id?: string }>(doc: T): T & { id: string } {
  return {
    ...doc,
    id: toIdString(doc._id) || doc.id || ''
  };
}

export function normalizeIds<T extends { _id?: IdLike; id?: string }>(docs: T[]): Array<T & { id: string }> {
  if (!Array.isArray(docs)) return [];
  return docs.map(normalizeId);
}
