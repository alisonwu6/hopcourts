interface InputFieldProps {
  label: string
  type: string
  placeholder?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  hint?: string
  error?: string
  name?: string
  autoComplete?: string
}

export function InputField({
  label,
  type,
  placeholder,
  value,
  onChange,
  hint,
  error,
  name,
  autoComplete,
}: InputFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-player-900">
        {label}
      </label>
      <input
        type={type}
        name={name}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-player-600 ${
          error ? 'border-red-500' : 'border-player-200'
        }`}
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
