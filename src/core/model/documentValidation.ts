import type { SavedDocument } from '../dto/document'
import type { NodeId } from '../types/id'

export interface DocumentValidationResult {
  ok: boolean
  errors: string[]
}

export function validateDocument(document: SavedDocument): DocumentValidationResult {
  const errors: string[] = []

  if (!document.nodes[document.rootId]) {
    errors.push(`rootId ${document.rootId} must exist in nodes`)
  }

  const rootChildren = document.childrenMap[document.rootId]
  if (!rootChildren) {
    errors.push(`childrenMap must include an entry for rootId ${document.rootId}`)
  }

  for (const [parentIdRaw, children] of Object.entries(document.childrenMap)) {
    const parentId = parentIdRaw as NodeId

    if (!document.nodes[parentId]) {
      errors.push(`childrenMap parentId ${parentIdRaw} must exist in nodes`)
    }

    for (const childId of children) {
      if (!document.nodes[childId]) {
        errors.push(
          `childrenMap references missing childId ${childId} (parentId ${parentIdRaw})`,
        )
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  }
}

/**
 * Best-effort normalization for boundary inputs.
 *
 * P0: only fills in the root entry in childrenMap when missing.
 */
export function normalizeDocument(document: SavedDocument): SavedDocument {
  if (document.childrenMap[document.rootId]) return document

  return {
    ...document,
    childrenMap: {
      ...document.childrenMap,
      [document.rootId]: [],
    },
  }
}
