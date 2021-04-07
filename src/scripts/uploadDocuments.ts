import client from './client'
import { TransactionResponse } from '../types'

function strToDocuments(jsonStr: string) {
  try {
    const parsed = JSON.parse(jsonStr)
    const documents = Array.isArray(parsed) ? parsed : [parsed]
    return documents
  } catch (error) {
    return "Couldn't parse"
  }
}

export default async function uploadDocuments(jsonStr: string) {
  const documents = strToDocuments(jsonStr)
  if (documents === "Couldn't parse") {
    return "Couldn't parse JSON"
  }
  if (documents.length === 0) {
    return 'No documents to upload'
  }

  let creationTransaction = client.transaction()

  for (const document of documents) {
    if (typeof document !== 'object') {
      return 'Invalid document'
    }
    if (!document._type) {
      return 'Document missing _type'
    }
    creationTransaction = creationTransaction.create(document)
  }
  const res: TransactionResponse = await creationTransaction.commit()
  return res.results
}
