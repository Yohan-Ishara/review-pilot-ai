export default function StarRating({ rating = 0, className = '' }) {
  const value = Number(rating) || 0

  return (
    <div className={`flex items-center gap-0.5 text-amber-400 ${className}`} aria-label={`${value} stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="text-sm leading-none">
          {index < value ? '★' : '☆'}
        </span>
      ))}
    </div>
  )
}
