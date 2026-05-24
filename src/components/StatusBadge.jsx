import Badge from './Badge'

const toneByStatus = {
  replied: 'green',
  draft: 'purple',
  new: 'yellow',
  connected: 'green',
  disconnected: 'gray',
}

export default function StatusBadge({ status = 'new', children }) {
  return <Badge tone={toneByStatus[status] || 'gray'}>{children || status}</Badge>
}
