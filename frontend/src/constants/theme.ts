export const colors = {
  primary: "#2563EB",
  secondary: "#10B981",
  accent: "#8B5CF6",

  background: "#F8FAFC",
  surface: "#FFFFFF",

  textPrimary: "#0F172A",
  textSecondary: "#64748B",

  border: "#E2E8F0",

  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#2563EB",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
} as const;

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 22,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
} as const;
