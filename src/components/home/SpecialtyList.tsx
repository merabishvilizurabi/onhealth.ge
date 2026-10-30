import type { SpecialtyCount } from '../../interface/directory'

interface SpecialtyListProps {
  specialties: SpecialtyCount[]
  selected: string | null
  onSelect: (specialty: string | null) => void
}

export function SpecialtyList({ specialties, selected, onSelect }: SpecialtyListProps) {
  const tab = (active: boolean) =>
    `-mb-px shrink-0 border-b-4 px-4 pb-3 text-base transition-colors md:text-lg ${
      active ? 'border-primary font-semibold text-gray-900' : 'border-transparent font-medium text-gray-900'
    }`

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-gray-300">
      <button type="button" aria-pressed={selected === null} onClick={() => onSelect(null)} className={tab(selected === null)}>
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
            className={tab(active)}
          >
            {name} <span className="text-sm text-gray-900">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
