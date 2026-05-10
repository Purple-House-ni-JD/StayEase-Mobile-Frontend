/**
 * EditProfilePage
 * Route: pages/EditProfilePage
 *
 * Lets the user update first_name, last_name, username, phone_number.
 * Email is read-only (backend enforced).
 * Avatar upload → PATCH /auth/me/avatar/ via Cloudinary.
 * Profile fields → PATCH /auth/me/.
 * On save, AuthContext.updateUser() propagates changes app-wide.
 */

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "@/context/AuthContext";
import { updateMe, uploadAvatar } from "@/services/authService";
import { extractErrorMessage } from "@/lib/errorUtils";
import TopBar from "../components/TopBar";
import FormField from "../components/FormField";
import SectionCard from "../components/SectionCard";
import ProviderBadge from "../components/ProviderBadge";
import AuthRequiredPrompt from "../components/AuthRequiredPrompt";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#0A1D37",
  secondary: "#C5A059",
  neutral: "#FFFFFF",
  background: "#F5F3EF",
  textMuted: "#9A9690",
  textBody: "#3A3530",
  inputBorder: "#E0DDD8",
  danger: "#C0392B",
};

const FONTS = {
  headline: "NotoSerif-Bold",
  body: "PlusJakartaSans-Regular",
  bold: "PlusJakartaSans-Bold",
};

// ─── Validation ───────────────────────────────────────────────────────────────
const validate = ({ first_name, last_name, phone_number }) => {
  const errors = {};
  if (!first_name.trim()) errors.first_name = "First name is required.";
  if (!last_name.trim()) errors.last_name = "Last name is required.";
  if (phone_number && !/^[0-9+\-\s]{7,15}$/.test(phone_number.trim())) {
    errors.phone_number = "Enter a valid phone number.";
  }
  return errors;
};

// ─── AvatarSection ────────────────────────────────────────────────────────────
const AvatarSection = ({ user, uploading, onPress }) => {
  const initial = (
    user?.first_name?.[0] ??
    user?.username?.[0] ??
    "G"
  ).toUpperCase();

  return (
    <View style={avatarStyles.wrapper}>
      <TouchableOpacity
        style={avatarStyles.ring}
        onPress={onPress}
        disabled={uploading}
        activeOpacity={0.8}
      >
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={avatarStyles.image} />
        ) : (
          <View style={avatarStyles.placeholder}>
            <Text style={avatarStyles.initial}>{initial}</Text>
          </View>
        )}
        <View style={avatarStyles.overlay}>
          {uploading ? (
            <ActivityIndicator size="small" color={COLORS.neutral} />
          ) : (
            <Text style={avatarStyles.overlayIcon}>📷</Text>
          )}
        </View>
      </TouchableOpacity>
      <Text style={avatarStyles.hint}>Tap to change photo</Text>
    </View>
  );
};

const avatarStyles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingVertical: 28,
  },
  ring: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2.5,
    borderColor: COLORS.secondary,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    backgroundColor: "rgba(10,29,55,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontFamily: FONTS.headline,
    fontSize: 36,
    color: COLORS.secondary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  overlayIcon: { fontSize: 22 },
  hint: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});

// ─── SaveButton ───────────────────────────────────────────────────────────────
const SaveButton = ({ onPress, loading, disabled }) => (
  <TouchableOpacity
    style={[styles.saveBtn, disabled && styles.saveBtnDisabled]}
    onPress={onPress}
    disabled={disabled || loading}
    activeOpacity={0.85}
  >
    {loading ? (
      <ActivityIndicator color={COLORS.neutral} />
    ) : (
      <Text style={styles.saveBtnText}>Save Changes</Text>
    )}
  </TouchableOpacity>
);

// ─── EditProfilePage ──────────────────────────────────────────────────────────
const EditProfilePage = () => {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    username: user?.username ?? "",
    phone_number: user?.phone_number ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Re-sync if the user object changes (e.g. after avatar upload)
  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      username: user.username ?? "",
      phone_number: user.phone_number ?? "",
    });
  }, [user?.id]);

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const isDirty =
    form.first_name !== (user?.first_name ?? "") ||
    form.last_name !== (user?.last_name ?? "") ||
    form.username !== (user?.username ?? "") ||
    form.phone_number !== (user?.phone_number ?? "");

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handlePickAvatar = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to change your avatar.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;

    try {
      setUploading(true);
      const data = await uploadAvatar(result.assets[0]);
      updateUser({ avatar_url: data.avatar_url });
    } catch (err) {
      Alert.alert("Upload failed", extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});

    try {
      setSaving(true);
      const updated = await updateMe({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim() || undefined,
        phone_number: form.phone_number.trim(),
      });
      updateUser(updated);
      Alert.alert("Profile updated", "Your changes have been saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object" && !data.detail) {
        // Map backend field errors → form errors
        setErrors(
          Object.fromEntries(
            Object.entries(data).map(([k, v]) => [
              k,
              Array.isArray(v) ? v.join(" ") : String(v),
            ]),
          ),
        );
      } else {
        Alert.alert("Could not save", extractErrorMessage(err));
      }
    } finally {
      setSaving(false);
    }
  };

  // Show authentication prompt if user is not logged in
  if (!user) {
    return <AuthRequiredPrompt featureName="profile editing" />;
  }

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* TopBar replaces PageHeader */}
      <TopBar
        variant="back"
        title="Edit Profile"
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AvatarSection
            user={user}
            uploading={uploading}
            onPress={handlePickAvatar}
          />

          {/* Personal Information */}
          <SectionCard title="Personal Information">
            <View style={styles.sectionPad}>
              <FormField
                label="First Name"
                value={form.first_name}
                onChangeText={setField("first_name")}
                placeholder="Juan"
                autoCapitalize="words"
                error={errors.first_name}
              />
              <FormField
                label="Last Name"
                value={form.last_name}
                onChangeText={setField("last_name")}
                placeholder="Dela Cruz"
                autoCapitalize="words"
                error={errors.last_name}
              />
              <FormField
                label="Username"
                value={form.username}
                onChangeText={setField("username")}
                placeholder="juandc"
                autoCapitalize="none"
                error={errors.username}
              />
            </View>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Contact">
            <View style={styles.sectionPad}>
              <FormField
                label="Email Address"
                value={user?.email ?? ""}
                editable={false}
                placeholder="—"
                keyboardType="email-address"
              />
              <FormField
                label="Phone Number"
                value={form.phone_number}
                onChangeText={setField("phone_number")}
                placeholder="09171234567"
                keyboardType="phone-pad"
                autoCapitalize="none"
                error={errors.phone_number}
                style={{ marginBottom: 4 }}
              />
            </View>
          </SectionCard>

          {/* Linked accounts — only shown when providers exist */}
          {(user?.linked_providers ?? []).length > 0 && (
            <SectionCard title="Linked Accounts">
              <View style={styles.providersRow}>
                {user.linked_providers.map((p) => (
                  <ProviderBadge key={p} provider={p} />
                ))}
              </View>
            </SectionCard>
          )}

          {/* Account (read-only) */}
          <SectionCard title="Account">
            <View style={styles.sectionPad}>
              <FormField
                label="Member Since"
                value={
                  user?.date_joined
                    ? new Date(user.date_joined).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"
                }
                editable={false}
                style={{ marginBottom: 4 }}
              />
            </View>
          </SectionCard>

          <SaveButton
            onPress={handleSave}
            loading={saving}
            disabled={!isDirty}
          />
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionPad: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  providersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.neutral,
    letterSpacing: 0.3,
  },
  bottomSpacer: { height: 32 },
});

export default EditProfilePage;
