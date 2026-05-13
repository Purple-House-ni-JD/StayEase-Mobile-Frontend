import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  inputBorder: "#E0DDD8",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  rangeOverlay: "rgba(197,160,89,0.15)",
};

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const isSameDay = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isBetween = (date, start, end) => {
  if (!start || !end) return false;
  return date > start && date < end;
};

/**
 * CalendarPicker
 * A single-month date-range picker with check-in / check-out selection.
 *
 * @param {Date}      [initialCheckIn]   - Pre-selected check-in date
 * @param {Date}      [initialCheckOut]  - Pre-selected check-out date
 * @param {Function}  onRangeChange      - ({ checkIn, checkOut }) callback
 * @param {object}    [style]            - Container style override
 */
const CalendarPicker = ({
  initialCheckIn = null,
  initialCheckOut = null,
  onRangeChange,
  style,
  disabledDates = [],
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  // true = selecting check-in, false = selecting check-out
  const [selectingIn, setSelectingIn] = useState(!initialCheckIn);

  // Build the calendar grid for the current view month
  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // Monday-based offset (0=Mon…6=Sun)
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const grid = [];
    for (let i = 0; i < offset; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0, 0, 0, 0);
      grid.push(date);
    }
    return grid;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const handleDayPress = (date) => {
    if (!date || date < today) return;

    const state = getDayState(date);
    if (state === "disabled") return;

    if (selectingIn) {
      setCheckIn(date);
      setCheckOut(null);
      setSelectingIn(false);
      onRangeChange?.({ checkIn: date, checkOut: null });
    } else {
      if (checkIn && date <= checkIn) {
        // Tapped before check-in — restart
        setCheckIn(date);
        setCheckOut(null);
        onRangeChange?.({ checkIn: date, checkOut: null });
      } else {
        setCheckOut(date);
        setSelectingIn(true);
        onRangeChange?.({ checkIn, checkOut: date });
      }
    }
  };

  const getDayState = (date) => {
    if (!date) return "empty";
    if (date < today) return "past";
    if (disabledDates.some((d) => isSameDay(d, date))) return "disabled";
    if (isSameDay(date, checkIn)) return "start";
    if (isSameDay(date, checkOut)) return "end";
    if (isBetween(date, checkIn, checkOut)) return "range";
    return "default";
  };

  return (
    <View style={[styles.container, style]}>
      {/* Month navigation */}
      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={prevMonth}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[viewMonth].toUpperCase()} {viewYear}
        </Text>
        <TouchableOpacity
          onPress={nextMonth}
          style={styles.navBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.dayHeaders}>
        {DAY_LABELS.map((d, i) => (
          <Text key={i} style={styles.dayHeader}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {days.map((date, idx) => {
          const state = getDayState(date);
          return (
            <TouchableOpacity
              key={idx}
              style={styles.cell}
              onPress={() => handleDayPress(date)}
              activeOpacity={
                date && state !== "past" && state !== "disabled" ? 0.75 : 1
              }
              disabled={!date || state === "past" || state === "disabled"}
            >
              {/* Range highlight background */}
              {state === "range" && <View style={styles.rangeBg} />}
              {state === "start" && (
                <View style={[styles.rangeBg, styles.rangeBgStart]} />
              )}
              {state === "end" && (
                <View style={[styles.rangeBg, styles.rangeBgEnd]} />
              )}

              {/* Day circle */}
              <View
                style={[
                  styles.dayCircle,
                  (state === "start" || state === "end") &&
                    styles.dayCircleSelected,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    state === "past" && styles.dayTextPast,
                    state === "disabled" && styles.dayTextDisabled,
                    state === "range" && styles.dayTextRange,
                    (state === "start" || state === "end") &&
                      styles.dayTextSelected,
                  ]}
                >
                  {date ? date.getDate() : ""}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selection hint */}
      <Text style={styles.hint}>
        {selectingIn
          ? "Select check-in date"
          : checkIn && !checkOut
            ? "Select check-out date"
            : "Tap a date to change"}
      </Text>
    </View>
  );
};

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  // Month nav
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrow: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 22,
    color: COLORS.primary,
    lineHeight: 26,
  },
  monthLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 12,
    color: COLORS.secondary,
    letterSpacing: 2,
  },

  // Day headers
  dayHeaders: {
    flexDirection: "row",
    marginBottom: 4,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  // Grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  // Range highlight
  rangeBg: {
    position: "absolute",
    top: 4,
    bottom: 4,
    left: 0,
    right: 0,
    backgroundColor: COLORS.rangeOverlay,
  },
  rangeBgStart: {
    left: "50%",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  rangeBgEnd: {
    right: "50%",
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  // Day circle
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textBody,
  },
  dayTextPast: {
    color: COLORS.inputBorder,
  },
  dayTextDisabled: {
    color: COLORS.inputBorder,
  },
  dayTextRange: {
    color: COLORS.primary,
    fontFamily: "PlusJakartaSans-Bold",
  },
  dayTextSelected: {
    color: COLORS.neutral,
    fontFamily: "PlusJakartaSans-Bold",
  },

  // Hint
  hint: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 12,
  },
});

export default CalendarPicker;
