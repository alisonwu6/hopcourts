#!/usr/bin/env node
/**
 * Seed 100 Brisbane events via the API.
 * Venues are auto-created by the backend's resolveVenue() logic.
 *
 * Usage:
 *   AUTH_TOKEN=<your_token> node scripts/seed-events.js
 *   AUTH_TOKEN=<token> BASE_URL=https://your-staging-api.com node scripts/seed-events.js
 *
 * Get your AUTH_TOKEN from the browser:
 *   localStorage.getItem('sb-auth-token') or sessionStorage
 *   → copy the "access_token" value
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const AUTH_TOKEN = process.env.AUTH_TOKEN

if (!AUTH_TOKEN) {
  console.error('ERROR: AUTH_TOKEN is required.')
  console.error('  Get it from the browser: localStorage → sb-* key → access_token')
  console.error('  Then run: AUTH_TOKEN=<token> node scripts/seed-events.js')
  process.exit(1)
}

const API = `${BASE_URL}/api/v1/sessions`

function daysFromNow(days, hour, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

const SESSIONS = [
  // ── Kangaroo Point Cliffs Park ──
  { sport_key:'BASKETBALL', title:'Kangaroo Point Sunset Hoops',    starts_at:daysFromNow(1,17,30), ends_at:daysFromNow(1,19),    place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:4,  max_people:14, skill_level:'advanced',     is_free:true  },
  { sport_key:'RUNNING',    title:'Sunday Morning Run',             starts_at:daysFromNow(2,7),     ends_at:daysFromNow(2,8,30),  place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:3,  max_people:20, skill_level:'beginner',      is_free:true  },
  { sport_key:'YOGA',       title:'Sunrise Yoga by the Cliffs',     starts_at:daysFromNow(3,6),     ends_at:daysFromNow(3,7),     place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:4,  max_people:15, skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Split court fee' },
  { sport_key:'CYCLING',    title:'City Loop Cycling Group',        starts_at:daysFromNow(5,8),     ends_at:daysFromNow(5,10),    place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:4,  max_people:10, skill_level:'intermediate',  is_free:true  },
  { sport_key:'BASKETBALL', title:'3v3 Basketball Pickup',          starts_at:daysFromNow(6,18),    ends_at:daysFromNow(6,20),    place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:6,  max_people:12, skill_level:'intermediate',  is_free:true  },
  { sport_key:'BADMINTON',  title:'Badminton Social Session',       starts_at:daysFromNow(7,9),     ends_at:daysFromNow(7,11),    place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:300, price_mode:'total', price_note:'Court booking' },
  { sport_key:'HIKING',     title:'Cliffs & Story Bridge Walk',     starts_at:daysFromNow(9,7),     ends_at:daysFromNow(9,9,30),  place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:3,  max_people:15, skill_level:'beginner',      is_free:true  },
  { sport_key:'VOLLEYBALL', title:'Beach Volleyball Scrimmage',     starts_at:daysFromNow(10,16),   ends_at:daysFromNow(10,18),   place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:6,  max_people:12, skill_level:'intermediate',  is_free:true  },
  { sport_key:'GYM',        title:'Bodyweight & Calisthenics',      starts_at:daysFromNow(12,7),    ends_at:daysFromNow(12,8),    place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:2,  max_people:8,  skill_level:'intermediate',  is_free:true  },
  { sport_key:'FRISBEE',    title:'Ultimate Frisbee Fun Game',      starts_at:daysFromNow(14,15),   ends_at:daysFromNow(14,17),   place_name:'Kangaroo Point Cliffs Park', address:'River Tce, Kangaroo Point QLD 4169', lat:-27.4778, lng:153.0344, min_people:8,  max_people:20, skill_level:'beginner',      is_free:true  },

  // ── South Bank Parklands ──
  { sport_key:'TENNIS',     title:'South Bank Tennis Social',       starts_at:daysFromNow(1,9),     ends_at:daysFromNow(1,11),    place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:2,  max_people:4,  skill_level:'beginner',      is_free:false, price_total:400, price_mode:'total', price_note:'Court hire' },
  { sport_key:'BADMINTON',  title:'Intermediate Badminton',         starts_at:daysFromNow(2,18),    ends_at:daysFromNow(2,20),    place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:350, price_mode:'total', price_note:'Court hire' },
  { sport_key:'YOGA',       title:'Sunset Yoga Flow',               starts_at:daysFromNow(3,17,30), ends_at:daysFromNow(3,18,30), place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:3,  max_people:12, skill_level:'beginner',      is_free:false, price_total:150, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'BASKETBALL', title:'South Bank 5v5 Pickup',          starts_at:daysFromNow(4,19),    ends_at:daysFromNow(4,21),    place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:8,  max_people:14, skill_level:'intermediate',  is_free:true  },
  { sport_key:'RUNNING',    title:'Parkrun Style 5K',               starts_at:daysFromNow(6,7),     ends_at:daysFromNow(6,7,45),  place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:4,  max_people:30, skill_level:'beginner',      is_free:true  },
  { sport_key:'PILATES',    title:'Morning Pilates Flow',           starts_at:daysFromNow(7,7),     ends_at:daysFromNow(7,8),     place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:3,  max_people:10, skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'VOLLEYBALL', title:'South Bank Volleyball',          starts_at:daysFromNow(8,16),    ends_at:daysFromNow(8,18),    place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:6,  max_people:12, skill_level:'beginner',      is_free:true  },
  { sport_key:'TABLE_TENNIS',title:'Table Tennis Meetup',           starts_at:daysFromNow(10,10),   ends_at:daysFromNow(10,12),   place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:250, price_mode:'total', price_note:'Table hire' },
  { sport_key:'GYM',        title:'HIIT Training Circuit',          starts_at:daysFromNow(11,6,30), ends_at:daysFromNow(11,7,30), place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:4,  max_people:12, skill_level:'intermediate',  is_free:false, price_total:300, price_mode:'total', price_note:'Trainer fee' },
  { sport_key:'FRISBEE',    title:'South Bank Frisbee Pickup',      starts_at:daysFromNow(13,15),   ends_at:daysFromNow(13,17),   place_name:'South Bank Parklands', address:'Grey St, South Brisbane QLD 4101', lat:-27.4748, lng:153.0213, min_people:8,  max_people:16, skill_level:'beginner',      is_free:true  },

  // ── Milton / Caxton St ──
  { sport_key:'BASKETBALL', title:'Milton Hardcourt Pickup',        starts_at:daysFromNow(1,19),    ends_at:daysFromNow(1,21),    place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:6,  max_people:10, skill_level:'intermediate',  is_free:true  },
  { sport_key:'RUNNING',    title:'Milton Morning 10K',             starts_at:daysFromNow(2,6),     ends_at:daysFromNow(2,7,30),  place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:3,  max_people:20, skill_level:'intermediate',  is_free:true  },
  { sport_key:'CYCLING',    title:'Milton Criterium Training',      starts_at:daysFromNow(4,6),     ends_at:daysFromNow(4,8),     place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:4,  max_people:12, skill_level:'advanced',      is_free:false, price_total:400, price_mode:'total', price_note:'Track fee' },
  { sport_key:'TENNIS',     title:'Caxton St Tennis Doubles',       starts_at:daysFromNow(5,8),     ends_at:daysFromNow(5,10),    place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:4,  max_people:4,  skill_level:'intermediate',  is_free:false, price_total:500, price_mode:'total', price_note:'Court hire' },
  { sport_key:'VOLLEYBALL', title:'Mixed Volleyball Pickup',        starts_at:daysFromNow(6,17),    ends_at:daysFromNow(6,19),    place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:6,  max_people:12, skill_level:'beginner',      is_free:true  },
  { sport_key:'GYM',        title:'Strength & Conditioning',        starts_at:daysFromNow(7,6),     ends_at:daysFromNow(7,7),     place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:2,  max_people:6,  skill_level:'advanced',      is_free:false, price_total:350, price_mode:'total', price_note:'Equipment fee' },
  { sport_key:'BADMINTON',  title:'Milton Shuttle Smash',           starts_at:daysFromNow(9,18),    ends_at:daysFromNow(9,20),    place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:300, price_mode:'total', price_note:'Court hire' },
  { sport_key:'YOGA',       title:'Power Yoga Class',               starts_at:daysFromNow(10,7),    ends_at:daysFromNow(10,8),    place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:4,  max_people:15, skill_level:'intermediate',  is_free:false, price_total:200, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'FRISBEE',    title:'Milton Frisbee Crew',            starts_at:daysFromNow(12,16),   ends_at:daysFromNow(12,18),   place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:8,  max_people:20, skill_level:'beginner',      is_free:true  },
  { sport_key:'SWIMMING',   title:'Lane Swim Training',             starts_at:daysFromNow(14,6),    ends_at:daysFromNow(14,7),    place_name:'Caxton St Oval', address:'Caxton St, Milton QLD 4064', lat:-27.4648, lng:153.0089, min_people:2,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:450, price_mode:'total', price_note:'Pool entry' },

  // ── New Farm Park ──
  { sport_key:'TENNIS',     title:'New Farm Tennis Club Social',    starts_at:daysFromNow(1,8),     ends_at:daysFromNow(1,10),    place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:2,  max_people:4,  skill_level:'beginner',      is_free:false, price_total:400, price_mode:'total', price_note:'Court hire' },
  { sport_key:'RUNNING',    title:'New Farm Riverfront Run',        starts_at:daysFromNow(3,6,30),  ends_at:daysFromNow(3,7,30),  place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:3,  max_people:15, skill_level:'beginner',      is_free:true  },
  { sport_key:'YOGA',       title:'New Farm Morning Yoga',          starts_at:daysFromNow(4,7),     ends_at:daysFromNow(4,8),     place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:4,  max_people:12, skill_level:'beginner',      is_free:false, price_total:150, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'BASKETBALL', title:'New Farm 3v3 Pickup',            starts_at:daysFromNow(5,18),    ends_at:daysFromNow(5,20),    place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:6,  max_people:10, skill_level:'intermediate',  is_free:true  },
  { sport_key:'CYCLING',    title:'New Farm Park Loop',             starts_at:daysFromNow(7,7),     ends_at:daysFromNow(7,9),     place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:3,  max_people:10, skill_level:'beginner',      is_free:true  },
  { sport_key:'BADMINTON',  title:'New Farm Badminton Social',      starts_at:daysFromNow(8,9),     ends_at:daysFromNow(8,11),    place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:280, price_mode:'total', price_note:'Court hire' },
  { sport_key:'VOLLEYBALL', title:'New Farm Volleyball Pickup',     starts_at:daysFromNow(9,16),    ends_at:daysFromNow(9,18),    place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:6,  max_people:12, skill_level:'beginner',      is_free:true  },
  { sport_key:'GYM',        title:'Park Bootcamp',                  starts_at:daysFromNow(11,6),    ends_at:daysFromNow(11,7),    place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:4,  max_people:15, skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Trainer fee' },
  { sport_key:'FRISBEE',    title:'New Farm Frisbee Sunday',        starts_at:daysFromNow(13,15),   ends_at:daysFromNow(13,17),   place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:8,  max_people:18, skill_level:'beginner',      is_free:true  },
  { sport_key:'PILATES',    title:'New Farm Pilates Outdoors',      starts_at:daysFromNow(15,8),    ends_at:daysFromNow(15,9),    place_name:'New Farm Park', address:'Brunswick St, New Farm QLD 4005', lat:-27.4676, lng:153.0461, min_people:3,  max_people:10, skill_level:'beginner',      is_free:false, price_total:180, price_mode:'total', price_note:'Instructor fee' },

  // ── Musgrave Park / West End ──
  { sport_key:'BASKETBALL', title:'Musgrave Park Hoops',            starts_at:daysFromNow(1,16),    ends_at:daysFromNow(1,18),    place_name:'Musgrave Park', address:'Russell St, South Brisbane QLD 4101', lat:-27.4815, lng:153.0177, min_people:4,  max_people:10, skill_level:'beginner',      is_free:true  },
  { sport_key:'YOGA',       title:'Community Yoga South Brisbane',  starts_at:daysFromNow(2,8),     ends_at:daysFromNow(2,9),     place_name:'Musgrave Park', address:'Russell St, South Brisbane QLD 4101', lat:-27.4815, lng:153.0177, min_people:3,  max_people:20, skill_level:'beginner',      is_free:false, price_total:100, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'RUNNING',    title:'Musgrave 5K Jog',                starts_at:daysFromNow(4,7),     ends_at:daysFromNow(4,8),     place_name:'Musgrave Park', address:'Russell St, South Brisbane QLD 4101', lat:-27.4815, lng:153.0177, min_people:2,  max_people:15, skill_level:'beginner',      is_free:true  },
  { sport_key:'VOLLEYBALL', title:'South Bris Volleyball Pickup',   starts_at:daysFromNow(5,17),    ends_at:daysFromNow(5,19),    place_name:'Musgrave Park', address:'Russell St, South Brisbane QLD 4101', lat:-27.4815, lng:153.0177, min_people:6,  max_people:12, skill_level:'beginner',      is_free:true  },
  { sport_key:'CYCLING',    title:'South Side Bike Ride',           starts_at:daysFromNow(6,7),     ends_at:daysFromNow(6,9),     place_name:'Musgrave Park', address:'Russell St, South Brisbane QLD 4101', lat:-27.4815, lng:153.0177, min_people:3,  max_people:8,  skill_level:'beginner',      is_free:true  },
  { sport_key:'YOGA',       title:'West End Yoga Community',        starts_at:daysFromNow(1,8),     ends_at:daysFromNow(1,9),     place_name:'West End Community Centre', address:'Vulture St, West End QLD 4101', lat:-27.4833, lng:153.0116, min_people:4,  max_people:20, skill_level:'beginner',      is_free:false, price_total:120, price_mode:'total', price_note:'Hall hire' },
  { sport_key:'PILATES',    title:'West End Mat Pilates',           starts_at:daysFromNow(2,9),     ends_at:daysFromNow(2,10),    place_name:'West End Community Centre', address:'Vulture St, West End QLD 4101', lat:-27.4833, lng:153.0116, min_people:3,  max_people:12, skill_level:'beginner',      is_free:false, price_total:150, price_mode:'total', price_note:'Hall hire' },
  { sport_key:'RUNNING',    title:'West End to South Bank Run',     starts_at:daysFromNow(3,6),     ends_at:daysFromNow(3,7),     place_name:'West End Community Centre', address:'Vulture St, West End QLD 4101', lat:-27.4833, lng:153.0116, min_people:3,  max_people:15, skill_level:'beginner',      is_free:true  },
  { sport_key:'BADMINTON',  title:'West End Badminton Casual',      starts_at:daysFromNow(5,18),    ends_at:daysFromNow(5,20),    place_name:'West End Community Centre', address:'Vulture St, West End QLD 4101', lat:-27.4833, lng:153.0116, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:260, price_mode:'total', price_note:'Court hire' },
  { sport_key:'GYM',        title:'West End Community HIIT',        starts_at:daysFromNow(7,6,30),  ends_at:daysFromNow(7,7,30),  place_name:'West End Community Centre', address:'Vulture St, West End QLD 4101', lat:-27.4833, lng:153.0116, min_people:4,  max_people:15, skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Trainer fee' },

  // ── Victoria Park Tennis Centre, Herston ──
  { sport_key:'TENNIS',     title:'Victoria Park Doubles Round Robin', starts_at:daysFromNow(1,10), ends_at:daysFromNow(1,12),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:600, price_mode:'total', price_note:'Court hire' },
  { sport_key:'TENNIS',     title:'Beginner Tennis Coaching Game',  starts_at:daysFromNow(3,9),     ends_at:daysFromNow(3,11),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:2,  max_people:4,  skill_level:'beginner',      is_free:false, price_total:400, price_mode:'total', price_note:'Court hire' },
  { sport_key:'BADMINTON',  title:'Herston Shuttle Session',        starts_at:daysFromNow(4,18),    ends_at:daysFromNow(4,20),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:320, price_mode:'total', price_note:'Court hire' },
  { sport_key:'YOGA',       title:'Victoria Park Evening Yoga',     starts_at:daysFromNow(5,17,30), ends_at:daysFromNow(5,18,30), place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:4,  max_people:15, skill_level:'beginner',      is_free:false, price_total:180, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'RUNNING',    title:'Herston Parklands Run',          starts_at:daysFromNow(6,6,30),  ends_at:daysFromNow(6,7,30),  place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:3,  max_people:15, skill_level:'beginner',      is_free:true  },
  { sport_key:'PICKLEBALL', title:'Intro to Pickleball',            starts_at:daysFromNow(7,10),    ends_at:daysFromNow(7,12),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:350, price_mode:'total', price_note:'Court hire' },
  { sport_key:'PICKLEBALL', title:'Pickleball Mixed Doubles',       starts_at:daysFromNow(9,10),    ends_at:daysFromNow(9,12),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:400, price_mode:'total', price_note:'Court hire' },
  { sport_key:'TABLE_TENNIS',title:'Victoria Park TT Meetup',       starts_at:daysFromNow(11,10),   ends_at:daysFromNow(11,12),   place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Table hire' },
  { sport_key:'GYM',        title:'Park Strength Circuit',          starts_at:daysFromNow(12,7),    ends_at:daysFromNow(12,8),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:3,  max_people:10, skill_level:'intermediate',  is_free:false, price_total:280, price_mode:'total', price_note:'Equipment fee' },
  { sport_key:'CYCLING',    title:'Herston to New Farm Ride',       starts_at:daysFromNow(14,7),    ends_at:daysFromNow(14,9),    place_name:'Victoria Park Tennis Centre', address:'Herston Rd, Herston QLD 4006', lat:-27.4553, lng:153.0225, min_people:3,  max_people:10, skill_level:'beginner',      is_free:true  },

  // ── Fortitude Valley ──
  { sport_key:'GYM',        title:'Valley Barbell Club',            starts_at:daysFromNow(1,7),     ends_at:daysFromNow(1,8,30),  place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:2,  max_people:6,  skill_level:'advanced',      is_free:false, price_total:400, price_mode:'total', price_note:'Gym access' },
  { sport_key:'GYM',        title:'Valley HIIT Blast',              starts_at:daysFromNow(2,6,30),  ends_at:daysFromNow(2,7,30),  place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:4,  max_people:12, skill_level:'intermediate',  is_free:false, price_total:300, price_mode:'total', price_note:'Trainer fee' },
  { sport_key:'BASKETBALL', title:'Valley 3v3 Pickup',              starts_at:daysFromNow(3,19),    ends_at:daysFromNow(3,21),    place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:6,  max_people:10, skill_level:'intermediate',  is_free:false, price_total:350, price_mode:'total', price_note:'Court hire' },
  { sport_key:'YOGA',       title:'Valley Power Yoga',              starts_at:daysFromNow(4,17,30), ends_at:daysFromNow(4,18,30), place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:4,  max_people:15, skill_level:'intermediate',  is_free:false, price_total:200, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'BADMINTON',  title:'Valley Shuttle Kings',           starts_at:daysFromNow(6,18),    ends_at:daysFromNow(6,20),    place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:4,  max_people:8,  skill_level:'advanced',      is_free:false, price_total:380, price_mode:'total', price_note:'Court hire' },
  { sport_key:'BOULDERING', title:'Valley Bouldering Session',      starts_at:daysFromNow(7,17),    ends_at:daysFromNow(7,19),    place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:2,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:450, price_mode:'total', price_note:'Climbing access' },
  { sport_key:'BOULDERING', title:'Advanced Bouldering Problems',   starts_at:daysFromNow(9,17),    ends_at:daysFromNow(9,19),    place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:2,  max_people:6,  skill_level:'advanced',      is_free:false, price_total:500, price_mode:'total', price_note:'Climbing access' },
  { sport_key:'PILATES',    title:'Valley Pilates & Core',          starts_at:daysFromNow(11,7),    ends_at:daysFromNow(11,8),    place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:3,  max_people:10, skill_level:'beginner',      is_free:false, price_total:220, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'TABLE_TENNIS',title:'Valley TT Night',               starts_at:daysFromNow(12,19),   ends_at:daysFromNow(12,21),   place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:250, price_mode:'total', price_note:'Table hire' },
  { sport_key:'SKATEBOARDING',title:'Valley Skate Session',         starts_at:daysFromNow(14,15),   ends_at:daysFromNow(14,17),   place_name:'RNA Showgrounds', address:'Ann St, Fortitude Valley QLD 4006', lat:-27.4565, lng:153.0356, min_people:2,  max_people:10, skill_level:'beginner',      is_free:true  },

  // ── Carindale ──
  { sport_key:'BASKETBALL', title:'Carindale Hoops Night',          starts_at:daysFromNow(2,19),    ends_at:daysFromNow(2,21),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:6,  max_people:10, skill_level:'intermediate',  is_free:false, price_total:400, price_mode:'total', price_note:'Court hire' },
  { sport_key:'BADMINTON',  title:'Carindale Badminton League',     starts_at:daysFromNow(3,18),    ends_at:daysFromNow(3,20),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:350, price_mode:'total', price_note:'Court hire' },
  { sport_key:'SWIMMING',   title:'Carindale Lap Swim',             starts_at:daysFromNow(4,6),     ends_at:daysFromNow(4,7),     place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:2,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:500, price_mode:'total', price_note:'Pool entry' },
  { sport_key:'YOGA',       title:'Carindale Yoga Thursday',        starts_at:daysFromNow(5,9),     ends_at:daysFromNow(5,10),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:3,  max_people:12, skill_level:'beginner',      is_free:false, price_total:180, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'TABLE_TENNIS',title:'Carindale TT Open Play',        starts_at:daysFromNow(6,10),    ends_at:daysFromNow(6,12),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Table hire' },
  { sport_key:'GYM',        title:'Carindale Strength Training',    starts_at:daysFromNow(7,7),     ends_at:daysFromNow(7,8,30),  place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:2,  max_people:6,  skill_level:'advanced',      is_free:false, price_total:350, price_mode:'total', price_note:'Equipment fee' },
  { sport_key:'VOLLEYBALL', title:'Carindale Volleyball Social',    starts_at:daysFromNow(9,18),    ends_at:daysFromNow(9,20),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:6,  max_people:12, skill_level:'beginner',      is_free:false, price_total:300, price_mode:'total', price_note:'Court hire' },
  { sport_key:'PILATES',    title:'Carindale Pilates',              starts_at:daysFromNow(10,8),    ends_at:daysFromNow(10,9),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:3,  max_people:10, skill_level:'beginner',      is_free:false, price_total:250, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'TENNIS',     title:'Carindale Tennis Round Robin',   starts_at:daysFromNow(12,9),    ends_at:daysFromNow(12,11),   place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:500, price_mode:'total', price_note:'Court hire' },
  { sport_key:'RUNNING',    title:'Carindale Creek Trail Run',      starts_at:daysFromNow(14,6,30), ends_at:daysFromNow(14,8),    place_name:'Carindale Sports Centre', address:'Creek Rd, Carindale QLD 4152', lat:-27.5007, lng:153.1002, min_people:3,  max_people:15, skill_level:'intermediate',  is_free:true  },

  // ── Coorparoo ──
  { sport_key:'SWIMMING',   title:'Coorparoo Swim Squad',           starts_at:daysFromNow(1,6),     ends_at:daysFromNow(1,7),     place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:2,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:500, price_mode:'total', price_note:'Pool entry' },
  { sport_key:'BASKETBALL', title:'Coorparoo Hardcourt Pickup',     starts_at:daysFromNow(2,18),    ends_at:daysFromNow(2,20),    place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:6,  max_people:10, skill_level:'intermediate',  is_free:false, price_total:350, price_mode:'total', price_note:'Court hire' },
  { sport_key:'BADMINTON',  title:'Coorparoo Badminton Night',      starts_at:daysFromNow(3,19),    ends_at:daysFromNow(3,21),    place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:4,  max_people:8,  skill_level:'intermediate',  is_free:false, price_total:320, price_mode:'total', price_note:'Court hire' },
  { sport_key:'VOLLEYBALL', title:'Coorparoo Volleyball Pickup',    starts_at:daysFromNow(4,17),    ends_at:daysFromNow(4,19),    place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:6,  max_people:12, skill_level:'beginner',      is_free:false, price_total:300, price_mode:'total', price_note:'Court hire' },
  { sport_key:'GYM',        title:'Coorparoo Bootcamp',             starts_at:daysFromNow(5,6,30),  ends_at:daysFromNow(5,7,30),  place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:4,  max_people:12, skill_level:'intermediate',  is_free:false, price_total:280, price_mode:'total', price_note:'Trainer fee' },
  { sport_key:'YOGA',       title:'Coorparoo Evening Yoga',         starts_at:daysFromNow(7,17,30), ends_at:daysFromNow(7,18,30), place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:3,  max_people:15, skill_level:'beginner',      is_free:false, price_total:160, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'TABLE_TENNIS',title:'Coorparoo TT Meetup',           starts_at:daysFromNow(8,10),    ends_at:daysFromNow(8,12),    place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:4,  max_people:8,  skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Table hire' },
  { sport_key:'TENNIS',     title:'Coorparoo Tennis Social',        starts_at:daysFromNow(10,9),    ends_at:daysFromNow(10,11),   place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:2,  max_people:4,  skill_level:'intermediate',  is_free:false, price_total:500, price_mode:'total', price_note:'Court hire' },
  { sport_key:'CYCLING',    title:'Coorparoo to City Ride',         starts_at:daysFromNow(11,7),    ends_at:daysFromNow(11,9),    place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:3,  max_people:10, skill_level:'intermediate',  is_free:true  },
  { sport_key:'PILATES',    title:'Coorparoo Pilates & Stretch',    starts_at:daysFromNow(13,8),    ends_at:daysFromNow(13,9),    place_name:'Coorparoo Recreation Centre', address:'Cavendish Rd, Coorparoo QLD 4151', lat:-27.4986, lng:153.0525, min_people:3,  max_people:10, skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Instructor fee' },

  // ── Brisbane CBD / Riverside ──
  { sport_key:'RUNNING',    title:'Brisbane River Loop',            starts_at:daysFromNow(1,6),     ends_at:daysFromNow(1,7,30),  place_name:'Riverside Drive', address:'Riverside Dr, Brisbane City QLD 4000', lat:-27.4698, lng:153.0251, min_people:3,  max_people:20, skill_level:'beginner',      is_free:true  },
  { sport_key:'CYCLING',    title:'CBD to Southbank Ride',          starts_at:daysFromNow(2,7),     ends_at:daysFromNow(2,8,30),  place_name:'Queens Wharf Precinct', address:'Queens Wharf Rd, Brisbane City QLD 4000', lat:-27.4698, lng:153.0194, min_people:3,  max_people:12, skill_level:'beginner',      is_free:true  },
  { sport_key:'YOGA',       title:'Botanic Gardens Morning Yoga',   starts_at:daysFromNow(3,7),     ends_at:daysFromNow(3,8),     place_name:'City Botanic Gardens', address:'Alice St, Brisbane City QLD 4000', lat:-27.4751, lng:153.0307, min_people:4,  max_people:20, skill_level:'beginner',      is_free:false, price_total:120, price_mode:'total', price_note:'Instructor fee' },
  { sport_key:'BASKETBALL', title:'Roma Street Pickup',             starts_at:daysFromNow(4,18),    ends_at:daysFromNow(4,20),    place_name:'Roma Street Parkland', address:'1 Parkland Blvd, Brisbane City QLD 4000', lat:-27.4618, lng:153.0176, min_people:6,  max_people:12, skill_level:'intermediate',  is_free:true  },
  { sport_key:'HIKING',     title:'Mt Coot-tha Summit Hike',        starts_at:daysFromNow(5,6),     ends_at:daysFromNow(5,8,30),  place_name:'Mt Coot-tha Lookout', address:'Sir Samuel Griffith Dr, Toowong QLD 4066', lat:-27.4786, lng:152.9770, min_people:3,  max_people:15, skill_level:'intermediate',  is_free:true  },
  { sport_key:'HIKING',     title:'Mt Coot-tha Trail Run',          starts_at:daysFromNow(8,6),     ends_at:daysFromNow(8,8),     place_name:'Mt Coot-tha Lookout', address:'Sir Samuel Griffith Dr, Toowong QLD 4066', lat:-27.4786, lng:152.9770, min_people:3,  max_people:10, skill_level:'advanced',      is_free:true  },
  { sport_key:'FRISBEE',    title:'Botanic Gardens Frisbee',        starts_at:daysFromNow(9,15),    ends_at:daysFromNow(9,17),    place_name:'City Botanic Gardens', address:'Alice St, Brisbane City QLD 4000', lat:-27.4751, lng:153.0307, min_people:8,  max_people:20, skill_level:'beginner',      is_free:true  },
  { sport_key:'VOLLEYBALL', title:'Roma Street Volleyball',         starts_at:daysFromNow(11,16),   ends_at:daysFromNow(11,18),   place_name:'Roma Street Parkland', address:'1 Parkland Blvd, Brisbane City QLD 4000', lat:-27.4618, lng:153.0176, min_people:6,  max_people:12, skill_level:'beginner',      is_free:true  },
  { sport_key:'SWIMMING',   title:'Valley Pool Swim Session',       starts_at:daysFromNow(12,6),    ends_at:daysFromNow(12,7),    place_name:'Fortitude Valley Pool', address:'432 Wickham St, Fortitude Valley QLD 4006', lat:-27.4580, lng:153.0390, min_people:2,  max_people:10, skill_level:'intermediate',  is_free:false, price_total:550, price_mode:'total', price_note:'Pool entry' },
  { sport_key:'GYM',        title:'Kelvin Grove Bootcamp',          starts_at:daysFromNow(14,7),    ends_at:daysFromNow(14,8),    place_name:'Kelvin Grove Urban Village', address:'Musk Ave, Kelvin Grove QLD 4059', lat:-27.4487, lng:153.0148, min_people:4,  max_people:15, skill_level:'beginner',      is_free:false, price_total:200, price_mode:'total', price_note:'Trainer fee' },
]

async function createSession(session) {
  const body = {
    sport_key: session.sport_key,
    title: session.title,
    starts_at: session.starts_at,
    ends_at: session.ends_at,
    place_name: session.place_name,
    address: session.address,
    lat: session.lat,
    lng: session.lng,
    min_people: session.min_people,
    max_people: session.max_people,
    skill_level: session.skill_level,
    gender: 'mixed',
    status: 'published',
    visibility: 'public',
    is_free: session.is_free,
    ...(session.is_free ? {} : {
      price_total: session.price_total,
      price_mode: session.price_mode,
      price_note: session.price_note,
    }),
  }

  const res = await fetch(API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(data)}`)
  return data
}

async function main() {
  console.log(`Seeding ${SESSIONS.length} sessions → ${API}`)
  let ok = 0, fail = 0

  for (const session of SESSIONS) {
    try {
      await createSession(session)
      process.stdout.write('.')
      ok++
    } catch (err) {
      process.stdout.write('x')
      console.error(`\nFailed: ${session.title} — ${err.message}`)
      fail++
    }
  }

  console.log(`\n\nDone: ${ok} created, ${fail} failed`)
}

main().catch(err => { console.error(err); process.exit(1) })
