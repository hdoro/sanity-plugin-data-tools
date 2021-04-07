import React from 'react'
import {
  PublishIcon,
  ErrorOutlineIcon,
  CheckmarkCircleIcon,
} from '@sanity/icons'
import {
  Card,
  Stack,
  Flex,
  Text,
  Button,
  TextArea,
  Inline,
  Code,
} from '@sanity/ui'
import uploadDocuments from './scripts/uploadDocuments'
import { TransactionResult } from './types'

const UploadDocuments: React.FC = () => {
  const [state, setState] = React.useState<{
    jsonStr: string
    status: 'idle' | 'success' | 'loading' | 'error'
    results?: TransactionResult[]
    error?: string
  }>({
    jsonStr: '',
    status: 'idle',
  })

  async function upload() {
    setState({
      ...state,
      status: 'loading',
    })
    const result = await uploadDocuments(state.jsonStr)
    if (Array.isArray(result)) {
      setState({
        ...state,
        status: 'success',
        results: result,
      })
    } else {
      setState({
        ...state,
        status: 'error',
        error: result,
      })
    }
  }

  function handleChange(e: any) {
    setState({
      ...state,
      jsonStr: e.currentTarget.value,
    })
  }
  return (
    <Card border padding={4} marginTop={4}>
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Text>Upload documents from JSON</Text>
          <Button
            tone="positive"
            icon={PublishIcon}
            text="Create documents"
            fontSize={1}
            padding={2}
            disabled={state.status === 'loading' || state.jsonStr.length < 1}
            onClick={upload}
          />
        </Flex>
        {state.status === 'error' && (
          <Card padding={2} tone="critical">
            <Inline space={1} align="center">
              <ErrorOutlineIcon />
              <Text size={1}>{state.error || 'Error!'}</Text>
            </Inline>
          </Card>
        )}
        {state.status === 'success' && (
          <>
            <Card padding={2} tone="positive">
              <Inline space={1} align="center">
                <CheckmarkCircleIcon />
                <Text size={1}>{'Documents added successfully'}</Text>
              </Inline>
            </Card>
            {state.results && state.results.length > 0 && (
              <Card border padding={2}>
                <Code size={1}>{JSON.stringify(state.results, null, 2)}</Code>
              </Card>
            )}
          </>
        )}
        {state.status !== 'success' && (
          <TextArea
            fontSize={0}
            padding={2}
            placeholder="Valid JSON code here"
            value={state.jsonStr}
            onChange={handleChange}
            rows={20}
          />
        )}
      </Stack>
    </Card>
  )
}

export default UploadDocuments
