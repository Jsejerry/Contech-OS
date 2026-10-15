import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const native = Platform.OS !== "web";

export const tapLight = () => native && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const tapSelect = () => native && Haptics.selectionAsync().catch(() => {});
export const tapSuccess = () =>
  native && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
