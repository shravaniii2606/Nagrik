import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ApplicationStatusView from '../components/ApplicationStatusView.jsx'
import ChecklistBlock from '../components/ChecklistBlock.jsx'
import RequireAuth from '../components/RequireAuth.jsx'
import Button from '../components/ui/Button.jsx'
import { fetchApplications, sendChatMessage } from '../lib/api.js'
import { cleanText } from '../lib/validation.js'

function ChatResponseCard({ message, serviceContext, onApplicationSubmitted, showChecklistFlow }) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-blue-800">{message.intent.replace('_', ' ')}</p>
      <p className="mt-2 whitespace-pre-line text-slate-800">{message.answer}</p>
      {showChecklistFlow && (
        <ChecklistBlock
          items={message.checklist || []}
          applicationFormUrl={message.application_form_url}
          serviceName={serviceContext}
          onApplicationSubmitted={onApplicationSubmitted}
        />
      )}
      {message.recommended_services?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-base font-semibold text-slate-950">Recommended services</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {message.recommended_services.map((service) => (
              <li key={service}>
                <Link
                  to={`/chat?service=${encodeURIComponent(service)}`}
                  className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-100"
                >
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  )
}

function ChatPageContent() {
  const [searchParams] = useSearchParams()
  const serviceContext = searchParams.get('service') || ''
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [existingApplication, setExistingApplication] = useState(null)
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const seededService = useRef('')

  const submitMessage = useCallback(
    async (messageText, contextOverride = serviceContext) => {
      const cleanedMessage = cleanText(messageText, 1000)
      if (!cleanedMessage) {
        setError('Enter a question or describe what you need.')
        return
      }

      setError('')
      setLoading(true)
      const userMessage = {
        id: crypto.randomUUID(),
        type: 'user',
        text: cleanedMessage,
      }
      setMessages((current) => [...current, userMessage])

      try {
        const response = await sendChatMessage(cleanedMessage, existingApplication ? null : contextOverride)
        setMessages((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            type: 'assistant',
            service_context: contextOverride || '',
            ...response,
          },
        ])
      } catch {
        setError('The AI companion could not respond. Check backend and API key settings.')
      } finally {
        setLoading(false)
      }
    },
    [existingApplication, serviceContext],
  )

  useEffect(() => {
    if (!serviceContext) {
      setExistingApplication(null)
      setMessages([])
      return
    }

    let active = true
    setMessages([])
    setError('')
    setApplicationLoading(true)
    setExistingApplication(null)
    fetchApplications(serviceContext)
      .then((applications) => {
        if (!active) {
          return
        }
        const application = applications[0] || null
        setExistingApplication(application)
        if (!application && seededService.current !== serviceContext) {
          seededService.current = serviceContext
          submitMessage(`Help me with ${serviceContext}.`, serviceContext)
        }
      })
      .catch(() => {
        if (active) {
          setError('Could not check existing applications. Try refreshing the page.')
        }
      })
      .finally(() => {
        if (active) {
          setApplicationLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [serviceContext, submitMessage])

  function handleApplicationSubmitted(application) {
    setExistingApplication(application)
  }

  function handleSubmit(event) {
    event.preventDefault()
    submitMessage(message)
    setMessage('')
  }

  return (
    <section aria-labelledby="chat-heading" className="space-y-5">
      <div>
        <h2 id="chat-heading" className="text-2xl font-bold text-slate-950">
          AI civic companion
        </h2>
        <p className="mt-2 text-slate-700">
          Ask a direct question, describe your situation, or open a service to get a document checklist.
        </p>
        {serviceContext && (
          <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
            Service context: {serviceContext}
          </p>
        )}
      </div>

      <div className="space-y-3" aria-live="polite">
        {applicationLoading && <p className="text-slate-700">Checking existing application...</p>}
        {existingApplication && <ApplicationStatusView application={existingApplication} />}
        {messages.map((chatMessage) =>
          chatMessage.type === 'assistant' ? (
            <ChatResponseCard
              key={chatMessage.id}
              message={chatMessage}
              serviceContext={chatMessage.service_context || serviceContext}
              onApplicationSubmitted={handleApplicationSubmitted}
              showChecklistFlow={!existingApplication}
            />
          ) : (
            <div key={chatMessage.id} className="ml-auto max-w-3xl rounded-md bg-slate-900 p-3 text-white">
              {chatMessage.text}
            </div>
          ),
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="chat-message" className="block text-sm font-medium text-slate-800">
          Message
        </label>
        <textarea
          id="chat-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          maxLength={1000}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
          placeholder="Example: I moved to Pune and need proof of residence. Which service should I use?"
          required
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Asking...' : 'Ask AI companion'}
          </Button>
          {error && (
            <p className="text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>
    </section>
  )
}

function ChatPage() {
  return (
    <RequireAuth>
      <ChatPageContent />
    </RequireAuth>
  )
}

export default ChatPage
