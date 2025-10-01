export type Language = 'en' | 'zh-TW'

type InviteCopy = {
  id: string
  host: string
  sport: string
  time: string
  location: string
}

type SquadMemberCopy = {
  name: string
  suburb: string
  sport: string
  streak: string
  note: string
  avatarUrl?: string
}

type SquadRequestCopy = {
  name: string
  sport: string
  message: string
  avatarUrl?: string
}

type NotificationCopy = {
  id: number
  text: string
  time: string
  type: string
}

type AthleteSessionCopy = {
  title: string
  sport: string
  date: string
}

type BadgeOptionCopy = {
  id: string
  label: string
  description: string
}

type Translation = {
  common: {
    appName: string
    tagline: string
    explore: string
    squad: string
    me: string
    search: string
    filters: string
    cancel: string
    save: string
    publish: string
    preview: string
    addToCalendar: string
    shareToChat: string
    browseMore: string
    goToSession: string
    markAllRead: string
    comingSoon: string
    greatEnergy: string
    couldBeBetter: string
    sendFeedback: string
    spotsAvailable: (count: number) => string
    rosterCount: (joined: number, max: number) => string
    joinCounts: (joined: number, max: number) => string
    startsIn: (timeLeft: string) => string
    hostedBy: (name: string) => string
    messageHost: string
    addToSquad: string
    maybeLater: string
    remove: string
    inviteTeammate: string
    startChat: string
    inviteToSquad: string
    message: string
    viewOnMap: string
    searchAthletesPlaceholder: string
  }
  language: {
    label: string
    english: string
    chinese: string
    toggleA11y: string
  }
  header: {
    mapView: string
    newSession: string
    notifications: string
    searchAthletes: string
  }
  splash: {
    headline: string
    subcopy: string
    continueCta: string
  }
  home: {
    heroTitle: string
    heroDescription: string
    nextOnCalendar: string
    streak: string
    invitesTitle: string
    invitesSubtitle: string
    invitesLink: string
    quickFilters: string[]
    searchTitle: string
    searchDescription: string
    searchPlaceholder: string
    recommendedTitle: string
    featuredEventId: string
    invites: InviteCopy[]
    acceptInvite: string
    maybeInvite: string
  }
  eventCard: {
    saveForLater: string
    joinSession: string
  }
  eventList: {
    emptyMessage: string
  }
  mockEvents: {
    cards: Record<string, {
      title: string
      location: string
      time: string
      description: string
      tags: string[]
    }>
    sportNames: Record<string, string>
    skillLevels: Record<string, string>
  }
  sessionDetails: {
    notFoundTitle: string
    notFoundCopy: string
    backToExplore: string
    whenLabel: string
    whereLabel: string
    capacityLabel: string
    bringTitle: string
    bringList: string[]
    followUpTitle: string
    followUpDescription: string
    followUpActions: [string, string, string, string]
  }
  createSession: {
    title: string
    description: string
    saveDraft: string
    basicsTitle: string
    basicsDescription: string
    titleLabel: string
    sportLabel: string
    datetimeLabel: string
    durationLabel: string
    locationLabel: string
    capacityLabel: string
    skillLabel: string
    skillPlaceholder: string
    descriptionLabel: string
    descriptionPlaceholder: string
    vibeTitle: string
    vibeDescription: string
    vibeTags: string[]
    notesLabel: string
    notesPlaceholder: string
    notesHint: string
    preview: string
    publish: string
  }
  myProfile: {
    title: string
    description: string
    viewPublic: string
    name: string
    location: string
    stats: string
    basicsTitle: string
    basicsDescription: string
    displayName: string
    suburb: string
    primarySport: string
    bio: string
    bioPlaceholder: string
    availabilityTitle: string
    availabilityDescription: string
    preferredDays: string
    timeOfDay: string
    timeOptions: string[]
    lookingFor: string
    lookingForPlaceholder: string
    skills: string[]
    availabilityDays: string[]
    sportOptions: string[]
    strengthOptions: string[]
    badgeOptions: BadgeOptionCopy[]
    sportsTitle: string
    strengthsTitle: string
    badgesTitle: string
    sportsHint: string
    strengthsHint: string
    badgesHint: string
    levelOptions: string[]
    save: string
    cancel: string
    previewLabel: string
    savingLabel: string
    savedMessage: string
  }
  squad: {
    title: string
    description: string
    insightsTitle: string
    insightsSummary: string
    viewHistory: string
    members: SquadMemberCopy[]
    requestsTitle: string
    empty: string
    requests: SquadRequestCopy[]
    add: string
  }
  manageSession: {
    title: string
    description: string
    viewPublic: string
    confirmedPlayers: string
    waitlist: string
    noWaitlist: string
    copyInvite: string
    exportRoster: string
    approve: string
    decline: string
    sendUpdate: string
    cancelSession: string
    duplicateSession: string
    feedbackForm: string
  }
  notifications: {
    title: string
    description: string
    empty: string
    items: NotificationCopy[]
  }
  settings: {
    title: string
    description: string
    connectedTitle: string
    connectedDescription: string
    primaryBadge: string
    google: string
    disconnect: string
    apple: string
    connect: string
    languageTitle: string
    languageDescription: string
    calendarTitle: string
    calendarDescription: string
    privacyTitle: string
    privacyCopy: string
    privacyLinks: string
  }
  reconnect: {
    title: string
    description: string
    prompt: string
    placeholder: string
    peopleYouMayAdd: string
  }
  joinConfirmation: {
    title: string
    description: string
    sharePrompt: string
  }
  mapView: {
    title: string
    description: string
    suburbSummary: string
    suburbs: string[]
  }
  athleteCard: {
    title: string
    description: string
    location: string
    levelLabel: string
    levelValue: string
    sports: string[]
    strengths: string[]
    badges: string[]
    recentSessions: AthleteSessionCopy[]
    upcomingSessions: AthleteSessionCopy[]
    squad: SquadMemberCopy[]
    trustNote: string
    editFabLabel: string
  }
  callback: {
    signingIn: string
    subcopy: string
  }
}

export const translations: Record<Language, Translation> = {
  en: {
    common: {
      appName: 'SportsMatch',
      tagline: 'Join locals. Play together. Build your squad.',
      explore: 'Explore',
      squad: 'Squad',
      me: 'Me',
      search: 'Search',
      filters: 'Filters',
      cancel: 'Cancel',
      save: 'Save profile',
      publish: 'Publish session',
      preview: 'Preview session',
      addToCalendar: 'Add to calendar (.ics)',
      shareToChat: 'Share to group chat',
      browseMore: 'Browse more sessions',
      goToSession: 'Go to session',
      markAllRead: 'Mark all read',
      comingSoon: 'Coming soon',
      greatEnergy: 'Great energy',
      couldBeBetter: 'Could be better',
      sendFeedback: 'Send feedback',
      spotsAvailable: (count) => `+${count} spots available`,
      rosterCount: (joined, max) => `${joined}/${max} rostered`,
      joinCounts: (joined, max) => `${joined} / ${max} spots filled`,
      startsIn: (timeLeft) => `Starts in ${timeLeft}`,
      hostedBy: (name) => `Hosted by ${name}`,
      messageHost: 'Message host',
      addToSquad: 'Add to squad',
      maybeLater: 'Maybe later',
      remove: 'Remove',
      inviteTeammate: 'Invite teammate',
      startChat: 'Start chat',
      inviteToSquad: 'Invite to squad',
      message: 'Message',
      viewOnMap: 'View on map',
      searchAthletesPlaceholder: 'Search by player, sport, or crew vibe',
    },
    language: {
      label: 'Language',
      english: 'English',
      chinese: '繁體中文',
      toggleA11y: 'Toggle language',
    },
    header: {
      mapView: 'Map view',
      newSession: 'New session',
      notifications: 'Notifications',
      searchAthletes: 'Search athletes',
    },
    splash: {
      headline: 'Pick-up sports that match your vibe.',
      subcopy: 'Join locals, play together, and build your squad with real follow-ups.',
      continueCta: 'Explore upcoming sessions',
    },
    home: {
      heroTitle: 'Pick-up with Brisbane locals',
      heroDescription: 'Lock in the next run, keep the streak, and grow your crew.',
      nextOnCalendar: 'Up next for your squad',
      streak: '3 weeks of play',
      invitesTitle: 'Friends are waiting',
      invitesSubtitle: 'RSVP so your host can lock the roster.',
      invitesLink: 'See all invites',
      quickFilters: ['After-work runs', 'Indoor courts', 'Morning crews', 'Beginner friendly'],
      searchTitle: 'Find the next play',
      searchDescription: 'Search by suburb, sport, or vibe keywords.',
      searchPlaceholder: 'Try “South Bank hoops”',
      recommendedTitle: 'Sessions locals love',
      featuredEventId: 'basketball-pickup',
      invites: [
        {
          id: 'invite-1',
          host: 'Dana',
          sport: 'Mixed netball run',
          time: 'Thu · 6:30 PM',
          location: 'West End Courts',
        },
        {
          id: 'invite-2',
          host: 'Leo',
          sport: 'Saturday futsal crew',
          time: 'Sat · 9:00 AM',
          location: 'South Bank Arena',
        },
      ],
      acceptInvite: 'Accept',
      maybeInvite: 'Maybe',
    },
    eventCard: {
      saveForLater: 'Save for later',
      joinSession: 'Join session',
    },
    eventList: {
      emptyMessage: 'No sessions match your filters yet. Try broadening your search.',
    },
    mockEvents: {
      cards: {
        brisbane_basketball: {
          title: 'Basketball Pickup',
          location: 'South Bank Court',
          time: 'Sat, July 20 · 3:00-5:00 PM',
          description:
            'Casual half-court run focused on keeping things upbeat. Perfect if you are getting back into the game and want to meet locals.',
          tags: ['Beginner-friendly', 'Casual vibe', 'Just for fun'],
        },
        brisbane_volleyball: {
          title: 'Volleyball Fun Match',
          location: 'Kangaroo Point',
          time: 'Sun, July 21 · 4:30-6:00 PM',
          description:
            'Friendly co-ed social game on the riverside sand courts. Expect warm ups, rotation practice, and drinks nearby afterward.',
          tags: ['Open to all', 'Friendly', 'Relaxed pace'],
        },
        brisbane_running: {
          title: 'Sunrise Run Club',
          location: 'New Farm Park Loop',
          time: 'Tue, July 23 · 6:00-7:15 AM',
          description:
            'Tempo run with optional coffee cool-down. Split into two pace groups (5:00/km and 6:00/km). Newcomers welcome.',
          tags: ['Coffee after', 'Pace groups', 'Community vibe'],
        },
      },
      sportNames: {
        basketball: 'Basketball',
        volleyball: 'Volleyball',
        running: 'Running',
      },
      skillLevels: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
      },
    },
    sessionDetails: {
      notFoundTitle: 'Session not found',
      notFoundCopy: 'This session may have been cancelled or moved.',
      backToExplore: 'Back to explore',
      whenLabel: 'When',
      whereLabel: 'Where',
      capacityLabel: 'Capacity',
      bringTitle: 'Bring',
      bringList: ['Arrive 10 minutes early for warm up', 'Comfortable shoes and water bottle', 'Optional: spare ball for shooting drills'],
      followUpTitle: 'Post-session follow up',
      followUpDescription: 'Keep the momentum. Add it to your calendar and invite your squad.',
      followUpActions: ['Add to calendar (.ics)', 'Share to group chat', 'Mark attendance', 'Request host review'],
    },
    createSession: {
      title: 'Create a session',
      description: 'Share the details and SportsMatch will help you fill the roster.',
      saveDraft: 'Save draft',
      basicsTitle: 'Session basics',
      basicsDescription: 'Tell players what they can expect and where to meet.',
      titleLabel: 'Title',
      sportLabel: 'Sport',
      datetimeLabel: 'Date & start time',
      durationLabel: 'Duration (minutes)',
      locationLabel: 'Location',
      capacityLabel: 'Capacity',
      skillLabel: 'Skill level',
      skillPlaceholder: 'Select level',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Outline the vibe, meeting spot, and any warm up plans...',
      vibeTitle: 'Session vibe',
      vibeDescription: 'Tag your session so the right athletes can discover it.',
      vibeTags: ['Beginner friendly', 'Competitive', 'Social', 'Coffee after'],
      notesLabel: 'Notes for attendees',
      notesPlaceholder: 'Anything they should bring or know before the session?',
      notesHint: 'Visible only to people who join.',
      preview: 'Preview session',
      publish: 'Publish session',
    },
    myProfile: {
      title: 'Your athlete card',
      description: 'Keep this current so hosts know what you bring.',
      viewPublic: 'View public card',
      name: 'Alex Blue',
      location: 'Brisbane · Basketball & Running',
      stats: 'Joined Feb 2025 · 18 sessions hosted · 42 joined',
      basicsTitle: 'Basics',
      basicsDescription: 'Update how people address and find you.',
      displayName: 'Display name',
      suburb: 'Home suburb',
      primarySport: 'Primary sport',
      bio: 'Bio',
      bioPlaceholder: 'Share a little about your playing style, goals or favourite sessions.',
      availabilityTitle: 'Availability & preferences',
      availabilityDescription: 'Helps SportsMatch suggest sessions that fit.',
      preferredDays: 'Preferred days',
      timeOfDay: 'Time of day',
      timeOptions: ['Early mornings', 'Lunch sessions', 'After work', 'Weekend warrior'],
      lookingFor: 'Looking for',
      lookingForPlaceholder: 'Eg: Social weeknight runs, mixed basketball scrims, casual volleyball.',
      skills: ['Playmaking', 'Defense', 'Consistency'],
      availabilityDays: ['Mon', 'Wed', 'Thu', 'Sat'],
      sportOptions: ['Basketball', 'Running', 'Strength', 'Volleyball', 'Futsal', 'Badminton', 'Climbing'],
      strengthOptions: ['On-ball defense', 'Fast break leader', 'Reliable passer', 'Clutch shooter', 'Hype captain', 'Organises squads'],
      badgeOptions: [
        { id: 'first-match', label: 'First Match', description: 'Completed your first game with SportsMatch.' },
        { id: 'ten-sessions', label: '10 Sessions', description: 'Played in ten sessions this season.' },
        { id: 'host-helper', label: 'Host Helper', description: 'Regularly steps up to co-host or cover drop-outs.' },
        { id: 'night-owl', label: 'Night Owl Runner', description: 'Joined at least five late-night runs.' },
        { id: 'early-bird', label: 'Early Bird', description: 'Shows up for dawn sessions week after week.' },
      ],
      sportsTitle: 'Sports to show',
      strengthsTitle: 'Strengths',
      badgesTitle: 'Badges',
      sportsHint: 'Pick up to three sports to feature.',
      strengthsHint: 'Highlight up to three skills teammates can count on.',
      badgesHint: 'Share up to three badges you want visible on your card.',
      levelOptions: ['Beginner', 'Social', 'Intermediate', 'Advanced'],
      save: 'Save changes',
      cancel: 'Cancel',
      previewLabel: 'Live preview',
      savingLabel: 'Saving…',
      savedMessage: 'Changes saved',
    },
    squad: {
      title: 'Your squad',
      description: 'Stay connected with the athletes you trust.',
      insightsTitle: 'Squad insights',
      insightsSummary: '3 active connections · 18 recent co-sessions · 2 pending invites',
      viewHistory: 'View history',
      members: [
        {
          name: 'Dana',
          suburb: 'South Brisbane',
          sport: 'Netball',
          streak: '12 sessions together',
          note: 'Hosts a friendly Friday run at Davies Park',
          avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=160&q=80',
        },
        {
          name: 'Chen',
          suburb: 'Fortitude Valley',
          sport: 'Basketball',
          streak: '8 sessions together',
          note: 'Always down for weeknight scrims',
          avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80',
        },
        {
          name: 'Bo',
          suburb: 'West End',
          sport: 'Running',
          streak: '5 sessions together',
          note: 'Tempo partner for Wednesday mornings',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        },
      ],
      requestsTitle: 'Requests',
      empty: 'No requests at the moment. After a session wraps you can invite players directly.',
      requests: [
        {
          name: 'Hana',
          sport: 'Volleyball',
          message: '"Loved playing at Kangaroo Point, add me for the next game?"',
          avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
        },
      ],
      add: 'Add to squad',
    },
    manageSession: {
      title: 'Manage session',
      description: 'Keep your roster tidy and share updates with players.',
      viewPublic: 'View public session',
      confirmedPlayers: 'Confirmed players',
      waitlist: 'Waitlist',
      noWaitlist: 'No one waiting. Share the session to fill remaining spots.',
      copyInvite: 'Copy invite link',
      exportRoster: 'Export roster',
      approve: 'Approve',
      decline: 'Decline',
      sendUpdate: 'Send update to roster',
      cancelSession: 'Cancel session',
      duplicateSession: 'Duplicate session',
      feedbackForm: 'Open feedback form',
    },
    notifications: {
      title: 'Notifications',
      description: 'Stay on top of roster updates and reminders.',
      empty: 'You are caught up. New updates will show here.',
      items: [
        { id: 1, text: 'Bo joined your session for Friday futsal', time: '2m ago', type: 'roster' },
        { id: 2, text: 'Yoga Flow starts in 1h', time: '1h ago', type: 'reminder' },
        { id: 3, text: 'Dana left feedback on Sunrise Run Club', time: 'Yesterday', type: 'feedback' },
      ],
    },
    settings: {
      title: 'Settings',
      description: 'Control connected accounts, syncing, and privacy options.',
      connectedTitle: 'Connected accounts',
      connectedDescription: 'Use social sign-in so your profile stays in sync.',
      primaryBadge: 'Primary',
      google: 'Google',
      disconnect: 'Disconnect',
      apple: 'Apple',
      connect: 'Connect',
      languageTitle: 'Language',
      languageDescription: 'Choose your preferred interface language.',
      calendarTitle: 'Calendar sync',
      calendarDescription: 'Automatically add joined sessions to your calendar.',
      privacyTitle: 'Privacy & terms',
      privacyCopy: 'SportsMatch is currently in beta. We collect limited data to improve session matching.',
      privacyLinks: 'Read the Privacy Policy and Community Guidelines.',
    },
    reconnect: {
      title: 'How was the run?',
      description: 'Log quick feedback and stay in touch with standouts.',
      prompt: 'Keep your streak strong. Let the host know how it went.',
      placeholder: 'Anything the host should know for next time?',
      peopleYouMayAdd: 'People you may add',
    },
    joinConfirmation: {
      title: 'You are in!',
      description: 'We have added you to the roster and notified the host.',
      sharePrompt: 'Add it to your calendar or share the link with friends.',
    },
    mapView: {
      title: 'Map view',
      description: 'Scan upcoming sessions by suburb and vibe.',
      suburbSummary: '2 sessions live · 1 starting soon',
      suburbs: ['South Bank', 'Fortitude Valley', 'West End', 'Kangaroo Point'],
    },
    athleteCard: {
      title: 'Athlete profile',
      description: 'Show who you are on the court, and find people who play like you.',
      location: 'Brisbane · Basketball',
      levelLabel: 'Level',
      levelValue: 'Intermediate guard',
      sports: ['Basketball', 'Running', 'Strength'],
      strengths: ['On-ball defense', 'Fast break leader', 'Always early'],
      badges: ['First Match', '10 Sessions', 'Night Owl Runner'],
      recentSessions: [
        { title: 'South Bank Hoops', sport: 'Basketball', date: 'Sun · 6:30 PM' },
        { title: 'River Loop Tempo', sport: 'Running', date: 'Wed · 5:45 AM' },
        { title: 'Strength & Mobility', sport: 'Strength', date: 'Fri · 7:00 PM' },
      ],
      upcomingSessions: [
        { title: 'Dawn Track Sprints', sport: 'Running', date: 'Tue · 5:30 AM' },
        { title: 'City Night Hoops', sport: 'Basketball', date: 'Thu · 8:00 PM' },
      ],
      squad: [
        { name: 'Dana', sport: 'Netball captain', lastPlayed: 'Fri futsal', avatarUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80' },
        { name: 'Jun', sport: 'Runner', lastPlayed: 'River Loop', avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80' },
        { name: 'Bo', sport: 'Point guard', lastPlayed: 'Hoops @ SB', avatarUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80' },
      ],
      trustNote: 'This profile shows info they chose to share.',
      editFabLabel: 'Edit athlete card',
    },
    callback: {
      signingIn: 'Signing you in...',
      subcopy: 'Hang tight while we complete authentication.',
    },
  },
  'zh-TW': {
    common: {
      appName: 'SportsMatch',
      tagline: '找到你的運動夥伴，保持出勤連勝。',
      explore: '探索',
      squad: '好友',
      me: '我的',
      search: '搜尋',
      filters: '篩選',
      cancel: '取消',
      save: '儲存個人檔案',
      publish: '發布活動',
      preview: '預覽活動',
      addToCalendar: '加入行事曆 (.ics)',
      shareToChat: '分享至群組聊天',
      browseMore: '查看更多活動',
      goToSession: '前往活動頁面',
      markAllRead: '全部標示為已讀',
      comingSoon: '即將推出',
      greatEnergy: '氣氛很棒',
      couldBeBetter: '有待加強',
      sendFeedback: '送出回饋',
      spotsAvailable: (count) => `剩餘 ${count} 名額`,
      rosterCount: (joined, max) => `${joined}/${max} 已確認`,
      joinCounts: (joined, max) => `${joined} / ${max} 名額`,
      startsIn: (timeLeft) => `還有 ${timeLeft} 開始`,
      hostedBy: (name) => `${name} 主辦`,
      messageHost: '傳訊息給主辦',
      addToSquad: '加入好友',
      maybeLater: '稍後再說',
      remove: '移除',
      inviteTeammate: '邀請夥伴',
      startChat: '開始聊天',
      inviteToSquad: '邀請成為好友',
      message: '傳訊息',
      viewOnMap: '顯示地圖',
      searchAthletesPlaceholder: '搜尋名字、運動或關鍵字',
    },
    language: {
      label: '語言',
      english: 'English',
      chinese: '繁體中文',
      toggleA11y: '切換語言',
    },
    header: {
      mapView: '地圖模式',
      newSession: '建立活動',
      notifications: '通知',
      searchAthletes: '搜尋選手',
    },
    splash: {
      headline: '找到符合你節奏的運動聚會。',
      subcopy: '加入在地玩家，一起開打，持續壯大你的 squad。',
      continueCta: '探索即將舉辦的活動',
    },
    home: {
      heroTitle: '和布里斯本夥伴一起上場',
      heroDescription: '預約下一場、維持出席連勝、把好友帶進你的 squad。',
      nextOnCalendar: '下一場等你開打',
      streak: '連續 3 週出席',
      invitesTitle: '好友邀請等你',
      invitesSubtitle: '儘早回覆，好讓主辦人鎖定名單。',
      invitesLink: '查看所有邀請',
      quickFilters: ['下班揪團', '室內場地', '清晨晨練', '新手友善'],
      searchTitle: '找尋下一場',
      searchDescription: '用地區、運動或氛圍關鍵字搜尋。',
      searchPlaceholder: '試試「South Bank 籃球」',
      recommendedTitle: '布里斯本玩家最愛',
      featuredEventId: 'basketball-pickup',
      invites: [
        {
          id: 'invite-1',
          host: 'Dana',
          sport: '混合手球團練',
          time: '週四 · 下午 6:30',
          location: 'West End Courts',
        },
        {
          id: 'invite-2',
          host: 'Leo',
          sport: '週末五人制',
          time: '週六 · 上午 9:00',
          location: 'South Bank Arena',
        },
      ],
      acceptInvite: '接受',
      maybeInvite: '再想想',
    },
    eventCard: {
      saveForLater: '先收藏',
      joinSession: '加入活動',
    },
    eventList: {
      emptyMessage: '目前沒有符合條件的活動，試著放寬篩選條件。',
    },
    mockEvents: {
      cards: {
        brisbane_basketball: {
          title: '籃球自由打',
          location: 'South Bank Court',
          time: '7 月 20 日（六）· 下午 3:00-5:00',
          description:
            '輕鬆半場對打，節奏熱鬧。很適合重新找回手感並認識新朋友。',
          tags: ['新手友善', '輕鬆氣氛', '純粹好玩'],
        },
        brisbane_volleyball: {
          title: '排球歡樂賽',
          location: 'Kangaroo Point',
          time: '7 月 21 日（日）· 下午 4:30-6:00',
          description:
            '河畔沙灘場的友善混齡賽，包含暖身、輪轉練習，賽後還有小聚。',
          tags: ['開放所有程度', '氣氛友善', '節奏輕鬆'],
        },
        brisbane_running: {
          title: '日出跑步俱樂部',
          location: 'New Farm Park Loop',
          time: '7 月 23 日（二）· 早上 6:00-7:15',
          description:
            '兩組配速的節奏跑（5:00/km、6:00/km），跑後可一起喝咖啡，新朋友也歡迎。',
          tags: ['跑後咖啡', '依配速分組', '社群氛圍'],
        },
      },
      sportNames: {
        basketball: '籃球',
        volleyball: '排球',
        running: '路跑',
      },
      skillLevels: {
        beginner: '新手',
        intermediate: '進階',
        advanced: '高手',
      },
    },
    sessionDetails: {
      notFoundTitle: '找不到這個活動',
      notFoundCopy: '活動可能被取消或移動到其他頁面。',
      backToExplore: '回到探索頁',
      whenLabel: '時間',
      whereLabel: '地點',
      capacityLabel: '名額',
      bringTitle: '攜帶事項',
      bringList: ['提早 10 分鐘到場暖身', '舒適的運動鞋與水瓶', '如果方便可帶額外的球'],
      followUpTitle: '活動後續',
      followUpDescription: '延續熱度，把活動加到行事曆並邀請好友參加。',
      followUpActions: ['加入行事曆 (.ics)', '分享至群組聊天', '記錄出席情況', '請求主辦人回饋'],
    },
    createSession: {
      title: '建立活動',
      description: '填寫活動資訊，SportsMatch 會協助你找到參加者。',
      saveDraft: '儲存草稿',
      basicsTitle: '活動基本資料',
      basicsDescription: '讓參加者了解期待與集合地點。',
      titleLabel: '活動名稱',
      sportLabel: '運動類型',
      datetimeLabel: '日期與開始時間',
      durationLabel: '活動時長（分鐘）',
      locationLabel: '集合地點',
      capacityLabel: '名額',
      skillLabel: '程度',
      skillPlaceholder: '選擇程度',
      descriptionLabel: '活動描述',
      descriptionPlaceholder: '說明活動氛圍、集合點以及暖身安排……',
      vibeTitle: '活動氛圍',
      vibeDescription: '標記活動特色，讓適合的玩家看見。',
      vibeTags: ['新手友善', '競技取向', '社交交流', '跑後咖啡'],
      notesLabel: '給參加者的備註',
      notesPlaceholder: '需要攜帶或提前知道的注意事項？',
      notesHint: '僅加入活動的人會看到。',
      preview: '預覽活動',
      publish: '發布活動',
    },
    myProfile: {
      title: '你的運動名片',
      description: '保持最新，讓主辦人了解你的特色。',
      viewPublic: '查看公開頁面',
      name: 'Alex Blue',
      location: '布里斯本 · 籃球／路跑',
      stats: '2025 年 2 月加入 · 主辦 18 場 · 參與 42 場',
      basicsTitle: '基本資料',
      basicsDescription: '更新大家如何稱呼並找到你。',
      displayName: '顯示名稱',
      suburb: '常駐地區',
      primarySport: '主要運動',
      bio: '自我介紹',
      bioPlaceholder: '分享你的球風、目標或最喜歡的活動。',
      availabilityTitle: '時間與偏好',
      availabilityDescription: '協助 SportsMatch 推薦合適的活動。',
      preferredDays: '偏好日子',
      timeOfDay: '偏好時段',
      timeOptions: ['清晨', '午休', '下班後', '週末戰士'],
      lookingFor: '正在尋找',
      lookingForPlaceholder: '例如：平日晚上的輕鬆夜跑、混合籃球對抗、休閒排球。',
      skills: ['組織進攻', '防守判斷', '穩定出席'],
      availabilityDays: ['週一', '週三', '週四', '週六'],
      sportOptions: ['籃球', '路跑', '肌力', '排球', '五人制', '羽球', '攀岩'],
      strengthOptions: ['防守溝通', '快攻發動', '傳球穩定', '外線輸出', '場上氣氛手', '揪團高手'],
      badgeOptions: [
        { id: 'first-match', label: '第一場完成', description: '在 SportsMatch 完成你的第一場活動。' },
        { id: 'ten-sessions', label: '10 場出席', description: '這季參加至少 10 場活動。' },
        { id: 'host-helper', label: '主辦支援', description: '經常協助主辦或頂替臨時空缺。' },
        { id: 'night-owl', label: '夜跑戰士', description: '加入過至少 5 場夜間跑步活動。' },
        { id: 'early-bird', label: '晨型玩家', description: '持續參加清晨場活動。' },
      ],
      sportsTitle: '想呈現的運動',
      strengthsTitle: '擅長項目',
      badgesTitle: '徽章',
      sportsHint: '最多選三個要展示的運動。',
      strengthsHint: '最多選三項讓夥伴放心的強項。',
      badgesHint: '挑選最多三個想在名片上呈現的徽章。',
      levelOptions: ['初階', '社交', '中階', '進階'],
      save: '儲存變更',
      cancel: '取消',
      previewLabel: '即時預覽',
      savingLabel: '儲存中…',
      savedMessage: '已儲存變更',
    },
    squad: {
      title: '你的好友名單',
      description: '持續和信任的運動夥伴保持聯繫。',
      insightsTitle: '好友洞察',
      insightsSummary: '3 位活躍夥伴 · 最近 18 場同場 · 2 個待確認邀請',
      viewHistory: '查看紀錄',
      members: [
        {
          name: 'Dana',
          suburb: 'South Brisbane',
          sport: '手球',
          streak: '已同場 12 次',
          note: '每週五在 Davies Park 主辦輕鬆跑團',
          avatarUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=160&q=80',
        },
        {
          name: 'Chen',
          suburb: 'Fortitude Valley',
          sport: '籃球',
          streak: '已同場 8 次',
          note: '總是願意晚間對打',
          avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80',
        },
        {
          name: 'Bo',
          suburb: 'West End',
          sport: '路跑',
          streak: '已同場 5 次',
          note: '週三早晨的節奏跑夥伴',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80',
        },
      ],
      requestsTitle: '好友申請',
      empty: '目前沒有新的申請。活動結束後可以直接邀請夥伴。',
      requests: [
        {
          name: 'Hana',
          sport: '排球',
          message: '「很喜歡 Kangaroo Point 的場次，下次也可以帶我嗎？」',
          avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80',
        },
      ],
      add: '加入好友',
    },
    manageSession: {
      title: '管理活動',
      description: '維持名單整齊，適時更新參加者。',
      viewPublic: '查看公開頁面',
      confirmedPlayers: '已確認的參加者',
      waitlist: '候補名單',
      noWaitlist: '目前沒有候補。分享活動吸引更多人報名。',
      copyInvite: '複製邀請連結',
      exportRoster: '匯出名單',
      approve: '核准',
      decline: '婉拒',
      sendUpdate: '發送最新消息',
      cancelSession: '取消活動',
      duplicateSession: '複製活動',
      feedbackForm: '開啟回饋表單',
    },
    notifications: {
      title: '通知',
      description: '掌握名單更新與提醒。',
      empty: '目前都更新完畢，之後的新通知會顯示在這裡。',
      items: [
        { id: 1, text: 'Bo 參加了你週五的室內足球', time: '2 分鐘前', type: '名單' },
        { id: 2, text: '瑜珈 Flow 活動一小時後開始', time: '1 小時前', type: '提醒' },
        { id: 3, text: 'Dana 對 Sunrise Run Club 留下回饋', time: '昨天', type: '回饋' },
      ],
    },
    settings: {
      title: '設定',
      description: '管理已連結的帳號、同步與隱私選項。',
      connectedTitle: '已連結帳號',
      connectedDescription: '使用社群登入，保持個人資料一致。',
      primaryBadge: '主要',
      google: 'Google',
      disconnect: '取消連結',
      apple: 'Apple',
      connect: '連結',
      languageTitle: '介面語言',
      languageDescription: '選擇你想使用的顯示語言。',
      calendarTitle: '行事曆同步',
      calendarDescription: '自動把參加的活動加入行事曆。',
      privacyTitle: '隱私與條款',
      privacyCopy: 'SportsMatch 目前為 Beta 測試。僅收集少量資料以改善媒合品質。',
      privacyLinks: '閱讀隱私權政策與社群守則。',
    },
    reconnect: {
      title: '這場活動如何？',
      description: '紀錄快速回饋，並加好友到名單中。',
      prompt: '保持連勝，讓主辦人知道感受。',
      placeholder: '有沒有下次可以改善的地方？',
      peopleYouMayAdd: '推薦加入好友',
    },
    joinConfirmation: {
      title: '你已加入！',
      description: '已將你加入名單並通知主辦人。',
      sharePrompt: '加入行事曆或分享給朋友一起參加。',
    },
    mapView: {
      title: '地圖模式',
      description: '用地區與氛圍快速瀏覽活動。',
      suburbSummary: '2 個活動進行中 · 1 個即將開始',
      suburbs: ['South Bank', 'Fortitude Valley', 'West End', 'Kangaroo Point'],
    },
    athleteCard: {
      title: '運動名片',
      description: '把你的球風和夥伴關係呈現給大家。',
      location: '布里斯本 · 籃球',
      levelLabel: '等級',
      levelValue: '中階後衛',
      sports: ['籃球', '路跑', '肌力'],
      strengths: ['防守溝通', '快攻帶球', '總是準時'],
      badges: ['第一場完成', '10 場出席', '夜跑戰士'],
      recentSessions: [
        { title: 'South Bank Hoops', sport: '籃球', date: '週日 · 晚上 6:30' },
        { title: 'River Loop Tempo', sport: '路跑', date: '週三 · 早上 5:45' },
        { title: 'Strength & Mobility', sport: '肌力', date: '週五 · 晚上 7:00' },
      ],
      upcomingSessions: [
        { title: 'Dawn Track Sprints', sport: '路跑', date: '週二 · 早上 5:30' },
        { title: 'City Night Hoops', sport: '籃球', date: '週四 · 晚上 8:00' },
      ],
      squad: [
        { name: 'Dana', sport: '手球隊長', lastPlayed: '週五五人制', avatarUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80' },
        { name: 'Jun', sport: '跑者', lastPlayed: '河濱節奏跑', avatarUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80' },
        { name: 'Bo', sport: '控球後衛', lastPlayed: 'South Bank Hoops', avatarUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80' },
      ],
      trustNote: '這張名片只顯示他選擇公開的資訊。',
      editFabLabel: '編輯運動名片',
    },
    callback: {
      signingIn: '登入中...',
      subcopy: '請稍候，我們正在完成驗證程序。',
    },
  },
}

export type TranslationSchema = typeof translations.en

export function getTranslation(language: Language): TranslationSchema {
  return translations[language]
}
