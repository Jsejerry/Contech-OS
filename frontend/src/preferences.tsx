import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

export type Language = "en" | "fr" | "es";
export type Mode = "dark" | "light";
type Preferences = { language: Language; mode: Mode };
const defaults: Preferences = { language: "en", mode: "dark" };
const KEY = "contech-preferences-v1";
const Context = createContext({ ...defaults, setLanguage: (_: Language) => {}, setMode: (_: Mode) => {} });

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [prefs, setPrefs] = useState(defaults);
  const current = useRef(defaults);
  const edited = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then((raw) => {
      if (!raw || !active || edited.current) return;
      const stored = JSON.parse(raw);
      const value: Preferences = {
        language: ["en", "fr", "es"].includes(stored.language) ? stored.language : "en",
        mode: stored.mode === "light" ? "light" : "dark",
      };
      current.current = value;
      setPrefs(value);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const update = (patch: Partial<Preferences>) => {
    edited.current = true;
    const next = { ...current.current, ...patch };
    current.current = next;
    setPrefs(next);
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, JSON.stringify(next))).catch(() => {});
  };
  return <Context.Provider value={{ ...prefs, setLanguage: (language) => update({ language }), setMode: (mode) => update({ mode }) }}>{children}</Context.Provider>;
}

export const usePreferences = () => useContext(Context);