import { StyleSheet, Text, View } from "react-native";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
};

/**
 * BookingTicketCard
 *
 * A "torn ticket" styled card showing booking reference and key stay details.
 * The perforated divider visually separates the reference from the detail grid.
 *
 * Props:
 *  - reference   {string}   Booking reference code, e.g. "SE-9420815"
 *  - guestName   {string}   Guest full name
 *  - roomType    {string}   Room / suite label
 *  - checkIn     {string}   Check-in date string, e.g. "Oct 24, 2023"
 *  - checkOut    {string}   Check-out date string, e.g. "Oct 28, 2023"
 *  - checkInTime {string}   Check-in time, e.g. "2:00 PM"
 *  - checkOutTime {string}  Check-out time, e.g. "11:00 AM"
 *  - estimatedArrival {string} Estimated arrival time, e.g. "3:00 PM"
 *  - style       {object}   Extra styles for the outer wrapper
 */
const BookingTicketCard = ({
  reference,
  guestName,
  roomType,
  checkIn,
  checkOut,
  checkInTime,
  checkOutTime,
  estimatedArrival,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      {/* ── Header: Booking Reference ── */}
      <View style={styles.refRow}>
        <View>
          <Text style={styles.refLabel}>BOOKING REFERENCE</Text>
          <Text style={styles.refValue}>{reference}</Text>
        </View>
        <TicketIcon />
      </View>

      {/* ── Perforated Divider ── */}
      <PerforatedDivider />

      {/* ── Detail Grid ── */}
      <View style={styles.grid}>
        <DetailCell label="CHECK-IN" value={checkIn} style={styles.cellTop} />
        <DetailCell
          label="CHECK-OUT"
          value={checkOut}
          align="right"
          style={styles.cellTop}
        />
        {checkInTime && (
          <DetailCell label="CHECK-IN TIME" value={checkInTime} />
        )}
        {checkOutTime && (
          <DetailCell
            label="CHECK-OUT TIME"
            value={checkOutTime}
            align="right"
          />
        )}
        {estimatedArrival && (
          <DetailCell
            label="EST. ARRIVAL"
            value={estimatedArrival}
            style={styles.cellBottom}
          />
        )}
      </View>
    </View>
  );
};

// ── Perforated divider: dashed line with semicircle notches on both sides ──
const PerforatedDivider = () => (
  <View style={dividerStyles.wrapper}>
    <View style={[dividerStyles.notch, dividerStyles.notchLeft]} />
    <View style={dividerStyles.dashes} />
    <View style={[dividerStyles.notch, dividerStyles.notchRight]} />
  </View>
);

const dividerStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    marginHorizontal: -20, // bleed to card edges
  },
  notch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EAE8E3", // matches page background
    flexShrink: 0,
  },
  notchLeft: {
    marginLeft: -9,
  },
  notchRight: {
    marginRight: -9,
  },
  dashes: {
    flex: 1,
    height: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginHorizontal: 6,
  },
});

// ── Single label + value cell ──
const DetailCell = ({ label, value, align = "left", style }) => (
  <View
    style={[cellStyles.cell, align === "right" && cellStyles.alignRight, style]}
  >
    <Text
      style={[cellStyles.label, align === "right" && cellStyles.labelRight]}
    >
      {label}
    </Text>
    <Text
      style={[cellStyles.value, align === "right" && cellStyles.valueRight]}
    >
      {value}
    </Text>
  </View>
);

const cellStyles = StyleSheet.create({
  cell: {
    width: "50%",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  label: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  labelRight: {
    textAlign: "right",
  },
  value: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 16,
    color: COLORS.textBody,
    lineHeight: 22,
  },
  valueRight: {
    textAlign: "right",
  },
});

// ── Decorative ticket icon (two overlapping rectangles) ──
const TicketIcon = () => (
  <View style={ticketIconStyles.wrapper}>
    <Text style={ticketIconStyles.icon}>🎟</Text>
  </View>
);

const ticketIconStyles = StyleSheet.create({
  wrapper: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(197,160,89,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 18,
  },
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    overflow: "hidden",
  },

  // Reference row
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  refLabel: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  refValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 22,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },

  // Detail grid
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cellTop: {
    marginTop: 14,
  },
  cellBottom: {
    marginBottom: 14,
  },
});

export default BookingTicketCard;
