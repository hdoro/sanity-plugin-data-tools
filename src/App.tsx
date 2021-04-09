import React from 'react'
import {
  studioTheme,
  ThemeProvider,
  Container,
  Inline,
  Label,
  Select,
} from '@sanity/ui'

import { UtilitiesT } from './types'
import UploadDocuments from './UploadDocuments'
import ChangeDocumentType from './ChangeDocumentType'
import RemoveInvalidDocumentTypes from './RemoveInvalidDocumentTypes'

const App: React.FC = () => {
  // @TODO: add a state to block changing utility while their work is in progress
  const [utility, setUtility] = React.useState<UtilitiesT>('removeInvalidDocumentTypes')
  // const [utility, setUtility] = React.useState<UtilitiesT>('uploadDocument')

  function handleSelect(e: any) {
    setUtility(e.currentTarget.value)
  }
  return (
    <ThemeProvider theme={studioTheme}>
      <Container padding={2} width={3}>
        <Inline align="center" space={2}>
          <Label htmlFor="utility">Utility: </Label>
          <Select id="choose-utility" onChange={handleSelect} value={utility}>
            <option value="uploadDocument">Upload documents from JSON</option>
            <option value="changeDocumentType">Change document _types</option>
            <option value="removeInvalidDocumentTypes">Remove documents with _types not in schema</option>
          </Select>
        </Inline>
        {/* UTIL UIs */}
        {utility === 'uploadDocument' && <UploadDocuments />}
        {utility === 'changeDocumentType' && <ChangeDocumentType />}
        {utility === 'removeInvalidDocumentTypes' && <RemoveInvalidDocumentTypes  />}
      </Container>
    </ThemeProvider>
  )
}

export default App
