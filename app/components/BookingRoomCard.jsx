/**
 * BookingRoomCard
 *
 * Displays one room entry inside a booking detail page.
 * Shows the room thumbnail, name, category, nightly snapshot price,
 * and the calculated subtotal for the stay.
 *
 * Props:
 *   bookingRoom  @param {object}  One entry from booking.booking_rooms
 *     bookingRoom.room            RoomListSerializer shape
 *     bookingRoom.price_snapshot  Decimal string — price per night at booking time
 *   nights       @param {number}  Number of nights for the stay
 *   style        @param {object}  Extra wrapper styles
 */

import { Image, StyleSheet, Text, View } from "react-native";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
};

const BookingRoomCard = ({ bookingRoom, nights = 1, style }) => {
  const { room, price_snapshot } = bookingRoom;
  const pricePerNight = parseFloat(price_snapshot) || 0;
  const subtotal = pricePerNight * nights;

  // Cloudinary image_urls is a JSON array of URL strings
  const imageUri =
    Array.isArray(room?.image_urls) && room.image_urls.length > 0
      ? room.image_urls[0]
      : null;

  return (
    <View style={[styles.card, style]}>
      {/* Thumbnail */}
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
          <Text style={styles.placeholderEmoji}>🛏</Text>
        </View>
      )}

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.roomName} numberOfLines={2}>
          {room?.name ?? "Room"}
        </Text>
        <Text style={styles.category}>
          {room?.category_display ?? room?.category ?? ""}
        </Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceLabel}>Per night</Text>
            <Text style={styles.priceValue}>
              ₱
              {pricePerNight.toLocaleString("en-PH", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.subtotalBlock}>
            <Text style={styles.priceLabel}>
              {nights} night{nights !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.subtotalValue}>
              ₱{subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: COLORS.neutral,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  // Thumbnail
  thumbnail: {
    width: 100,
    minHeight: 110,
  },
  thumbnailPlaceholder: {
    backgroundColor: "#2B4A6F",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderEmoji: {
    fontSize: 28,
  },

  // Info
  info: {
    flex: 1,
    padding: 14,
    gap: 4,
    justifyContent: "space-between",
  },
  roomName: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 14,
    color: COLORS.primary,
    lineHeight: 20,
  },
  category: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: "capitalize",
    marginBottom: 6,
  },

  // Price row
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceLabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 13,
    color: COLORS.textBody,
  },
  subtotalBlock: {
    alignItems: "flex-end",
  },
  subtotalValue: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 15,
    color: COLORS.secondary,
  },
});

export default BookingRoomCard;
