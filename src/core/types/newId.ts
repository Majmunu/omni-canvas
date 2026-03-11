import { asNodeId } from './id'
import type { NodeId } from './id'

export function newNodeId(prefix = 'node'): NodeId {
  // crypto.randomUUID is supported in modern browsers; tests run in jsdom with webcrypto.
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  return asNodeId(`${prefix}:${random}`)
}
