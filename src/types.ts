interface BaseSanityDoc {
  _id: string
  _createdAt: string
  _updatedAt: string
  _rev: string
  _type: string
}

export interface SanityDoc extends BaseSanityDoc {
  [key: string]: any
}

export type UtilitiesT = 'changeDocumentType' | 'uploadDocument'

export interface TransactionResult {
  id: string
  operation: 'create' | 'delete' | string
}

export interface TransactionResponse {
  documentIds?: string[]
  transactionId?: string
  results?: TransactionResult[]
}
