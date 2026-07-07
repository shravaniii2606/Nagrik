import { useState } from 'react'
import { uploadChecklistDocument } from '../lib/api.js'
import { validateImageFile } from '../lib/validation.js'

function ChecklistBlock({ items }) {
  const [uploadedItems, setUploadedItems] = useState({})
  const [uploadMessages, setUploadMessages] = useState({})

  async function handleFileChange(index, file) {
    if (!file) {
      return
    }

    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadMessages((current) => ({ ...current, [index]: validationError }))
      return
    }

    setUploadMessages((current) => ({ ...current, [index]: 'Uploading...' }))
    try {
      await uploadChecklistDocument(file)
      setUploadedItems((current) => ({ ...current, [index]: true }))
      setUploadMessages((current) => ({ ...current, [index]: 'Uploaded securely.' }))
    } catch {
      setUploadMessages((current) => ({ ...current, [index]: 'Upload failed. Try again.' }))
    }
  }

  if (!items.length) {
    return null
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-base font-semibold text-slate-950">Document checklist</h3>
      <ul className="space-y-3">
        {items.map((item, index) => {
          const checkboxId = `checklist-${item.label.replace(/\s+/g, '-').toLowerCase()}-${index}`
          const fileInputId = `${checkboxId}-file`
          return (
            <li key={`${item.label}-${index}`} className="rounded-md border border-slate-200 bg-white p-3">
              <div className="flex items-start gap-3">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={Boolean(uploadedItems[index])}
                  onChange={(event) =>
                    setUploadedItems((current) => ({ ...current, [index]: event.target.checked }))
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-700"
                />
                <div className="min-w-0 flex-1">
                  <label htmlFor={checkboxId} className="font-medium text-slate-950">
                    {item.label}
                  </label>
                  {item.note && <p className="mt-1 text-sm text-slate-700">{item.note}</p>}
                  <label htmlFor={fileInputId} className="mt-3 block text-sm font-medium text-slate-800">
                    Optional JPG or PNG upload
                  </label>
                  <input
                    id={fileInputId}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(event) => handleFileChange(index, event.target.files?.[0])}
                    className="mt-1 block w-full rounded-md border border-slate-300 text-sm text-slate-900 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-900"
                  />
                  {uploadMessages[index] && (
                    <p className="mt-2 text-sm text-slate-700" role="status">
                      {uploadMessages[index]}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ChecklistBlock
