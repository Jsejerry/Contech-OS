import { Text, View } from "react-native";
import { useCopy } from "@/src/content";
import { fonts, makeStyles } from "@/src/theme";

export function ChapterHeading({ index, title, accent, lead }: { index: number; title: string; accent: string; lead: string }) {
  const styles = useStyles();
  const t = useCopy();
  return <View>
    <View style={styles.row}>
      <Text testID={`chapter-${index + 1}-number`} style={styles.number}>0{index + 1} <Text style={styles.total}>/ 03</Text></Text>
      <View style={styles.rule} />
      <Text testID={`chapter-${index + 1}-label`} style={styles.eyebrow}>{t.chapters[index].toUpperCase()}</Text>
    </View>
    <Text testID={`chapter-${index + 1}-title`} style={styles.title}>{title}{"\n"}<Text style={styles.accent}>{accent}</Text></Text>
    <Text testID={`chapter-${index + 1}-description`} style={styles.lead}>{lead}</Text>
  </View>;
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 28 },
  number: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1.3, color: c.blue },
  total: { color: c.muted },
  rule: { height: 1, flex: 1, backgroundColor: c.border },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 10, letterSpacing: 1.6, color: c.onSurfaceTertiary, maxWidth: "70%" },
  title: { fontFamily: fonts.displayMedium, fontSize: 38, lineHeight: 42, letterSpacing: -1.2, color: c.onSurface },
  accent: { color: c.blue },
  lead: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: c.onSurfaceTertiary, marginTop: 20 },
}));