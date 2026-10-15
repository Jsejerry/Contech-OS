import { Text, View } from "react-native";

import { fonts, makeStyles } from "@/src/theme";

export function LogoMark({ size = 30 }: { size?: number }) {
  const styles = useStyles();
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

export function Wordmark({ size = 30 }: { size?: number }) {
  const styles = useStyles();
  return (
    <View style={styles.row} testID="brand-wordmark">
      <LogoMark size={size} />
      <Text style={[styles.text, { fontSize: size * 0.72 }]}>
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
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  text: { fontFamily: fonts.display, color: c.onSurface, letterSpacing: -0.3 },
  os: { fontFamily: fonts.displayLight, color: c.onSurfaceSecondary },
}));
