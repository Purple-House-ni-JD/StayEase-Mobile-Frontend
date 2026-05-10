import { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { COLORS, FONTS } from "../constants/colors";
import StarRating from "./StarRating";

/**
 * ReviewForm
 * Form for submitting a new review with star rating, comment, and submit.
 * Used in a modal/sheet for room detail pages.
 *
 * @param {number}    roomId        - Room being reviewed
 * @param {number}    bookingId     - Booking to link review to
 * @param {Function}  onSubmit      - Callback with review data on success
 * @param {Function}  [onCancel]    - Cancel button callback
 * @param {boolean}   [isSubmitting] - Loading state
 */
const ReviewForm = ({
  roomId,
  bookingId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (rating === 0) newErrors.rating = "Please select a rating";
    if (!comment.trim()) newErrors.comment = "Please write a comment";
    if (comment.trim().length < 10)
      newErrors.comment = "Comment must be at least 10 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await onSubmit({
        room: roomId,
        booking: bookingId,
        rating,
        comment: comment.trim(),
      });

      // Reset form on success
      setRating(0);
      setComment("");
      setErrors({});
    } catch (err) {
      Alert.alert("Error", "Failed to submit review");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Rating Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How would you rate your stay?</Text>
        <View style={styles.ratingContainer}>
          <StarRating rating={rating} onRate={setRating} size="lg" />
        </View>
        {errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}
      </View>

      {/* Comment Section */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={styles.sectionTitle}>Share your experience</Text>
          <Text style={styles.charCount}>{comment.length}/500</Text>
        </View>
        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about your stay, what did you like or dislike?"
            placeholderTextColor={COLORS.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            editable={!isSubmitting}
          />
        </View>
        {errors.comment && (
          <Text style={styles.errorText}>{errors.comment}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelBtn]}
          onPress={onCancel}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.submitBtn,
            isSubmitting && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.neutral} size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.neutral,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.headline,
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  charCount: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  ratingContainer: {
    paddingVertical: 8,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 8,
    overflow: "hidden",
  },
  textArea: {
    fontFamily: FONTS.body,
    fontSize: 13,
    color: COLORS.textBody,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: "#DC2626",
    marginTop: 6,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: COLORS.backgroundSoft,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  cancelBtnText: {
    fontFamily: FONTS.headline,
    fontSize: 13,
    color: COLORS.primary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: FONTS.headline,
    fontSize: 13,
    color: COLORS.neutral,
  },
});

export default ReviewForm;
