import { useState } from 'react'
import BpmnViewer from './components/BpmnViewer'
import './App.css'

function App() {
  const [xml, setXml] = useState<string>('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setXml(content)
      }
      reader.readAsText(file)
    }
  }

  return (
    <>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <h1>BPMN D3 Viewer</h1>
        <input type="file" accept=".bpmn, .xml" onChange={handleFileUpload} />
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {xml ? (
          <BpmnViewer xml={xml} />
        ) : (
          <div style={{ padding: '20px' }}>Select a .bpmn file to view.</div>
        )}
      </div>
    </>
  )
}

export default App
