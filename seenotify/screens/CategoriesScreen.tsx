// Define CategoriesScreen as a proper React component 
import React from "react"
import { View } from "react-native"
import { Layers } from "lucide-react-native"
import { useTheme } from "../context/ThemeContext"

const CategoriesScreen = () => {
  const { isDark } = useTheme()
  
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Layers size={40} color={isDark ? "#6366f1" : "#4f46e5"} />
    </View>
  )
}

export default CategoriesScreen