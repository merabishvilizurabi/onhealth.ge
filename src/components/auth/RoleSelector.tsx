import { ROLE_LABELS, SIGN_UP_ROLES, type SignUpRole } from '../../constants/roles'

interface RoleSelectorProps {
  value: SignUpRole
  onChange: (role: SignUpRole) => void
}
export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div role="radiogroup" aria-label="ანგარიშის ტიპი" className="grid grid-cols-2 gap-2">
      {SIGN_UP_ROLES.map((role) => {
        const selected = role === value
        return (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={selected}
            data-role={role}
            onClick={() => onChange(role)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              selected
                ? 'border-primary bg-primary text-white'
                : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
            }`}
          >
            {ROLE_LABELS[role]}
          </button>
        )
      })}
    </div>
  )
}
