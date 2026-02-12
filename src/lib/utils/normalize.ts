/**
 * Utility to normalize MongoDB documents by mapping _id to id
 */
export function normalizeId<T extends { _id?: any; id?: string }>(doc: T): T & { id: string } {
  if (!doc) return doc as any;
  
  return {
    ...doc,
    id: doc._id?.toString() || doc.id || ''
  };
}

export function normalizeIds<T extends { _id?: any; id?: string }>(docs: T[]): Array<T & { id: string }> {
  if (!Array.isArray(docs)) return [];
  return docs.map(normalizeId);
}
