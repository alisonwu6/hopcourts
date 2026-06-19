export const daysList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const dayLabels: Record<string, string> = {
  Monday: '週一',
  Tuesday: '週二',
  Wednesday: '週三',
  Thursday: '週四',
  Friday: '週五',
  Saturday: '週六',
  Sunday: '週日',
}

export const createDaySlots = () =>
  daysList.reduce<Record<string, string[]>>((acc, day) => {
    acc[day] = []
    return acc
  }, {})
