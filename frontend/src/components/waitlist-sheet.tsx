import Feather from "@react-native-vector-icons/feather";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityIndicator, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeIn, SlideInDown, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { joinWaitlist, type WaitlistResult } from "@/src/api";
import { PrimaryButton } from "@/src/components/ui";
import { tapSelect, tapSuccess } from "@/src/haptics";
import { fonts, makeStyles, useTheme } from "@/src/theme";

const ROLES = ["Construction company", "Tech provider", "Startup", "Investor", "Expert", "University"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function WaitlistSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [focus, setFocus] = useState<"name" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WaitlistResult | null>(null);

  const m = useMutation({
    mutationFn: joinWaitlist,
    onSuccess: (r) => {
      setResult(r);
      tapSuccess();
      qc.invalidateQueries({ queryKey: ["waitlist-count"] });
    },
    onError: (e: Error) => setError(e.message),
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
    setError(null);
    if (!name.trim()) return setError("Please enter your name.");
    if (!EMAIL_RE.test(email.trim())) return setError("Please enter a valid email.");
    m.mutate({ name: name.trim(), email: email.trim(), role });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex} keyboardVerticalOffset={0}>
        <Pressable style={styles.backdrop} onPress={close} testID="waitlist-backdrop" />
        {visible && (
          <Animated.View
            entering={SlideInDown.springify().damping(20)}
            style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            testID="waitlist-sheet"
          >
            <View style={styles.handle} />
            <Pressable testID="waitlist-close-button" onPress={close} style={styles.close} hitSlop={8}>
              <Feather name="x" size={20} color={colors.onSurfaceTertiary} />
            </Pressable>

            {result ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.success} testID="waitlist-success">
                <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.check}>
                  <Feather name="check" size={36} color={colors.onBrandPrimary} />
                </Animated.View>
                <Text style={styles.title} testID="waitlist-success-title">
                  {result.already_joined ? "You're already on the list" : "You're on the list"}
                </Text>
                <Text style={styles.sub} testID="waitlist-success-position">
                  {"You're "}<Text style={styles.pos}>#{result.position}</Text> in line, {result.name.split(" ")[0]}. {"We'll email "}
                  {result.email} when the first pilot cohort opens.
                </Text>
                <View style={styles.full}>
                  <PrimaryButton testID="waitlist-done-button" label="Done" icon="check" onPress={close} />
                </View>
              </Animated.View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={styles.kicker}>LIMITED SPOTS · PILOT COHORT</Text>
                <Text style={styles.title}>Join the waitlist</Text>
                <Text style={styles.sub}>Be first to connect with the global construction innovation network.</Text>

                <Text style={styles.label}>Full name</Text>
                <TextInput
                  testID="waitlist-name-input"
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
                <Text style={styles.label}>Work email</Text>
                <TextInput
                  testID="waitlist-email-input"
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
                <Text style={styles.label}>I am a… (optional)</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chips}
                  style={styles.chipRow}
                  keyboardShouldPersistTaps="handled"
                >
                  {ROLES.map((r) => (
                    <Pressable
                      key={r}
                      testID={`waitlist-role-${r.toLowerCase().replace(/\s+/g, "-")}`}
                      onPress={() => {
                        tapSelect();
                        setRole(role === r ? null : r);
                      }}
                      style={[styles.chip, role === r && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, role === r && styles.chipTextOn]}>{r}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {error && (
                  <Text style={styles.error} testID="waitlist-error">
                    {error}
                  </Text>
                )}
                <View style={styles.full}>
                  <PrimaryButton
                    testID="waitlist-submit-button"
                    label={m.isPending ? "Joining…" : "Reserve my spot"}
                    onPress={submit}
                    right={m.isPending ? <ActivityIndicator color={colors.onBrandPrimary} /> : undefined}
                  />
                </View>
              </ScrollView>
            )}
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: c.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  kicker: { fontFamily: fonts.bodyMedium, fontSize: 11, letterSpacing: 2.4, color: c.brandPrimary, marginBottom: 8 },
  title: { fontFamily: fonts.displayMedium, fontSize: 30, color: c.onSurface, letterSpacing: -0.6, textAlign: "left" },
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
    height: 36,
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
