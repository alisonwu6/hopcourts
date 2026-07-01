import { Info, Dribbble, Sparkles, Smartphone } from 'lucide-react'

export type FaqItem = {
  q: string
  a: string
  showOnHome?: boolean
}

export type FaqCategory = {
  category: string
  Icon: React.ElementType
  iconColor: string
  labelColor: string
  items: FaqItem[]
}

export const faqCategories: FaqCategory[] = [
  {
    category: 'About HopCourts',
    Icon: Info,
    iconColor: 'text-blue-500',
    labelColor: 'text-blue-600',
    items: [
      {
        q: 'What is HopCourts trying to do?',
        a: "We're building for anyone who wants to play sport but can't find the right people or the right moment. Group chats are messy. Planning takes too long. HopCourts removes the friction so a good game doesn't need all that.",
        showOnHome: true,
      },
      {
        q: 'Is HopCourts free to use?',
        a: "Yes, for now. We see the problem: too much friction between wanting to play and actually playing. Removing that barrier is the whole point. Charging for it right now would work against what we're trying to do.",
      },
    ],
  },
  {
    category: 'Playing',
    Icon: Dribbble,
    iconColor: 'text-emerald-600',
    labelColor: 'text-emerald-700',
    items: [
      {
        q: 'How do I join a game?',
        a: 'Browse games near you on the events page. When you find one that fits, tap Hop In. No back-and-forth, no group chats. Just show up and play.',
        showOnHome: true,
      },
      {
        q: 'How do I host a game?',
        a: 'Tap + from the home screen. Fill in the sport, time, location, and number of spots. Hit publish and others can find and join you. You sort the court, we make it easy for people to show up.',
        showOnHome: true,
      },
      {
        q: 'How can I cancel a game?',
        a: "If you're the host, open the game and tap Edit. If anyone has already joined, tap Cancel and everyone who joined will be notified. If you've joined someone else's game and need to pull out, open the game and tap Leave.",
      },
      {
        q: 'Do I need to book a court in advance?',
        a: "Depends on your role. If you're joining, no booking needed. Just hop in and show up. If you're hosting, yes. You sort out the court and others can find and join you.",
      },
    ],
  },
  {
    category: 'Features',
    Icon: Sparkles,
    iconColor: 'text-amber-500',
    labelColor: 'text-amber-600',
    items: [
      {
        q: 'How does HopCourts know I actually showed up?',
        a: "You check in when you're within 100m of the venue. It records that you were there and connects you with the people you played with. We think showing up is the best thing you can do for your game and your mates.",
        showOnHome: true,
      },
      {
        q: 'How does Mates work?',
        a: 'Every game you play is logged. The mates you checked in with and played alongside show up here automatically. No more losing touch after a good game.',
        showOnHome: true,
      },
    ],
  },
  {
    category: 'App & Notifications',
    Icon: Smartphone,
    iconColor: 'text-indigo-500',
    labelColor: 'text-indigo-600',
    items: [
      {
        q: 'Can I use HopCourts like a mobile app?',
        a: "Yes. HopCourts is a web app that can be installed on your phone's home screen so it feels and behaves like a native app — no app store needed.\n\niPhone (Safari): tap the Share button at the bottom of the screen, then tap Add to Home Screen. Tap Add to confirm. Open HopCourts from your home screen and it will run full-screen without the browser bar.\n\nAndroid (Chrome): tap the three-dot menu in the top-right corner, then tap Add to Home Screen or Install App. Tap Install to confirm.\n\nOnce installed, you get full-screen mode, faster loading, and push notifications.",
        showOnHome: true,
      },
      {
        q: 'How do I turn on notifications?',
        a: "On Android: tap Allow when the prompt appears.\n\nOn iPhone: add HopCourts to your Home Screen first (see 'Can I use HopCourts like a mobile app?' above), then open it from there and tap Allow when prompted.\n\nTo turn off: go to phone Settings, find Notifications, look for HopCourts, and switch it off.",
        showOnHome: true,
      },
    ],
  },
]
