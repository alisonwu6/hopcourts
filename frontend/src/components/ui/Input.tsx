import clsx from 'clsx'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
export default function Input({ label, className, ...rest }: Props) {
  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-slate-600">{label}</span>}
      <input
        {...rest}
        className={clsx(
          'h-10 rounded border border-slate-300 px-3 focus:outline-none focus:ring-2 focus:ring-slate-300',
          className
        )}
      />
    </label>
  )
}
