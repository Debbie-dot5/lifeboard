"use client"

type Props = {
  currentPage: number
  totalPages: number | null
}

const ProgressBar = ({ currentPage, totalPages }: Props) => {
  if (!totalPages || totalPages === 0) return null

  const progress = Math.min((currentPage / totalPages) * 100, 100)

  // Purple → amber gradient as progress increases
  const getColor = (pct: number): string => {
    if (pct >= 100) return "#d97706" // amber-600
    if (pct >= 75) return "#b45309"  // amber-700
    if (pct >= 50) return "#92400e"  // amber-800
    return "#6C47FF" // brand purple
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 h-[2px] bg-black/20">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          backgroundColor: getColor(progress),
        }}
      />
    </div>
  )
}

export default ProgressBar
