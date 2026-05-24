import { Sparkles } from 'lucide-react'
import Button from './Button'
import PrimaryButton from './PrimaryButton'

export default function AiReplyCard({
  reply,
  onRegenerate,
  onUseReply,
  regenerating = false,
  useLabel = 'Use Reply',
}) {
  return (
    <section className="rounded-2xl border border-indigo-100/70 bg-white p-5 shadow-sm shadow-indigo-50">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-950">
          <Sparkles className="h-5 w-5 text-[#7C6CF6]" />
          AI Reply
        </h2>
      </div>
      <div className="mt-4 rounded-2xl border border-indigo-100 bg-[#F5F3FF]/70 p-4 text-sm leading-7 text-slate-700">
        {reply || 'Generate a reply to create a polished response for this customer review.'}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Button variant="secondary" onClick={onRegenerate} loading={regenerating}>
          Regenerate
        </Button>
        <PrimaryButton onClick={onUseReply} disabled={!reply?.trim()}>
          {useLabel}
        </PrimaryButton>
      </div>
    </section>
  )
}
