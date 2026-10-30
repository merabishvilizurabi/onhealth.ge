import type { DayIncome } from '../../services/statsService'
import { WEEKDAYS } from '../../constants/schedule'
import { formatDateShort, fromDateKey, toDateKey } from '../../utils/time'

const GRID_LINES = 4 // horizontal lines above zero

// A round top for the y axis, e.g. 145 → 160, 950 → 1000, so the axis labels are tidy numbers
function niceMax(value: number): number {
  if (value <= 0) return 100
  const step = 10 ** Math.floor(Math.log10(value / GRID_LINES))
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * step * GRID_LINES)
  return candidates.find((c) => c >= value) ?? value
}

// Income per day as bars on a grid with a y axis (plain divs, so the look is easy to change with Tailwind)
export function IncomeChart({ days }: { days: DayIncome[] }) {
  const max = niceMax(Math.max(...days.map((d) => d.income)))
  const ticks = Array.from({ length: GRID_LINES + 1 }, (_, i) => (max / GRID_LINES) * (GRID_LINES - i)) // top to bottom
  const short = days.length <= 14 // 7 days: amount above every bar, weekday + date below
  const today = toDateKey(new Date())

  return (
    <figure className="flex flex-col gap-2">
      <div className="flex gap-2" aria-hidden="true">
        {/* Y axis */}
        <div className="flex h-56 w-10 shrink-0 flex-col justify-between text-right text-xs text-gray-400">
          {ticks.map((tick) => (
            <span key={tick} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {Math.round(tick)}
            </span>
          ))}
        </div>

        {/* Plot: grid lines behind, bars in front */}
        <div className="relative h-56 flex-1">
          <div className="absolute inset-0 flex flex-col justify-between">
            {ticks.map((tick) => (
              <div key={tick} className={`border-t ${tick === 0 ? 'border-gray-300' : 'border-dashed border-gray-200'}`} />
            ))}
          </div>
          <div className="relative flex h-full items-end gap-1 sm:gap-2">
            {days.map((day) => (
              <div key={day.date} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                {short && (
                  <span className={`text-xs ${day.income > 0 ? 'font-medium text-gray-700' : 'text-gray-300'}`}>
                    {day.income}
                  </span>
                )}
                <div
                  title={`${formatDateShort(day.date)}: ${day.income} ₾, ${day.visits} ვიზიტი`}
                  className={`w-full max-w-16 rounded-t-md transition-colors ${
                    day.date === today ? 'bg-primary' : 'bg-primary/70 group-hover:bg-primary'
                  }`}
                  style={{ height: `${(day.income / max) * 100}%` }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X axis */}
      <div className="flex gap-2" aria-hidden="true">
        <div className="w-10 shrink-0" />
        <div className="flex flex-1 gap-1 sm:gap-2">
          {days.map((day, i) => {
            const date = fromDateKey(day.date)
            const weekday = WEEKDAYS.find((w) => w.day === date.getDay())?.short
            const isToday = day.date === today
            return (
              <div
                key={day.date}
                className={`min-w-0 flex-1 whitespace-nowrap text-center text-xs ${isToday ? 'font-semibold text-primary' : 'text-gray-500'}`}
              >
                {short ? (
                  <>
                    <span className="block">{isToday ? 'დღეს' : weekday}</span>
                    <span className="block text-gray-400">{date.getDate()}</span>
                  </>
                ) : (
                  (i % 5 === 0 || i === days.length - 1) && date.getDate()
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* The same numbers for screen readers */}
      <figcaption className="sr-only">
        {days.map((d) => `${formatDateShort(d.date)}: ${d.income} ლარი`).join('; ')}
      </figcaption>
    </figure>
  )
}
