import React from 'react'
import { SearchIcon, HelpCircleIcon, CheckmarkIcon } from '@sanity/icons'
import {
  Card,
  Stack,
  Flex,
  Text,
  Button,
  Label,
  Autocomplete,
  TextInput,
  Box,
  Code,
} from '@sanity/ui'
import schema from 'part:@sanity/base/schema'

const ChangeDocumentType: React.FC = () => {
  console.log(schema)
  // const [jsonStr, setJsonStr] = React.useState('')
  return (
    <Flex marginTop={3}>
      <Card padding={3} flex={1}>
        <Stack space={4}>
          <Text size={3} weight="bold">
            Change document _types
          </Text>
          <Text size={1}>
            We'll duplicate documents with the selected existing _type and
            change their _type to the new name you choose.
          </Text>
          <Card padding={2} tone="caution">
            <Text size={1}>
              As Sanity doesn't allow changing a document's _type without
              changing its _id, we'll also change _ids, delete the old documents
              and change references.
            </Text>
          </Card>
          <Stack space={2}>
            <Label>Existing document _type</Label>
            <Autocomplete
              options={schema?._source?.types
                ?.filter((type: any) => type.type === 'document')
                .map((type: any) => ({
                  value: type.name,
                }))}
              icon={SearchIcon}
            />
          </Stack>
          <Stack space={2}>
            <Label>New type name</Label>
            <TextInput value="" />
          </Stack>
          <Button text="Parse changes" tone="primary" />
        </Stack>
      </Card>
      <Box marginLeft={2} flex={2}>
        <Card padding={3} border>
          <Flex justify="space-between" align="center">
            <Text muted>Step 1: Create new documents</Text>
            <Button
              icon={CheckmarkIcon}
              text="Approved"
              tone="positive"
              mode="ghost"
            />
          </Flex>
        </Card>
        <Card padding={3} border>
          <Flex justify="space-between" align="center">
            <Text>Step 2: Update references</Text>
            <Button
              icon={CheckmarkIcon}
              text="Approve changes"
              tone="primary"
              mode="ghost"
            />
          </Flex>
          <Card border padding={3} marginTop={2}>
            <Flex width="100%">
              <Card flex={1}>
                <Stack space={3}>
                  <Label muted>Before</Label>
                  <Code language="json">
                    {JSON.stringify({ before: true }, null, 2)}
                  </Code>
                </Stack>
              </Card>
              <Card flex={1}>
                <Stack space={3}>
                  <Label muted>After</Label>
                  <Code language="json">
                    {JSON.stringify({ after: true }, null, 2)}
                  </Code>
                </Stack>
              </Card>
            </Flex>
          </Card>
        </Card>
        <Card padding={3} border>
          <Flex justify="space-between" align="center">
            <Text muted>Step 3: Delete old documents</Text>
            <Button
              icon={HelpCircleIcon}
              text="Review"
              tone="caution"
              mode="ghost"
            />
          </Flex>
        </Card>
      </Box>
    </Flex>
  )
}

export default ChangeDocumentType
