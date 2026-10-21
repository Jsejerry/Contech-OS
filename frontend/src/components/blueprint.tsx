import { StyleSheet, View } from "react-native";
import { makeStyles } from "@/src/theme";

/** Architectural linework rather than decorative photography; remains native on phones. */
export function Blueprint() {
  const styles = useStyles();
  return <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
    {Array.from({ length: 9 }, (_, i) => <View key={`v${i}`} style={[styles.vertical, { left: `${(i + 1) * 10}%` }]} />)}
    {Array.from({ length: 15 }, (_, i) => <View key={`h${i}`} style={[styles.horizontal, { top: (i + 1) * 64 }]} />)}
    <View style={styles.crane}>
      <View style={styles.tower} /><View style={styles.boom} /><View style={styles.jib} /><View style={styles.cable} />
      <View style={styles.building} />
      {[0, 1, 2, 3].map((i) => <View key={i} style={[styles.floor, { bottom: i * 22 }]} />)}
    </View>
  </View>;
}

const useStyles = makeStyles((c) => ({
  vertical: { position: "absolute", top: 0, bottom: 0, width: 1, backgroundColor: c.blueprint },
  horizontal: { position: "absolute", left: 0, right: 0, height: 1, backgroundColor: c.blueprint },
  crane: { position: "absolute", top: 112, right: -25, width: 150, height: 220, opacity: 0.7 },
  tower: { position: "absolute", right: 72, width: 10, top: 0, bottom: 0, borderWidth: 1, borderColor: c.blueprintStrong },
  boom: { position: "absolute", right: 10, left: 0, height: 8, top: 25, borderWidth: 1, borderColor: c.blueprintStrong },
  jib: { position: "absolute", top: 13, left: 8, width: 62, height: 1, backgroundColor: c.blueprintStrong, transform: [{ rotate: "-22deg" }] },
  cable: { position: "absolute", right: 27, top: 33, width: 1, height: 65, backgroundColor: c.blueprintStrong },
  building: { position: "absolute", right: 0, bottom: 0, width: 53, height: 90, borderWidth: 1, borderColor: c.blueprintStrong },
  floor: { position: "absolute", right: 0, width: 53, height: 1, backgroundColor: c.blueprintStrong },
}));