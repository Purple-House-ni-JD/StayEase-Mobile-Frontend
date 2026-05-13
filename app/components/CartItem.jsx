import { useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../constants/colors";

/**
 * Safely coerce a value to a Date object.
 * Handles: Date instances, ISO strings ("2026-05-10"), timestamps (numbers).
 * Returns null if the value is falsy or unparseable.
 */
const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (value) => {
  const date = toDate(value);
  if (!date) return "";
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
};

const diffNights = (checkIn, checkOut) => {
  const inDate = toDate(checkIn);
  const outDate = toDate(checkOut);
  if (!inDate || !outDate) return 0;
  return Math.max(
    0,
    Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)),
  );
};

/**
 * CartItem
 * A single room entry inside the booking cart.
 *
 * @param {object}         item               - Cart item object
 * @param {string}         item.id
 * @param {string}         item.name          - Room name
 * @param {any}            item.image         - require() or { uri } — optional
 * @param {Date|string}    item.checkIn       - Date object OR ISO string
 * @param {Date|string}    item.checkOut      - Date object OR ISO string
 * @param {number|string}  item.pricePerNight - number or decimal string from backend
 * @param {Function}       onRemove           - Called with item.id when trash is tapped
 * @param {object}         [style]
 */
const CartItem = ({ item, onRemove, style }) => {
  const pricePerNight = parseFloat(item.pricePerNight) || 0;
  const nights = diffNights(item.checkIn, item.checkOut);
  const subtotal = (pricePerNight * nights).toFixed(2);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleRemove = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onRemove?.(item.id));
  };

  const hasValidDates = toDate(item.checkIn) && toDate(item.checkOut);
  const dateLabel = hasValidDates
    ? `${formatDate(item.checkIn)} – ${formatDate(item.checkOut)}`
    : "Dates not set";

  return (
    <Animated.View
      style={[styles.card, { transform: [{ scale: scaleAnim }] }, style]}
    >
      {/* Room thumbnail */}
      {item.image ? (
        <Image
          source={
            typeof item.image === "string" ? { uri: item.image } : item.image
          }
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
      )}

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.roomName} numberOfLines={2}>
            {item.name}
          </Text>
          {/* Delete */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleRemove}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>

        {/* Date range */}
        <View style={styles.dateRow}>
          <Text style={styles.calIcon}>📅</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
        </View>

        {/* Nights + Price */}
        <View style={styles.bottomRow}>
          <Text style={styles.nightsText}>
            {nights} {nights === 1 ? "Night" : "Nights"}
          </Text>
          <Text style={styles.priceText}>₱{subtotal}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  // Thumbnail
  thumbnail: {
    width: 110,
    height: "100%",
    minHeight: 120,
  },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.backgroundSoft,
  },

  // Info block
  info: {
    flex: 1,
    padding: 14,
    gap: 6,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  roomName: {
    flex: 1,
    fontFamily: "NotoSerif-Bold",
    fontSize: 14.5,
    color: COLORS.primary,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
    marginTop: -2,
  },
  deleteIcon: {
    fontSize: 16,
    opacity: 0.55,
  },

  // Date
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  calIcon: {
    fontSize: 11,
    opacity: 0.6,
  },
  dateText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 10,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },

  // Nights + Price
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nightsText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 13.5,
    color: COLORS.textBody,
  },
  priceText: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 16,
    color: COLORS.secondary,
  },
});

export default CartItem;
