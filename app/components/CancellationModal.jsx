import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
  danger: "#C0392B",
  dangerBg: "#FDF0EF",
  dangerBorder: "#F5C6C2",
};

const CANCELLATION_REASONS = [
  { value: "change_of_plans", label: "Change of Plans", icon: "📅" },
  { value: "found_better_deal", label: "Found Better Deal", icon: "💰" },
  { value: "booking_error", label: "Booking Error", icon: "❌" },
  { value: "travel_restrictions", label: "Travel Restrictions", icon: "🌍" },
  { value: "emergency", label: "Emergency", icon: "🚨" },
  { value: "weather_issues", label: "Weather Issues", icon: "🌧️" },
  { value: "other", label: "Other", icon: "📝" },
];

const CancellationModal = ({
  visible,
  onClose,
  onConfirm,
  bookingRef,
  isLoading,
}) => {
  const [selectedReason, setSelectedReason] = useState(null);
  const [notes, setNotes] = useState("");

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason, notes);
    }
  };

  const handleClose = () => {
    setSelectedReason(null);
    setNotes("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Booking</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textBody} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.bookingRefText}>
              Booking: <Text style={styles.bookingRefValue}>{bookingRef}</Text>
            </Text>

            <Text style={styles.sectionTitle}>Why are you cancelling?</Text>
            <Text style={styles.sectionSubtitle}>
              Your feedback helps us improve
            </Text>

            {CANCELLATION_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason.value}
                style={[
                  styles.reasonOption,
                  selectedReason === reason.value &&
                    styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason.value)}
              >
                <Text style={styles.reasonIcon}>{reason.icon}</Text>
                <View style={styles.reasonTextContainer}>
                  <Text
                    style={[
                      styles.reasonLabel,
                      selectedReason === reason.value &&
                        styles.reasonLabelSelected,
                    ]}
                  >
                    {reason.label}
                  </Text>
                </View>
                {selectedReason === reason.value && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={COLORS.secondary}
                  />
                )}
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              multiline
              numberOfLines={4}
              placeholder="Please share any additional details about your cancellation..."
              placeholderTextColor={COLORS.textMuted}
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelModalBtnText}>Go Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmCancelBtn,
                  (!selectedReason || isLoading) &&
                    styles.confirmCancelBtnDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selectedReason || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.neutral} size="small" />
                ) : (
                  <Text style={styles.confirmCancelBtnText}>
                    Confirm Cancellation
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.policyNote}>
              Note: Cancellation policies may apply. Please review our
              cancellation policy before confirming.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.neutral,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBorder,
  },
  modalTitle: {
    fontFamily: "NotoSerif-Bold",
    fontSize: 20,
    color: COLORS.primary,
  },
  closeBtn: {
    padding: 4,
  },
  bookingRefText: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textMuted,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  bookingRefValue: {
    fontFamily: "PlusJakartaSans-Bold",
    color: COLORS.primary,
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 15,
    color: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 12,
    color: COLORS.textMuted,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  reasonOptionSelected: {
    backgroundColor: `${COLORS.secondary}10`,
    borderColor: COLORS.secondary,
    borderWidth: 2,
  },
  reasonIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonLabel: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
  },
  reasonLabelSelected: {
    fontFamily: "PlusJakartaSans-Bold",
    color: COLORS.primary,
  },
  notesInput: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 14,
    color: COLORS.textBody,
    textAlignVertical: "top",
    minHeight: 100,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: "center",
  },
  cancelModalBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.textBody,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.danger,
    alignItems: "center",
  },
  confirmCancelBtnDisabled: {
    opacity: 0.5,
  },
  confirmCancelBtnText: {
    fontFamily: "PlusJakartaSans-Bold",
    fontSize: 14,
    color: COLORS.neutral,
  },
  policyNote: {
    fontFamily: "PlusJakartaSans-Regular",
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
});

export default CancellationModal;
