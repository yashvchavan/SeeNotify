"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { useColorScheme } from "react-native"

type ThemeType = "light" | "dark" | "system"

interface ThemeContextType {
  theme: ThemeType
  isDark: boolean
  setTheme: (theme: ThemeType) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  isDark: false,
  setTheme: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [theme, setTheme] = useState<ThemeType>("system")

  const isDark = theme === "system" ? systemColorScheme === "dark" : theme === "dark"

  return <ThemeContext.Provider value={{ theme, isDark, setTheme }}>{children}</ThemeContext.Provider>
}
