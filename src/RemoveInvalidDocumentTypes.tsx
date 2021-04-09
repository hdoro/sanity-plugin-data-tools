import React from 'react'
import { SearchIcon, ErrorOutlineIcon } from '@sanity/icons'
import {
  Card,
  Stack,
  Text,
  Button,
  Code,
  Box,
  Inline,
  Checkbox,
  Flex,
} from '@sanity/ui'
import schema from 'part:@sanity/base/schema'

import client from './scripts/client'

const MOCK_DATA = [
  {
    _createdAt: '2021-04-07T21:08:14Z',
    _id: '17ZLUzlfkq4XV5vnvVs6v9',
    _type: 'delete-me-article',
    _updatedAt: '2021-04-07T21:08:14Z',
  },
  {
    _createdAt: '2021-04-07T21:08:14Z',
    _id: '17ZLUzlfkq4XV5vnvVs6xg',
    _type: 'delete-me-article',
    _updatedAt: '2021-04-07T21:08:14Z',
  },
  {
    _createdAt: '2021-04-07T21:08:14Z',
    _id: '17ZLUzlfkq4XV5vnvVs70D',
    _type: 'delete-me-article',
    _updatedAt: '2021-04-07T21:08:14Z',
  },
  {
    _createdAt: '2021-04-07T21:04:45Z',
    _id: 'GnQSLZs0BN5JSq7cGrp5Jk',
    _type: 'delete-me-article',
    _updatedAt: '2021-04-07T21:04:45Z',
  },
  {
    _createdAt: '2021-04-07T21:04:45Z',
    _id: 'GnQSLZs0BN5JSq7cGrp5Kf',
    _type: 'delete-me-article',
    _updatedAt: '2021-04-07T21:04:45Z',
  },
  {
    _createdAt: '2021-04-07T20:54:05Z',
    _id: 'uUnfxxqFjfh81zDIspWGY9',
    _type: 'delete-me-article',
    _updatedAt: '2021-04-07T20:54:05Z',
  },
  {
    _createdAt: '2021-03-09T18:39:50Z',
    _id: 'drafts.wO6jD3l9feVXnFDksp1eqb',
    _type: 'testPost',
    _updatedAt: '2021-03-09T19:01:48Z',
  },
  {
    _createdAt: '2021-03-09T18:39:50Z',
    _id: 'wO6jD3l9feVXnFDksp1eqb',
    _type: 'testPost',
    _updatedAt: '2021-03-09T18:39:50Z',
  },
]

function extractTypes(documents?: any[]): string[] {
  if (!documents?.length) {
    return []
  }
  return documents?.reduce((accTypes, curDoc) => {
    if (accTypes.includes(curDoc._type)) {
      return accTypes
    }
    return [...accTypes, curDoc._type]
  }, [])
}

const RemoveInvalidDocumentTypes: React.FC = () => {
  const [state, setState] = React.useState<{
    documents?: any[]
    status: 'idle' | 'success' | 'loading' | 'error'
    error?: string
    enabledTypes?: string[]
  }>({
    status: 'idle',
    // documents: MOCK_DATA,
  })

  async function fetchInvalidDocuments() {
    setState({
      ...state,
      status: 'loading',
    })

    // Get every single document _type that is prescribed in the _schema
    const validDocumentTypes: any[] = schema?._original?.types?.filter(
      (type: any) => type.type === 'document',
    )

    // Query for all documents that are not of one of these types
    const documents = await client.fetch(/* groq */ `*[!(
          _type in [${validDocumentTypes
            .map((type) => `"${type.name}"`)
            .join(',')}]
          || _type match "system.**"
        )]{
          _id,
          _type,
          _createdAt,
          _updatedAt,
          "_referencedBy": *[references(^._id)]._id,
        }`)
    if (Array.isArray(documents)) {
      setState({
        ...state,
        status: 'idle',
        documents,
      })
    } else {
      setState({
        ...state,
        status: 'error',
        error: "Couldn't fetch",
      })
    }
  }

  React.useEffect(() => {
    const types = extractTypes(state.documents)
    setState({
      ...state,
      enabledTypes: types,
    })
  }, [state.documents])

  // Get a list of every type we found that isn't in the schema
  const allTypes = extractTypes(state.documents)

  function handleTypeCheckbox(type: string, types: string[], prevState: any) {
    return (e: any) => {
      let newTypes = []
      if (e.currentTarget?.checked) {
        newTypes = [...types, type]
      } else {
        const index = types.indexOf(type)
        newTypes = [...types.slice(0, index), ...types.slice(index + 1)]
      }
      setState({
        ...prevState,
        enabledTypes: newTypes,
      })
    }
  }

  async function deleteEntries() {
    setState({
      ...state,
      status: 'loading',
    })
    let deletionTransaction = client.transaction()
    const documentsToDelete =
      state.documents?.filter(
        (doc) =>
          state.enabledTypes?.includes(doc._type) &&
          doc._referencedBy?.length < 1,
      ) || []
    for (const doc of documentsToDelete) {
      deletionTransaction = deletionTransaction.delete(doc._id)
    }

    // @TODO DEAL WITH REFERENCES!
    const res = await deletionTransaction.commit()
    console.log(res)
    setState({
      ...state,
      status: 'success',
    })
  }
  return (
    <Card border padding={4} marginTop={4}>
      <Stack
        space={4}
        // style={{ textAlign: Array.isArray(state.documents) ? '' : 'center' }}
      >
        {Array.isArray(state.documents) && state.status !== 'success' && (
          <>
            <Text size={1} muted>
              Found {state.documents?.length || 0} documents that can be
              deleted.
            </Text>
            <Text weight="bold" size={3}>
              Choose which types to delete
            </Text>
            <Inline space={4}>
              {allTypes?.map((type) => (
                <Flex align="center">
                  <Checkbox
                    id={`checkbox-type-${type}`}
                    style={{ display: 'block' }}
                    checked={state.enabledTypes?.includes(type)}
                    onChange={handleTypeCheckbox(type, allTypes, state)}
                  />
                  <Box flex={1} paddingLeft={3}>
                    <Text>
                      <label htmlFor={`checkbox-type-${type}`}>{type}</label>
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Inline>
            <Text weight="bold" size={3}>
              Or choose individually below:
            </Text>
            <Stack space={2}>
              <Card padding={1} border>
                {state.documents.map((doc) => (
                  <Card
                    marginTop={2}
                    tone={doc._referencedBy?.length ? 'critical' : undefined}
                  >
                    {doc._referencedBy?.length > 0 && (
                      <Text>
                        There are documents pointing to this one. It can't be
                        deleted
                      </Text>
                    )}
                    <Code language="json">{JSON.stringify(doc, null, 2)}</Code>
                    {/* <Button text="Deleting this document" mode="ghost" /> */}
                  </Card>
                ))}
              </Card>
            </Stack>
            <Button
              icon={ErrorOutlineIcon}
              tone="critical"
              fontSize={3}
              text="Delete all selected"
              onClick={deleteEntries}
              disabled={!state.enabledTypes || state.enabledTypes.length < 1}
            ></Button>
          </>
        )}
        {!Array.isArray(state.documents) && state.status !== 'success' && (
          <>
            <Text size={3}>
              Check for documents with _types not currently in the schema
            </Text>
            <Box>
              <Button
                tone="primary"
                icon={SearchIcon}
                text="Run check"
                onClick={fetchInvalidDocuments}
                disabled={state.status === 'loading'}
              />
            </Box>
          </>
        )}
        {state.status === 'success' && <Text size={3}>Success!</Text>}
      </Stack>
    </Card>
  )
}

export default RemoveInvalidDocumentTypes
