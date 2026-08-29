# 009 — UI/UX Design System & Theming

## 🎨 Design Philosophy
MedSIS Mobile adheres to a clean, modern medical aesthetic built with **NativeWind** (Tailwind CSS v3 for React Native). The design language emphasizes high readability, accessible contrast, smooth transitions, and tactile feedback.

---

## 🎨 Color Palette & Design Tokens

```
Institutional Primary: #af1616 (SWU SOM Maroon)
Medical Emerald:       #059669 (Approved, Passed, Success)
Alert Amber:           #D97706 (Pending, Review Required)
Danger Ruby:           #DC2626 (Failed, Deficiency, Rejected)
Info Indigo:           #2563EB (Information, Blue Badges)
```

| Semantic Token | Light Mode Value | Dark Mode Value |
| :--- | :--- | :--- |
| `background` | `#F9FAFB` (Off-White) | `#0F172A` (Slate Dark) |
| `card` | `#FFFFFF` (Pure White) | `#1E293B` (Elevated Slate) |
| `text` | `#111827` (Deep Gray) | `#F8FAFC` (Bright White) |
| `muted` | `#6B7280` (Medium Gray) | `#94A3B8` (Subtle Gray) |
| `border` | `#E5E7EB` (Light Border) | `#334155` (Slate Border) |
| `primary` | `#af1616` (Maroon) | `#dc2626` (Bright Maroon) |

---

## 🌓 Theme Provider & Switching (`contexts/ThemeContext.tsx`)

Students can select between **Light**, **Dark**, and **System Default** themes:
- Automatically adapts UI backgrounds, card elevations, text colors, and borders.
- Reusable hooks:
  - `useThemeColor({}, 'card')`: Returns current theme-appropriate hex color.
  - `useColorScheme()`: Detects active device theme.

---

## 📐 Key UI Components & Interactions

1. **Bottom Tab Bar (`app/(tabs)/_layout.tsx`)**:
   - Custom icons with active maroon indicator tint.
   - Haptic feedback on tab press (`expo-haptics`).
2. **Interactive Modals**:
   - Standard backdrop blur with rounded corners (`rounded-3xl`).
   - Distinct destructive and confirmation actions.
3. **Skeleton Loaders (`react-native-skeleton-placeholder`)**:
   - Smooth shimmering placeholder skeletons during profile, announcement, and calendar data loads.
