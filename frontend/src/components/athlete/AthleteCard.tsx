import { memo, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  CalendarCheck2,
  Flame,
  HandMetal,
  Leaf,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Send,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ActivityCardProps, AthleteCardProps } from '@/interfaces/athlete'
import { cn } from '@/lib/utils'
import fallbackHero from '@/assets/placeholders/session-fallback.svg'
import fallbackAvatar from '@/assets/placeholders/avatar-fallback.svg'
import { athleteCardTokens } from './tokens'
import { trackEvent } from '@/lib/analytics'

const tokens = athleteCardTokens

type StatKey = 'sessions' | 'streak' | 'energy' | 'badges'

type DisplayStatus = 'active' | 'rest' | 'new' | 'none'

type AthleteCardComponentProps = AthleteCardProps & {
  isOwner?: boolean
  onHighFive?: (id: string) => void
  onMessage?: (id: string) => void
  onInvite?: (id: string) => void
  onShare?: (id: string) => void
  onEdit?: (id: string) => void
  onAddPost?: (id: string) => void
  fullBleed?: boolean
}

const statusMeta: Record<DisplayStatus, { icon?: ReactNode; label: string; copy?: string }> = {
  active: {
    icon: <Flame className="h-4 w-4" aria-hidden="true" />,
    label: 'Active this week',
    copy: 'Keeps showing up this week.',
  },
  rest: {
    icon: <Leaf className="h-4 w-4" aria-hidden="true" />,
    label: 'Taking a rest',
    copy: 'Taking a breather.',
  },
  new: {
    icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
    label: 'New to SportsMatch',
    copy: 'Just joined the crew.',
  },
  none: {
    label: '',
  },
}

const visibilityCopy: Record<string, string> = {
  public: '',
  smart: 'Visible to teammates only',
  private: 'Private mode',
}

const fallbackRecentActivities: ActivityCardProps[] = []

function resolveDisplayStatus(athlete: AthleteCardProps): DisplayStatus {
  if (athlete.statusLabel && ['active', 'rest', 'new'].includes(athlete.statusLabel)) {
    return athlete.statusLabel as DisplayStatus
  }

  const sessions = athlete.stats.sessions ?? 0
  const streak = athlete.stats.streakWeeks ?? 0
  const energy = athlete.stats.energy ?? 0
  const activityCount = athlete.recentActivities?.length ?? 0

  if (streak >= 1 && activityCount >= 1) {
    return 'active'
  }
  if (sessions <= 3) {
    return 'new'
  }
  if (energy < 45 || activityCount === 0) {
    return 'rest'
  }
  return 'none'
}

function formatActivityTime(isoTime: string) {
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) {
    return isoTime
  }

  const day = new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date)
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date)

  return `${day} · ${time}`
}

function describePartners(partners?: string[]) {
  if (!partners || partners.length === 0) {
    return ''
  }
  if (partners.length === 1) {
    return `with ${partners[0]}`
  }
  if (partners.length === 2) {
    return `with ${partners[0]} & ${partners[1]}`
  }
  return `with ${partners[0]} & ${partners[1]} +${partners.length - 2}`
}

function formatCityLine(city?: string, sport?: string) {
  if (city && sport) {
    return `${city} · ${sport}`
  }
  if (city) {
    return city
  }
  return sport ?? ''
}

function getVisibilityCopy(visibility?: string) {
  if (!visibility) return ''
  return visibilityCopy[visibility] ?? ''
}

function StatValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: tokens.colors.textMuted }}
      >
        {label}
      </span>
      <span
        className="text-lg font-semibold"
        style={{ color: tokens.colors.textPrimary }}
      >
        {value}
      </span>
    </div>
  )
}

export const AthleteCard = memo((props: AthleteCardComponentProps) => {
  const {
    id,
    name,
    city,
    primarySport,
    title,
    toneLines,
    visualTagline,
    avatarUrl,
    coverUrl,
    stats,
    tags,
    bio,
    story,
    recentActivities = fallbackRecentActivities,
    visibility,
    relationship,
    isOwner = false,
    onHighFive,
    onMessage,
    onInvite,
    onShare,
    onEdit,
    onAddPost,
    fullBleed = false,
  } = props

  const [activeDrawer, setActiveDrawer] = useState<StatKey | null>(null)
  const [highFiveWave, setHighFiveWave] = useState<number | null>(null)
  const [pulseEnergy, setPulseEnergy] = useState(false)
  const [isStoryExpanded, setIsStoryExpanded] = useState(false)
  const status = resolveDisplayStatus(props)
  const statusDetails = statusMeta[status]
  const visibilityLabel = getVisibilityCopy(visibility)
  const toneLine = toneLines?.[0]
  const primaryNarrative = visualTagline ?? toneLine ?? statusDetails.copy
  const showNarrative = Boolean(primaryNarrative)

  useEffect(() => {
    trackEvent('AthleteCard.View', { id })
  }, [id])

  useEffect(() => {
    if (status === 'active') {
      setPulseEnergy(true)
      const timer = window.setTimeout(() => setPulseEnergy(false), 1600)
      return () => window.clearTimeout(timer)
    }
    setPulseEnergy(false)
    return undefined
  }, [status])

  useEffect(() => {
    if (!highFiveWave) return undefined
    const timer = window.setTimeout(() => setHighFiveWave(null), 900)
    return () => window.clearTimeout(timer)
  }, [highFiveWave])

  useEffect(() => {
    setIsStoryExpanded(false)
  }, [id])

  const handleHighFive = () => {
    setHighFiveWave(Date.now())
    trackEvent('AthleteCard.HighFive', { id })
    onHighFive?.(id)
  }

  const handleMessage = () => {
    trackEvent('AthleteCard.Message', { id })
    if (onMessage) {
      onMessage(id)
      return
    }
    console.info('Message action placeholder', id)
  }

  const handleInvite = () => {
    trackEvent('AthleteCard.Invite', { id })
    if (onInvite) {
      onInvite(id)
      return
    }
    console.info('Invite action placeholder', id)
  }

  const handleShare = () => {
    trackEvent('AthleteCard.Share', { id })
    if (onShare) {
      onShare(id)
      return
    }
    console.info('Share action placeholder', id)
  }

  const handleEdit = () => {
    if (!isOwner) return
    if (onEdit) {
      onEdit(id)
      return
    }
    console.info('Edit action placeholder', id)
  }

  const handleAddPost = () => {
    if (!isOwner) return
    if (onAddPost) {
      onAddPost(id)
      return
    }
    console.info('Add post action placeholder', id)
  }

  const cardStyle = useMemo(
    () => ({
      borderRadius: fullBleed ? '0px' : tokens.radii.card,
      boxShadow: fullBleed ? 'none' : tokens.shadows.card,
      backgroundColor: tokens.colors.surface,
    }),
    [fullBleed]
  )

  const statItems = useMemo(() => {
    const energyValue = Math.max(0, Math.min(100, stats.energy ?? 0))
    return [
      {
        key: 'sessions' as const,
        label: 'Sessions',
        value: `${stats.sessions ?? 0}`,
        meterPercent: Math.min(100, (stats.sessions / 40) * 100 || 0),
        icon: <CalendarCheck2 className="h-4 w-4" aria-hidden="true" />,
        isMuted: false,
      },
      {
        key: 'streak' as const,
        label: 'Streak',
        value: stats.streakWeeks && stats.streakWeeks > 0 ? `${stats.streakWeeks} weeks` : '0 weeks',
        meterPercent: Math.min(100, (stats.streakWeeks ?? 0) * 15),
        icon: <Flame className="h-4 w-4" aria-hidden="true" />,
        isMuted: !stats.streakWeeks,
      },
      {
        key: 'energy' as const,
        label: 'Energy',
        value: `${energyValue}%`,
        meterPercent: energyValue,
        icon: <Zap className="h-4 w-4" aria-hidden="true" />,
        isMuted: energyValue < 50,
      },
      {
        key: 'badges' as const,
        label: 'Badges',
        value: `${stats.badges ?? 0}`,
        meterPercent: Math.min(100, (stats.badges ?? 0) * 20),
        icon: <Trophy className="h-4 w-4" aria-hidden="true" />,
        isMuted: !(stats.badges && stats.badges > 0),
      },
    ]
  }, [stats.badges, stats.energy, stats.sessions, stats.streakWeeks])

  const activities = recentActivities.slice(0, 3)

  const actionButtons = isOwner
    ? [
        {
          key: 'edit',
          label: 'Edit',
          icon: <Pencil className="h-4 w-4" aria-hidden="true" />,
          onClick: handleEdit,
          variant: 'primary' as const,
          ariaLabel: 'Edit athlete card',
        },
        {
          key: 'add-post',
          label: 'Add post',
          icon: <Plus className="h-4 w-4" aria-hidden="true" />,
          onClick: handleAddPost,
          variant: 'muted' as const,
          ariaLabel: 'Add a new post',
        },
        {
          key: 'share',
          label: 'Share',
          icon: <Share2 className="h-4 w-4" aria-hidden="true" />,
          onClick: handleShare,
          variant: 'ghost' as const,
          ariaLabel: 'Share athlete card',
        },
      ]
    : [
        {
          key: 'high-five',
          label: 'High-Five',
          icon: <HandMetal className="h-4 w-4" aria-hidden="true" />,
          onClick: handleHighFive,
          variant: 'primary' as const,
          ariaLabel: 'Send a high-five',
        },
        {
          key: 'message',
          label: 'Message',
          icon: <MessageCircle className="h-4 w-4" aria-hidden="true" />,
          onClick: handleMessage,
          variant: 'muted' as const,
          ariaLabel: 'Send a message',
        },
        {
          key: 'invite',
          label: 'Invite',
          icon: <Send className="h-4 w-4" aria-hidden="true" />,
          onClick: handleInvite,
          variant: 'muted' as const,
          ariaLabel: 'Send an invite',
        },
        {
          key: 'share',
          label: 'Share',
          icon: <Share2 className="h-4 w-4" aria-hidden="true" />,
          onClick: handleShare,
          variant: 'ghost' as const,
          ariaLabel: 'Share athlete card',
        },
      ]

  const ownerBadgeCount = relationship?.sessionsTogether ?? 0
  const ownerBadgeLabel = ownerBadgeCount > 0 ? `Trained together ${ownerBadgeCount} times` : ''

  return (
    <article
      className={cn(
        'relative flex flex-col overflow-hidden w-full',
        fullBleed && 'max-w-none'
      )}
      style={cardStyle}
    >
      <header className="relative">
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <img
            src={coverUrl || fallbackHero}
            onError={(event) => {
              const target = event.currentTarget
              if (target.src !== fallbackHero) {
                target.src = fallbackHero
              }
            }}
            alt={`${name} cover`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0" style={{ backgroundImage: tokens.gradients.heroOverlay }} />
        </div>

        {status !== 'none' && (
          <div className="absolute left-6 top-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: 'rgba(5,19,51,0.2)',
              color: tokens.colors.surface,
              backdropFilter: 'blur(6px)',
            }}
          >
            {statusDetails.icon}
            <span>{statusDetails.label}</span>
          </div>
        )}

        <div className={cn(
          'absolute bottom-0 left-0 right-0 flex items-end pb-5',
          fullBleed ? 'px-0' : 'px-6'
        )}>
          <div className="flex items-end gap-4">
            <div
              className="rounded-full border-3 border-white/80"
              style={{ boxShadow: tokens.shadows.card }}
            >
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={avatarUrl || fallbackAvatar}
                  alt={name}
                  onError={(event) => {
                    const target = event.currentTarget
                    if (target.src !== fallbackAvatar) {
                      target.src = fallbackAvatar
                    }
                  }}
                />
                <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="pb-2 space-y-1.5">
              <div
                className="text-xl font-semibold"
                style={{ color: 'rgba(255,255,255,0.92)' }}
              >
                {name}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-[#C5D6EB]" aria-hidden="true" />
                <span className="text-[#C5D6EB]">{formatCityLine(city, primarySport)}</span>
              </div>
              {ownerBadgeLabel && (
                <div
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(27,143,210,0.18)', color: tokens.colors.surface }}
                >
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{ownerBadgeLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <section
        className={cn(
          'space-y-6 pb-6',
          fullBleed ? 'px-0 pt-0' : 'px-6 pt-4'
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            {title && (
              <p
                className="text-sm font-medium"
                style={{ color: tokens.colors.textSecondary }}
              >
                {title}
              </p>
            )}
            {showNarrative && (
              <p
                className={visualTagline ? 'text-sm italic' : 'text-sm'}
                style={{ color: tokens.colors.textSecondary }}
              >
                {visualTagline ? `“${primaryNarrative}”` : primaryNarrative}
              </p>
            )}
            {visibilityLabel && (
              <p
                className="text-xs font-medium"
                style={{ color: tokens.colors.textMuted }}
              >
                {visibilityLabel}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {statItems.map((item) => {
              const isEnergy = item.key === 'energy'
              const isActive = !item.isMuted && (status === 'active' || item.key !== 'streak')

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setActiveDrawer(item.key)
                    trackEvent('AthleteCard.Stats.Open', { id, stat: item.key })
                  }}
                  className={cn(
                    'relative flex h-full flex-col gap-3 rounded-2xl border px-4 py-4 text-left transition',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    item.isMuted ? 'opacity-60 hover:opacity-70' : 'hover:-translate-y-0.5'
                  )}
                  style={{
                    borderColor: tokens.colors.borderSoft,
                    backgroundColor: tokens.colors.surfaceMuted,
                    outlineColor: tokens.colors.primary,
                    boxShadow: isActive ? tokens.shadows.card : undefined,
                  }}
                  aria-label={`${item.label} detail`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: tokens.colors.textPrimary }}>
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                  </div>
                  <StatValue label={item.label} value={item.value} />
                  <div
                    className={cn('h-1.5 w-full overflow-hidden rounded-full',
                      isEnergy && pulseEnergy ? 'animate-pulse' : '')}
                    style={{ backgroundColor: 'rgba(27,143,210,0.12)' }}
                    aria-hidden="true"
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.meterPercent}%`,
                        backgroundImage:
                          item.key === 'energy'
                            ? energyGradient(item.meterPercent)
                            : tokens.gradients.energyBase,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {activeDrawer && (
            <div
              className="flex items-start justify-between gap-4 rounded-2xl px-4 py-3 text-sm"
              style={{ backgroundColor: tokens.colors.surfaceMuted }}
            >
              <div className="space-y-1" style={{ color: tokens.colors.textSecondary }}>
                <p className="font-semibold" style={{ color: tokens.colors.textPrimary }}>
                  {drawerTitle(activeDrawer)}
                </p>
                <p>Deep dive coming soon. We are wiring this drawer to detailed stats.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer(null)}
                className="text-sm font-semibold"
                style={{ color: tokens.colors.primary }}
              >
                Close
              </button>
            </div>
          )}
        </div>

        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: tokens.colors.textPrimary }}>
              Interests & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => console.info('Tag click placeholder', { id, tag })}
                  className="rounded-full px-3 py-1 text-sm font-medium transition"
                  style={{
                    backgroundColor: tokens.colors.surfaceTint,
                    color: tokens.colors.primary,
                    outlineColor: tokens.colors.primary,
                  }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {(bio || story) && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold" style={{ color: tokens.colors.textPrimary }}>
              Bio
            </h3>
            {bio && (
              <p
                className="text-sm"
                style={{
                  color: tokens.colors.textSecondary,
                  display: '-webkit-box',
                  WebkitLineClamp: isStoryExpanded ? undefined : '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: isStoryExpanded ? 'visible' : 'hidden',
                  whiteSpace: 'pre-line',
                }}
              >
                {bio}
              </p>
            )}
            {story && (
              <>
                {isStoryExpanded && (
                  <p
                    className="text-sm"
                    style={{
                      color: tokens.colors.textSecondary,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {story}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setIsStoryExpanded((prev) => !prev)}
                  className="text-sm font-semibold"
                  style={{ color: tokens.colors.primary }}
                >
                  {isStoryExpanded ? 'Show less' : 'Read full story'}
                </button>
              </>
            )}
          </div>
        )}

        {activities.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: tokens.colors.textPrimary }}>
                Activity timeline
              </h3>
            </div>
            <div className="-mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
              {activities.map((activity) => (
                <button
                  key={activity.id}
                  type="button"
                  onClick={() => {
                    trackEvent('AthleteCard.Activity.Open', { id, activityId: activity.id })
                  }}
                  className="relative w-60 shrink-0 overflow-hidden rounded-2xl text-left transition hover:-translate-y-0.5"
                  style={{
                    backgroundColor: tokens.colors.surfaceMuted,
                    boxShadow: tokens.shadows.card,
                  }}
                >
                  {activity.photoUrl && (
                    <div className="h-28 w-full overflow-hidden">
                      <img
                        src={activity.photoUrl}
                        alt={activity.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-2 px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold" style={{ color: tokens.colors.textPrimary }}>
                        {activity.title}
                      </p>
                      <p className="text-xs font-medium" style={{ color: tokens.colors.textSecondary }}>
                        {activity.sport}
                      </p>
                      <p className="text-xs" style={{ color: tokens.colors.textMuted }}>
                        {formatActivityTime(activity.time)}
                        {describePartners(activity.partners) && (
                          <span> · {describePartners(activity.partners)}</span>
                        )}
                      </p>
                    </div>
                    {activity.stats && (activity.stats.highFives || activity.stats.comments) && (
                      <div className="flex items-center gap-3 text-xs" style={{ color: tokens.colors.textMuted }}>
                        {activity.stats.highFives ? (
                          <span className="inline-flex items-center gap-1">
                            <HandMetal className="h-3.5 w-3.5" aria-hidden="true" />
                            {activity.stats.highFives}
                          </span>
                        ) : null}
                        {activity.stats.comments ? (
                          <span className="inline-flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {activity.stats.comments}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {actionButtons.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className={cn(
                'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                action.variant === 'primary' ? 'shadow-sm' : 'shadow-none'
              )}
              style={{
                backgroundColor:
                  action.variant === 'primary'
                    ? tokens.colors.primary
                    : action.variant === 'muted'
                      ? tokens.colors.surfaceMuted
                      : 'transparent',
                color:
                  action.variant === 'primary'
                    ? tokens.colors.textInverted
                    : action.variant === 'muted'
                      ? tokens.colors.textPrimary
                      : tokens.colors.primary,
                border:
                  action.variant === 'ghost'
                    ? `1px solid ${tokens.colors.primary}`
                    : '1px solid transparent',
                outlineColor: tokens.colors.primary,
              }}
              aria-label={action.ariaLabel}
            >
              {action.icon}
              <span>{action.label}</span>
              {action.key === 'high-five' && highFiveWave && (
                <>
                  <span
                    key={highFiveWave}
                    className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-white/20 animate-ping"
                  />
                  <span
                    className="pointer-events-none absolute -top-5 right-3 text-xs font-semibold"
                    style={{ color: tokens.colors.accent }}
                  >
                    +1
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>
    </article>
  )
})

AthleteCard.displayName = 'AthleteCard'

function energyGradient(percentage: number) {
  if (percentage >= 80) {
    return tokens.gradients.energyHigh
  }
  return tokens.gradients.energyBase
}

function drawerTitle(key: StatKey) {
  switch (key) {
    case 'sessions':
      return 'Sessions history'
    case 'streak':
      return 'Streak insights'
    case 'energy':
      return 'Energy breakdown'
    case 'badges':
      return 'Badges earned'
    default:
      return ''
  }
}
