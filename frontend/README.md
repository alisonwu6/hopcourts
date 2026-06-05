# HopCourts Frontend

## Supabase configuration

The frontend now authenticates directly with Supabase. Copy `src/.env` to the project root (or create your own) and provide:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_EMAIL_REDIRECT=http://localhost:5173/auth/callback
```

`VITE_SUPABASE_EMAIL_REDIRECT` is optional, but recommended if email confirmations are enabled in your Supabase project.
