"use client"

import React, { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from "react-native"
import { useNavigation } from "@react-navigation/native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming, FadeIn, SlideInRight } from "react-native-reanimated"
import { useTheme } from "../context/ThemeContext"
import { ArrowLeft, Sliders, Tag, VolumeX, FileText, Plus, X, Save, AlertCircle } from "lucide-react-native"

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const AISettingsScreen = () => {
  const { isDark } = useTheme()
  const navigation = useNavigation()

  // AI Settings state
  const [spamSensitivity, setSpamSensitivity] = useState(70)
  const [smartSummarization, setSmartSummarization] = useState(true)
  const [autoCategories, setAutoCategories] = useState(true)
  const [priorityNotifications, setPriorityNotifications] = useState(true)

  // Custom categories state
  const [categories, setCategories] = useState([
    { id: "1", name: "Work", isActive: true },
    { id: "2", name: "Social", isActive: true },
    { id: "3", name: "Finance", isActive: true },
    { id: "4", name: "Shopping", isActive: false },
    { id: "5", name: "Travel", isActive: true },
  ])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)

  // Muted senders state
  const [mutedSenders, setMutedSenders] = useState([
    { id: "1", name: "Promotions", app: "Gmail" },
    { id: "2", name: "Social Updates", app: "Facebook" },
    { id: "3", name: "Marketing Emails", app: "Newsletter" },
  ])

  // Animation values
  const headerOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(0)

  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
    }
  })

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    }
  })

  React.useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 })
    contentOpacity.value = withTiming(1, { duration: 800 })
  }, [])

  const getTextColor = () => (isDark ? "#ffffff" : "#1e293b")
  const getSecondaryTextColor = () => (isDark ? "#a1a1aa" : "#64748b")
  const getCardBgColor = () => (isDark ? "#1e1e2e" : "#ffffff")
  const getCardBorderColor = () => (isDark ? "#2e2e3e" : "#f1f5f9")
  const getInputBgColor = () => (isDark ? "#2e2e3e" : "#f8fafc")

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: Date.now().toString(),
        name: newCategoryName.trim(),
        isActive: true,
      }

      setCategories([...categories, newCategory])
      setNewCategoryName("")
      setShowAddCategory(false)
    }
  }

  const toggleCategoryActive = (id:any) => {
    setCategories(
      categories.map((category) => (category.id === id ? { ...category, isActive: !category.isActive } : category)),
    )
  }

  const removeCategory = (id:any) => {
    setCategories(categories.filter((category) => category.id !== id))
  }

  const removeMutedSender = (id:any) => {
    setMutedSenders(mutedSenders.filter((sender) => sender.id !== id))
  }

  const renderSlider = (value:any, setValue:any, min = 0, max = 100) => {
    const sliderWidth = 280
    const thumbSize = 24
    const trackHeight = 4

    const position = ((value - min) / (max - min)) * (sliderWidth - thumbSize)

    return (
      <View style={styles.sliderContainer}>
        <View
          style={[
            styles.sliderTrack,
            {
              backgroundColor: isDark ? "#2e2e3e" : "#e2e8f0",
              width: sliderWidth,
              height: trackHeight,
            },
          ]}
        >
          <View
            style={[
              styles.sliderFill,
              {
                backgroundColor: isDark ? "#6366f1" : "#4f46e5",
                width: position + thumbSize / 2,
                height: trackHeight,
              },
            ]}
          />
        </View>
        <View
          style={[
            styles.sliderThumb,
            {
              backgroundColor: isDark ? "#6366f1" : "#4f46e5",
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              left: position,
            },
          ]}
        />
        <View style={styles.sliderLabels}>
          <Text style={[styles.sliderLabel, { color: getSecondaryTextColor() }]}>Low</Text>
          <Text style={[styles.sliderValue, { color: getTextColor() }]}>{value}%</Text>
          <Text style={[styles.sliderLabel, { color: getSecondaryTextColor() }]}>High</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#121212" : "#f8fafc" }]}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={getTextColor()} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: getTextColor() }]}>AI Settings</Text>
        <TouchableOpacity style={styles.saveButton}>
          <Save size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={contentStyle}>
          {/* AI Sensitivity Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Sliders size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.sectionTitle, { color: getTextColor() }]}>AI Sensitivity</Text>
            </View>

            <Text style={[styles.sectionDescription, { color: getSecondaryTextColor() }]}>
              Adjust how aggressively spam and promotions are filtered
            </Text>

            {renderSlider(spamSensitivity, setSpamSensitivity)}

            <View style={styles.previewContainer}>
              <Text style={[styles.previewTitle, { color: getTextColor() }]}>Preview</Text>
              <View style={[styles.previewCard, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}>
                <View style={styles.previewItem}>
                  <AlertCircle size={16} color={spamSensitivity > 70 ? "#ef4444" : "#f59e0b"} />
                  <Text style={[styles.previewText, { color: getSecondaryTextColor() }]}>
                    {spamSensitivity > 70
                      ? "Marketing emails will be automatically filtered"
                      : "Some marketing emails may appear in your inbox"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Smart Features Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <FileText size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Smart Features</Text>
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingTitle, { color: getTextColor() }]}>Smart Summarization</Text>
                <Text style={[styles.settingDescription, { color: getSecondaryTextColor() }]}>
                  AI condenses multiple notifications into summaries
                </Text>
              </View>
              <Switch
                value={smartSummarization}
                onValueChange={setSmartSummarization}
                trackColor={{
                  false: isDark ? "#2e2e3e" : "#e2e8f0",
                  true: isDark ? "#4f46e5" : "#6366f1",
                }}
                thumbColor={isDark ? "#ffffff" : "#ffffff"}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingTitle, { color: getTextColor() }]}>Auto-Categorization</Text>
                <Text style={[styles.settingDescription, { color: getSecondaryTextColor() }]}>
                  AI automatically sorts notifications into categories
                </Text>
              </View>
              <Switch
                value={autoCategories}
                onValueChange={setAutoCategories}
                trackColor={{
                  false: isDark ? "#2e2e3e" : "#e2e8f0",
                  true: isDark ? "#4f46e5" : "#6366f1",
                }}
                thumbColor={isDark ? "#ffffff" : "#ffffff"}
              />
            </View>

            <View style={styles.settingItem}>
              <View>
                <Text style={[styles.settingTitle, { color: getTextColor() }]}>Priority Detection</Text>
                <Text style={[styles.settingDescription, { color: getSecondaryTextColor() }]}>
                  Highlight important notifications based on content
                </Text>
              </View>
              <Switch
                value={priorityNotifications}
                onValueChange={setPriorityNotifications}
                trackColor={{
                  false: isDark ? "#2e2e3e" : "#e2e8f0",
                  true: isDark ? "#4f46e5" : "#6366f1",
                }}
                thumbColor={isDark ? "#ffffff" : "#ffffff"}
              />
            </View>
          </View>

          {/* Custom Categories Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Tag size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Custom Categories</Text>
            </View>

            <Text style={[styles.sectionDescription, { color: getSecondaryTextColor() }]}>
              Create and manage custom notification categories
            </Text>

            <View style={styles.categoriesList}>
              {categories.map((category) => (
                <Animated.View key={category.id} style={styles.categoryItem} entering={FadeIn}>
                  <View style={styles.categoryInfo}>
                    <Switch
                      value={category.isActive}
                      onValueChange={() => toggleCategoryActive(category.id)}
                      trackColor={{
                        false: isDark ? "#2e2e3e" : "#e2e8f0",
                        true: isDark ? "#4f46e5" : "#6366f1",
                      }}
                      thumbColor={isDark ? "#ffffff" : "#ffffff"}
                      style={styles.categorySwitch}
                    />
                    <Text
                      style={[
                        styles.categoryName,
                        {
                          color: category.isActive ? getTextColor() : getSecondaryTextColor(),
                          opacity: category.isActive ? 1 : 0.6,
                        },
                      ]}
                    >
                      {category.name}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeCategory(category.id)}>
                    <X size={16} color={isDark ? "#a1a1aa" : "#94a3b8"} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            {showAddCategory ? (
              <Animated.View style={[styles.addCategoryForm, { backgroundColor: getInputBgColor() }]} entering={FadeIn}>
                <TextInput
                  style={[styles.categoryInput, { color: getTextColor() }]}
                  placeholder="Category name"
                  placeholderTextColor={getSecondaryTextColor()}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  autoFocus
                />
                <View style={styles.addCategoryActions}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddCategory(false)}>
                    <Text style={{ color: getSecondaryTextColor() }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: isDark ? "#6366f1" : "#4f46e5" }]}
                    onPress={handleAddCategory}
                  >
                    <Text style={{ color: "white" }}>Add</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ) : (
              <TouchableOpacity
                style={[styles.addCategoryButton, { borderColor: isDark ? "#2e2e3e" : "#e2e8f0" }]}
                onPress={() => setShowAddCategory(true)}
              >
                <Plus size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
                <Text style={[styles.addCategoryText, { color: isDark ? "#6366f1" : "#4f46e5" }]}>
                  Add New Category
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Muted Senders Section */}
          <View
            style={[
              styles.section,
              {
                backgroundColor: getCardBgColor(),
                borderColor: getCardBorderColor(),
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <VolumeX size={20} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.sectionTitle, { color: getTextColor() }]}>Muted Senders</Text>
            </View>

            <Text style={[styles.sectionDescription, { color: getSecondaryTextColor() }]}>
              Block notifications from specific senders or apps
            </Text>

            <View style={styles.mutedList}>
              {mutedSenders.map((sender) => (
                <AnimatedTouchable
                  key={sender.id}
                  style={[styles.mutedItem, { backgroundColor: isDark ? "#2e2e3e" : "#f8fafc" }]}
                  entering={SlideInRight}
                >
                  <View>
                    <Text style={[styles.mutedName, { color: getTextColor() }]}>{sender.name}</Text>
                    <Text style={[styles.mutedApp, { color: getSecondaryTextColor() }]}>{sender.app}</Text>
                  </View>
                  <TouchableOpacity style={styles.unmutedButton} onPress={() => removeMutedSender(sender.id)}>
                    <Text style={{ color: isDark ? "#6366f1" : "#4f46e5" }}>Unmute</Text>
                  </TouchableOpacity>
                </AnimatedTouchable>
              ))}
            </View>

            <TouchableOpacity style={[styles.addMutedButton, { borderColor: isDark ? "#2e2e3e" : "#e2e8f0" }]}>
              <Plus size={16} color={isDark ? "#6366f1" : "#4f46e5"} />
              <Text style={[styles.addMutedText, { color: isDark ? "#6366f1" : "#4f46e5" }]}>
                Add Sender to Mute List
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  sliderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderTrack: {
    borderRadius: 2,
  },
  sliderFill: {
    borderRadius: 2,
    position: "absolute",
    left: 0,
    top: 0,
  },
  sliderThumb: {
    position: "absolute",
    top: -10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 16,
  },
  sliderLabel: {
    fontSize: 12,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewContainer: {
    marginTop: 10,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  previewCard: {
    borderRadius: 12,
    padding: 12,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewText: {
    fontSize: 14,
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  categoriesList: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  categorySwitch: {
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
  },
  removeButton: {
    padding: 4,
  },
  addCategoryForm: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  categoryInput: {
    fontSize: 16,
    marginBottom: 16,
  },
  addCategoryActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addCategoryText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  mutedList: {
    marginBottom: 16,
  },
  mutedItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  mutedName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  mutedApp: {
    fontSize: 14,
  },
  unmutedButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addMutedButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addMutedText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
})

export default AISettingsScreen

