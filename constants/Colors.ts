/**
 * Lynk App Color Palette
 * Centered around light blue (#ADD8E6) and white (#FFFFFF)
 * Designed for clarity, contrast, and emotional neutrality
 */

export const Colors = {
  // Primary Colors
  primary: {
    lightBlue: '#ADD8E6',      // Primary accent color
    white: '#FFFFFF',          // Primary background
    darkSlateGray: '#2F4F4F',  // Primary text color
  },

  // Message Bubble Colors
  message: {
    sent: {
      background: '#87CEEB',   // Muted sky blue
      text: '#FFFFFF',         // White text
    },
    received: {
      background: '#DCE3E9',   // Soft powder gray
      text: '#000000',         // Black text
    },
  },

  // Accent Colors
  accent: {
    primary: '#ADD8E6',        // Light blue for buttons, icons, highlights
    secondary: '#006D77',      // Deep teal for emphasis and notifications
    hover: '#9BC5E8',          // Slightly darker blue for hover states
    selection: '#B8E0F5',      // Very light blue for selections
  },

  // Status Colors
  status: {
    success: '#48BB78',        // Green for success states
    warning: '#ED8936',        // Orange for warnings
    error: '#F56565',          // Red for errors
    info: '#4299E1',           // Blue for information
  },

  // Border Colors
  border: {
    light: '#E2E8F0',          // Light borders
    medium: '#CBD5E0',         // Medium borders
    dark: '#A0AEC0',           // Dark borders
  },

  // Interactive States
  interactive: {
    hover: '#F7FAFC',          // Light hover background
    pressed: '#EDF2F7',        // Pressed state background
    disabled: '#E2E8F0',       // Disabled state
  },

  // Analogous Colors (for harmony)
  analogous: {
    lightCyan: '#E0FFFF',      // Very light cyan
    paleBlue: '#AFEEEE',       // Pale turquoise
    lightSteelBlue: '#B0C4DE', // Light steel blue
  },

  // Complementary Colors (for contrast)
  complementary: {
    warmGray: '#F5F5DC',       // Beige for warm contrast
    softPeach: '#FFEEE6',      // Very light peach
  },

  // Compatibility properties for existing components
  background: {
    primary: '#FFFFFF',        // White background
    secondary: '#F7FAFC',      // Light gray background
    tertiary: '#EDF2F7',       // Lighter gray background
  },

  text: {
    primary: '#2F4F4F',        // Dark slate gray text
    secondary: '#4A5568',      // Medium gray text
    tertiary: '#718096',       // Light gray text
    inverse: '#FFFFFF',        // White text on dark backgrounds
  },
};
