import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, SlideInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { joinWaitlist, type WaitlistResult } from "@/src/api";
import { PrimaryButton } from "@/src/components/ui";
import { tapSelect, tapSuccess } from "@/src/haptics";
import { fonts, makeStyles, useTheme } from "@/src/theme";
import { useCopy } from "@/src/content";

const ROLES = ["Construction company", "Tech provider", "Startup", "Investor", "Expert", "University"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function WaitlistSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const t = useCopy();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [focus, setFocus] = useState<"name" | "email" | null>(null);
  const [error, setError] = useState<"nameError" | "emailError" | "submitError" | null>(null);
  const [result, setResult] = useState<WaitlistResult | null>(null);

  const m = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: (r) => {
      setResult(r);
      tapSuccess();
      qc.invalidateQueries({ queryKey: ["waitlist-count"] });
    },
    onError: () => setError("submitError"),
  });

  const close = () => {
    onClose();
    if (result) {
      setResult(null);
      setName("");
      setEmail("");
      setRole(null);
    }
    setError(null);
  };

  const submit = () => {
    if (m.isPending) return;
    setError(null);
    if (!name.trim()) return setError("nameError");
    if (!EMAIL_RE.test(email.trim())) return setError("emailError");
    m.mutate({ name: name.trim(), email: email.trim(), role });
  };

  return visible ? (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex} keyboardVerticalOffset={0}>
        <Pressable style={styles.backdrop} onPress={close} testID="waitlist-backdrop" accessibilityRole="button" accessibilityLabel={t.close} />
        {visible && (
          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            testID="waitlist-sheet"
          >
            <View style={styles.handle} />
            <Pressable testID="waitlist-close-button" accessibilityRole="button" accessibilityLabel={t.close} onPress={close} style={styles.close} hitSlop={8}>
              <Feather name="x" size={20} color={colors.onSurfaceTertiary} />
            </Pressable>

            {result ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.success} testID="waitlist-success">
                <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.check}>
                  <Feather name="check" size={36} color={colors.onBrandPrimary} />
                </Animated.View>
                <Text style={styles.title} testID="waitlist-success-title">
                  {result.already_joined ? t.duplicate : t.success}
                </Text>
                <Text style={styles.sub} testID="waitlist-success-position">
                  {t.position}: <Text style={styles.pos}>#{result.position}</Text>{"\n"}{t.saved} {result.email}.
                </Text>
                <View style={styles.full}>
                  <PrimaryButton testID="waitlist-done-button" label={t.done} icon="check" onPress={close} />
                </View>
              </Animated.View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text testID="waitlist-kicker" style={styles.kicker}>{t.early}</Text>
                <Text testID="waitlist-title" style={styles.title}>{t.formTitle}</Text>
                <Text testID="waitlist-description" style={styles.sub}>{t.formLead}</Text>

                <Text testID="waitlist-name-label" style={styles.label}>{t.name}</Text>
                <TextInput
                  testID="waitlist-name-input"
                  accessibilityLabel={t.name}
                  maxLength={80}
                  value={name}
                  onChangeText={setName}
                  placeholder="Camille Durand"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, focus === "name" && styles.inputFocus]}
                  onFocus={() => setFocus("name")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <Text testID="waitlist-email-label" style={styles.label}>{t.email}</Text>
                <TextInput
                  testID="waitlist-email-input"
                  accessibilityLabel={t.email}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="camille@company.com"
                  placeholderTextColor={colors.muted}
                  style={[styles.input, focus === "email" && styles.inputFocus]}
                  onFocus={() => setFocus("email")}
                  onBlur={() => setFocus(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={submit}
                />
                <Text testID="waitlist-role-label" style={styles.label}>{t.role}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                  style={styles.chipRow}
                  keyboardShouldPersistTaps="handled"
                >
                  {ROLES.map((r, index) => (
                    <Pressable
                      key={r}
                      testID={`waitlist-role-${r.toLowerCase().replace(/\s+/g, "-")}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: role === r }}
                      onPress={() => {
                        tapSelect();
                        setRole(role === r ? null : r);
                      }}
                      style={[styles.chip, role === r && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, role === r && styles.chipTextOn]}>{t.roles[index]}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {error && (
                  <Text style={styles.error} testID="waitlist-error" accessibilityRole="alert">
                    {t[error]}
                  </Text>
                )}
                <View style={styles.full}>
                  <PrimaryButton
                    testID="waitlist-submit-button"
                    label={m.isPending ? t.submitting : t.reserve}
                    onPress={submit}
                    disabled={m.isPending}
                    right={m.isPending ? <ActivityIndicator color={colors.onBrandPrimary} /> : undefined}
                  />
                </View>
              </ScrollView>
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
  ) : null;
}

const useStyles = makeStyles((c) => ({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: c.scrim },
  sheet: {
    backgroundColor: c.surfaceSecondary,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: c.glassBorder,
    maxHeight: "88%",
  },
  handle: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: c.surfaceTertiary, marginBottom: 16 },
  close: {
    position: "absolute",
    right: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    zIndex: 2,
    backgroundColor: c.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.4, color: c.blue, marginBottom: 8 },
  title: { fontFamily: fonts.displayMedium, fontSize: 30, color: c.onSurface, letterSpacing: -0.6, textAlign: "left", paddingRight: 20 },
  sub: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: c.onSurfaceTertiary, marginTop: 8, marginBottom: 8 },
  pos: { color: c.brandPrimary, fontFamily: fonts.bodySemi },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: c.onSurfaceSecondary, marginTop: 16, marginBottom: 8 },
  input: {
    height: 52,
    borderRadius: 12,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    paddingHorizontal: 16,
    color: c.onSurface,
    fontFamily: fonts.body,
    fontSize: 16,
  },
  inputFocus: { borderColor: c.brandPrimary },
  chipRow: { height: 56, marginHorizontal: -24 },
  chips: { gap: 8, paddingHorizontal: 24, alignItems: "center" },
  chip: {
    height: 44,
    flexShrink: 0,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    justifyContent: "center",
  },
  chipOn: { borderColor: c.brandPrimary, backgroundColor: c.brandGlow },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: c.onSurfaceTertiary },
  chipTextOn: { color: c.onSurface },
  error: { fontFamily: fonts.bodyMedium, fontSize: 13, color: c.error, marginTop: 8 },
  full: { marginTop: 16 },
  success: { alignItems: "center", paddingTop: 16, paddingBottom: 8 },
  check: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: c.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
}));
