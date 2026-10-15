import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useState } from "react";

import { BASE } from "@/src/api";

import { fonts, makeStyles } from "@/src/theme";

export function LogoMark({ size = 30 }: { size?: number }) {
  const styles = useStyles();
  const [failed, setFailed] = useState(false);
  if (!failed) return <Image source={`${BASE}/brand/logo`} style={{ width: size, height: size }} contentFit="contain" cachePolicy="memory-disk" onError={() => setFailed(true)} accessibilityLabel="ConTech OS symbol" />;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <View
        style={[
          styles.outer,
          { width: size, height: size, borderRadius: size / 2, borderWidth: size * 0.15, transform: [{ rotate: "40deg" }] },
        ]}
      />
      <View
        style={[
          styles.inner,
          {
            width: size * 0.52,
            height: size * 0.52,
            borderRadius: size * 0.26,
            borderWidth: size * 0.12,
            transform: [{ rotate: "40deg" }],
          },
        ]}
      />
    </View>
  );
}

export function Wordmark({ size = 30, testID = "brand-wordmark" }: { size?: number; testID?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID}>
      <LogoMark size={size} />
      <Text style={[styles.text, { fontSize: size * 0.61 }]} testID={`${testID}-text`}>
        ConTech <Text style={styles.os}>OS</Text>
      </Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  outer: {
    position: "absolute",
    borderColor: c.brandPrimary,
    borderRightColor: c.transparent,
  },
  inner: {
    position: "absolute",
    borderColor: c.onSurface,
    borderLeftColor: c.transparent,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { fontFamily: fonts.bodyMedium, color: c.onSurface, letterSpacing: -0.55 },
  os: { fontFamily: fonts.body, color: c.brandPrimary },
}));
