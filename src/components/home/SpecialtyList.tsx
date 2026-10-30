import type { SpecialtyCount } from '../../interface/directory'

interface SpecialtyListProps {
  specialties: SpecialtyCount[]
  selected: string | null
  onSelect: (specialty: string | null) => void
}

// Clicking a specialty filters the doctors; clicking it again (or "ყველა") clears the filter
export function SpecialtyList({ specialties, selected, onSelect }: SpecialtyListProps) {
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
    }`

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={selected === null} onClick={() => onSelect(null)} className={chip(selected === null)}>
        ყველა
      </button>
      {specialties.map(({ name, count }) => {
        const active = selected === name
        return (
          <button
            key={name}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(active ? null : name)}
            className={chip(active)}
          >
            {name} <span className={active ? 'text-white/80' : 'text-gray-400'}>{count}</span>
          </button>
        )
      })}
    </div>
  )
}
