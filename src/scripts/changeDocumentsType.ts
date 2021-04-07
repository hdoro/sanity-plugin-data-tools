import client from 'part:@sanity/base/client'
import { SanityDoc } from '../types'

function updateId(originalId: string, oldType: string) {
  return `${originalId}-migrated-from-${oldType}`
}

export default async function changeDocumentsType(
  oldType: string,
  newType: string,
) {
  // 1 - Fetch every document of this type
  // And include every document referencing them
  const allDocumentsOfOldType = await client.fetch(
    /* groq */ `
  *[_type == $type] {
    ...,
    "_referencedBy": *[references(^._id)],
  }
  `,
    {
      type: oldType,
    },
  )

  // 2 - Create new documents with old-id-migrated-from-old_type
  let creationTransaction = client.transaction()

  for (const document of allDocumentsOfOldType) {
    creationTransaction = creationTransaction.create({
      // Keep the same data
      ...document,
      // But change the _type & _id
      _type: newType,
      _id: updateId(document._id, oldType),
    })
  }
  await creationTransaction.commit()

  // 3 - Patch every document that references these old ones
  let patchingTransaction = client.transaction()

  // 3.1 - get an array of _ids of old documents for reference
  const allOldIds = allDocumentsOfOldType.map((doc: SanityDoc) => doc._id)

  // 3.2 - get an array with every single document that references any of these original ones
  let documentsToPatch: SanityDoc[] = []
  for (const document of allDocumentsOfOldType) {
    if (
      Array.isArray(document._referencedBy) &&
      document._referencedBy.length
    ) {
      documentsToPatch = [
        ...documentsToPatch,
        ...document._referencedBy.filter(
          (doc: SanityDoc) =>
            !documentsToPatch.find(
              (alreadyPresent) => alreadyPresent._id === doc._id,
            ),
        ),
      ]
    }
  }

  // 3.3 - manipulate each of these documentsToPatch to match new ids
  for (const document of documentsToPatch) {
    // 3.3.1 - ensure the _id of this patched document is up-to-date
    const finalDocumentId = allOldIds.includes(document._id)
      ? updateId(document._id, oldType)
      : document._id

    // 3.3.2 - use a RegExp to replace every instance of allOldIds
    let newDocStr = JSON.stringify(document)
    for (const oldId of allOldIds) {
      const newId = updateId(oldId, oldType)
      const oldRegex = new RegExp(oldId, 'gm')
      newDocStr.replace(oldRegex, newId)
    }

    // 3.3.3 - add this new document as a patch to the transaction
    const newDoc = JSON.parse(newDocStr)
    // 3.3.3.1 - remove every single sanity-provided property to this document before patching to avoid errors
    delete newDoc._id
    delete newDoc._createdAt
    delete newDoc._updatedAt
    delete newDoc._rev
    delete newDoc._type

    const namedPatch = client.patch(finalDocumentId).set(newDoc)
    patchingTransaction = patchingTransaction.patch(namedPatch)
  }

  // 3.4 - finish by commiting everything 🎉
  await patchingTransaction.commit()

  // 4 - delete every old document
  let deletionTransaction = client.transaction()
  for (const id of allOldIds) {
    deletionTransaction = deletionTransaction.delete(id)
  }

  await deletionTransaction.commit()
}
