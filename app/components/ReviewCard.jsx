import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONTS } from "../constants/colors";
import StarRating from "./StarRating";

/**
 * ReviewCard
 * Displays a single review with user name, rating, comment, and date.
 * Optionally shows edit/delete buttons if review is from current user.
 *
 * @param {object}    review          - Review object { id, user_name, rating, comment, created_at }
 * @param {boolean}   [isOwner]       - Show edit/delete actions
 * @param {Function}  [onEdit]        - Edit button callback
 * @param {Function}  [onDelete]      - Delete button callback
 * @param {object}    [style]         - Container style
 */
const ReviewCard = ({ review, isOwner = false, onEdit, onDelete, style }) => {
  const createdDate = new Date(review.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <View style={[styles.card, style]}>
      {/* Header: Name + Date + Actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.userName}>{review.user_name}</Text>
          <Text style={styles.date}>{createdDate}</Text>
        </View>
        {isOwner && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={onEdit}
                activeOpacity={0.7}
                style={styles.actionBtn}
              >
                <Text style={styles.actionBtnText}>✎ Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                activeOpacity={0.7}
                style={[styles.actionBtn, styles.deleteBtn]}
              >
                <Text style={styles.deleteText}>✕ Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <StarRating rating={review.rating} disabled size="sm" />
        <Text style={styles.ratingLabel}>{review.rating}.0</Text>
      </View>

      {/* Comment */}
      <Text style={styles.comment} numberOfLines={5}>
        {review.comment}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.neutral,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  userName: {
    fontFamily: FONTS.headline,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 2,
  },
  date: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: COLORS.badgeBg,
  },
  actionBtnText: {
    fontFamily: FONTS.label,
    fontSize: 11,
    color: COLORS.secondary,
  },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
  },
  deleteText: {
    fontFamily: FONTS.label,
    fontSize: 11,
    color: "#DC2626",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  ratingLabel: {
    fontFamily: FONTS.headline,
    fontSize: 13,
    color: COLORS.secondary,
  },
  comment: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textBody,
    lineHeight: 20,
  },
});

export default ReviewCard;
