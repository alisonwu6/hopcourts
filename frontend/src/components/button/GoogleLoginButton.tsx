import { Button } from '@/components'

export default function GoogleLoginButton({ loginGoogle }: { loginGoogle: () => void }) {
  return (
    <Button
      onClick={loginGoogle}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-slate-900 bg-white text-slate-900 hover:bg-slate-50"
      textClassName="text-slate-900"
    >
      {/* Google "G" logo SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 533.5 544.3"
        className="h-5 w-5"
      >
        <path
          d="M533.5 278.4c0-17.4-1.5-34.1-4.3-50.4H272.1v95.3h147c-6.4 34.4-25.6 63.6-54.4 83.2v68h87.8c51.5-47.4 81-117.3 81-196.1z"
          fill="#4285F4"
        />
        <path
          d="M272.1 544.3c73.5 0 135.2-24.3 180.2-66.2l-87.8-68c-24.4 16.4-55.6 26-92.4 26-71 0-131.2-47.9-152.7-112.2H30.8v70.4c45 89.1 137.6 149.9 241.3 149.9z"
          fill="#34A853"
        />
        <path
          d="M119.4 323.9c-10.5-31.4-10.5-65.5 0-96.9V156.6H30.8c-42.1 83.9-42.1 183.4 0 267.3l88.6-70z"
          fill="#FBBC04"
        />
        <path
          d="M272.1 107.7c39.9 0 75.7 13.7 103.9 40.7l77.7-77.7C407.3 24.7 345.6 0 272.1 0 168.4 0 75.8 60.8 30.8 149.9l88.6 70c21.5-64.3 81.7-112.2 152.7-112.2z"
          fill="#EA4335"
        />
      </svg>
      <span className="text-sm font-medium text-slate-900">使用 Google 繼續</span>
    </Button>
  )
}
