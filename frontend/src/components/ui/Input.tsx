type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
export default function Input({ label, ...rest }: Props) {
  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-slate-600">{label}</span>}
      <input
        {...rest}
        className="h-10 px-3 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300"
      />
    </label>
  )
}
