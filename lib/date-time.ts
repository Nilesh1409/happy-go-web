/** Minimum gap between pick-up and drop-off, in minutes */
export const MIN_GAP = 30;

/** 05 : 00 is the first rentable slot of the day */
export const FIRST_SLOT = "05:00";

/** Convert “HH:mm” → minutes since 00:00 */
export const timeToMinutes = (t?: string) =>
  t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3)) : 0;

/** Convert minutes since 00:00 → “HH:mm” */
export const minutesToTime = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0"
  )}`;

/** Round *up* to the next 30-minute slot */
export const ceilToSlot = (m: number) => Math.ceil(m / 30) * 30;

/**
 * Return the **nearest legal** drop-off {date, time}
 * – never before pick-up
 * – at least 30 min later if same day
 * – rolls to tomorrow 05:00 if no slot left today
 */
export function adjustDrop(
  puDate: Date,
  puTime: string,
  drDate: Date,
  drTime: string
) {
  const puMid = puDate.setHours(0, 0, 0, 0);
  const drMid = drDate.setHours(0, 0, 0, 0);

  // 1. If drop-off day < pick-up day ➜ move to pick-up day
  let newDate = drMid < puMid ? new Date(puMid) : new Date(drMid);
  let newTime = drTime;

  // 2. If same day, make sure time ≥ pick-up + gap
  if (+newDate === puMid) {
    const minMinutes = timeToMinutes(puTime) + MIN_GAP;
    if (!newTime || timeToMinutes(newTime) < minMinutes) {
      const candidate = ceilToSlot(minMinutes);
      // last legal slot is 22:30 (22*60+30 == 1350)
      if (candidate <= 1350) {
        newTime = minutesToTime(candidate);
      } else {
        // push to tomorrow 05:00
        newDate = new Date(puMid + 24 * 60 * 60 * 1000);
        newTime = FIRST_SLOT;
      }
    }
  }
  return { date: newDate, time: newTime };
}
