import { Bot, Sparkles } from 'lucide-react'
import AiReplyCard from '../components/AiReplyCard'
import PageHeader from '../components/PageHeader'
import PreviewCard from '../components/PreviewCard'

export default function AiReplies() {
  const sampleReply =
    'Thank you for taking the time to share your experience. We appreciate your feedback and are glad our team could help. We look forward to serving you again soon.'

  return (
    <>
      <PageHeader
        title="AI Replies"
        description="Preview the reply workflow used inside review detail pages."
      />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <PreviewCard
          icon={Bot}
          title="Reply assistant"
          description="Generate short, human replies that match the customer sentiment and your preferred tone."
        />
        <AiReplyCard reply={sampleReply} onRegenerate={() => {}} onUseReply={() => {}} />
      </div>
      <div className="mt-5">
        <PreviewCard
          icon={Sparkles}
          title="How it works"
          description="Open any review, generate a draft, edit it, save it, then mark it as replied or post it to Google when connected."
        />
      </div>
    </>
  )
}
