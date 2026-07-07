import { useState } from 'react'
import { createApplication, uploadChecklistDocument } from '../lib/api.js'
import { validateImageFile } from '../lib/validation.js'

function ChecklistBlock({ items, applicationFormUrl, serviceName, onApplicationSubmitted }) {
  const [uploadedDocuments, setUploadedDocuments] = useState({})
  const [uploadMessages, setUploadMessages] = useState({})
  const [submitStatus, setSubmitStatus] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const allDocumentsUploaded =
    items.length > 0 &&
    items.every((item) => uploadedDocuments[item.label]?.uploaded && uploadedDocuments[item.label]?.file_path)

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
      const uploadedFile = await uploadChecklistDocument(file)
      const documentName = items[index].label
      setUploadedDocuments((current) => ({
        ...current,
        [documentName]: {
          name: documentName,
          file_path: uploadedFile.file_path,
          file_url: uploadedFile.file_url,
          uploaded: true,
        },
      }))
      setUploadMessages((current) => ({ ...current, [index]: 'Uploaded securely.' }))
    } catch {
      setUploadMessages((current) => ({ ...current, [index]: 'Upload failed. Try again.' }))
    }
  }

  async function handleDone() {
    setSubmitError('')
    setSubmitStatus('')

    if (!serviceName) {
      setSubmitError('Open this checklist from a service page before submitting.')
      return
    }
    if (!allDocumentsUploaded) {
      setSubmitError('Upload every required document before marking this application done.')
      return
    }

    const documents = items.map((item) => uploadedDocuments[item.label])
    setSubmitting(true)
    try {
      const application = await createApplication(serviceName, documents)
      setSubmitStatus('Application submitted for review.')
      if (onApplicationSubmitted) {
        onApplicationSubmitted(application)
      }
    } catch {
      setSubmitError('Application could not be submitted. Please check uploads and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!items.length) {
    return null
  }

  return (
    <div className="mt-4 space-y-3">
      <h3 className="text-base font-semibold text-slate-950">Document checklist</h3>
      {applicationFormUrl && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-950">
            Official application form:{' '}
            <a
              href={applicationFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-emerald-700 underline-offset-2 hover:text-emerald-800"
            >
              Open form
            </a>
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Application forms and exact process may vary by state. Please verify with your local government office.
          </p>
        </div>
      )}
      <ul className="space-y-3">
        {items.map((item, index) => {
          const checkboxId = `checklist-${item.label.replace(/\s+/g, '-').toLowerCase()}-${index}`
          const fileInputId = `${checkboxId}-file`
          return (
            <li key={`${item.label}-${index}`} className="border-l-2 border-slate-200 pl-3">
              <div className="flex items-start gap-3">
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={Boolean(uploadedDocuments[item.label]?.uploaded)}
                  onChange={(event) => {
                    const documentName = item.label
                    setUploadedDocuments((current) => ({
                      ...current,
                      [documentName]: {
                        ...(current[documentName] || { name: documentName }),
                        uploaded: event.target.checked && Boolean(current[documentName]?.file_path),
                      },
                    }))
                  }}
                  className="mt-1 h-4 w-4 rounded border-slate-400 text-blue-700"
                  disabled={!uploadedDocuments[item.label]?.file_path}
                />
                <div className="min-w-0 flex-1">
                  <label htmlFor={checkboxId} className="font-medium text-slate-950">
                    {item.label}
                  </label>
                  {item.note && <p className="mt-1 text-sm text-slate-700">{item.note}</p>}
                  <label htmlFor={fileInputId} className="mt-3 block text-sm font-medium text-slate-800">
                    JPG or PNG upload
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
      {allDocumentsUploaded && (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-950">
            All required documents are uploaded. Submit them to start application processing.
          </p>
          <button
            type="button"
            onClick={handleDone}
            disabled={submitting}
            aria-label={`Done uploading documents for ${serviceName || 'this service'}`}
            className="mt-3 rounded-md bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
          >
            {submitting ? 'Submitting...' : 'Submit application'}
          </button>
        </div>
      )}
      {submitStatus && (
        <p className="text-sm text-green-800" role="status">
          {submitStatus}
        </p>
      )}
      {submitError && (
        <p className="text-sm text-red-800" role="alert">
          {submitError}
        </p>
      )}
    </div>
  )
}

export default ChecklistBlock
