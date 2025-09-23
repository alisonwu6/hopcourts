import { Button } from '@/components/ui/button'

export default function AppleLoginButton({
  loginApple,
}: {
  loginApple: () => void
}) {
  return (
    <Button
      onClick={loginApple}
      variant="default"
      className="flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800"
    >
      {/* Apple logo (SVG) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 814 1000"
        className="w-5 h-5 fill-current"
      >
        <path d="M788 747c-14 33-31 63-51 90-27 36-49 61-68 75-27 20-56 30-88 31-23 0-51-7-84-21-34-14-65-21-93-21-29 0-60 7-93 21-34 14-61 22-81 22-31 1-61-9-91-30-20-15-43-40-71-77-31-40-56-87-75-142C-2 639-6 583 6 531c9-41 25-75 47-102 21-27 47-48 77-63 31-15 63-23 96-24 24 0 56 8 95 23 39 16 64 23 76 23 9 0 36-9 81-26 44-15 81-21 111-17 82 7 144 39 185 95-73 44-109 105-109 183 0 61 23 112 69 154 20 18 43 31 68 40zM567 0c0 39-14 76-41 109-33 40-74 64-118 60-1-5-2-11-2-18 0-37 16-77 44-110 14-17 32-32 54-45 22-13 43-20 64-21 1 8 1 16-1 25z" />
      </svg>
      <span className="text-sm font-medium">Continue with Apple</span>
    </Button>
  )
}
