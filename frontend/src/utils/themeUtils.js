export const themes = {
  light: {
    name: "Light",
    colors: {
      "--bg-color": "#F0F0F0",
      "--sidebar-bg-color": "#FFFFFF",
      "--text-color": "#333333",
      "--accent-color": "#007BFF",
      "--secondary-text-color": "#6c757d",
      "--divider-color": "#DEE2E6",
      "--contact-item-hover-bg": "#E9ECEF",
      "--contact-item-active-bg": "#007BFF",
      "--contact-item-active-text": "#FFFFFF",
      "--sent-message-bg": "#007BFF",
      "--sent-message-text": "#FFFFFF",
      "--received-message-bg": "#E9ECEF",
      "--received-message-text": "#333333",
      "--input-bg-color": "#FFFFFF",
      "--input-border-color": "#CED4DA",
      "--input-focus-border-color": "#80BDFF",
      "--input-focus-shadow-color": "rgba(0, 123, 255, 0.25)",
      "--placeholder-text-color": "#6C757D",
      "--avatar-bg-color": "#E9ECEF",
      "--avatar-text-color": "#007BFF",
      "--scrollbar-thumb-color": "#007BFF",
      "--scrollbar-track-color": "#F8F9FA",
      "--button-primary-bg": "#007BFF",
      "--button-primary-text": "#FFFFFF",
      "--button-primary-hover-bg": "#0056b3",
      "--loading-text-color": "#6c757d",
      "--bg-color-rgb": "240, 240, 240",
    },
    previewColors: ["#007BFF", "#E9ECEF", "#FFFFFF", "#6c757d", "#333333"],
  },
  dark: {
    name: "Dark",
    colors: {
      "--bg-color": "#211F26",
      "--sidebar-bg-color": "#1A181F",
      "--text-color": "#e0e0e0",
      "--accent-color": "#D89E40",
      "--secondary-text-color": "#a0a0a0",
      "--divider-color": "#3a3740",
      "--contact-item-hover-bg": "#2E2B36",
      "--contact-item-active-bg": "#D89E40",
      "--contact-item-active-text": "#1A181F",
      "--sent-message-bg": "#D89E40",
      "--sent-message-text": "#1A181F",
      "--received-message-bg": "#2E2B36",
      "--received-message-text": "#e0e0e0",
      "--input-bg-color": "#2E2B36",
      "--input-border-color": "#4a4750",
      "--input-focus-border-color": "#D89E40",
      "--input-focus-shadow-color": "rgba(216, 158, 64, 0.2)",
      "--placeholder-text-color": "#8A888F",
      "--avatar-bg-color": "#2E2B36",
      "--avatar-text-color": "#D89E40",
      "--scrollbar-thumb-color": "#D89E40",
      "--scrollbar-track-color": "#1A181F",
      "--button-primary-bg": "#D89E40",
      "--button-primary-text": "#1A181F",
      "--button-primary-hover-bg": "#c9913a",
      "--loading-text-color": "#a0a0a0",
      "--bg-color-rgb": "33, 31, 38",
    },
    previewColors: ["#D89E40", "#e0e0e0", "#a0a0a0", "#2E2B36", "#1A181F"],
  },
  retro: {
    name: "Retro",
    colors: {
      "--bg-color": "#FDF6E3",
      "--sidebar-bg-color": "#F9E9C4",
      "--text-color": "#655A4E",
      "--accent-color": "#D35400",
      "--secondary-text-color": "#8A7967",
      "--divider-color": "#DCD0B4",
      "--contact-item-hover-bg": "#F5E0B3",
      "--contact-item-active-bg": "#D35400",
      "--contact-item-active-text": "#FFFFFF",
      "--sent-message-bg": "#E74C3C",
      "--sent-message-text": "#FFFFFF",
      "--received-message-bg": "#F5E0B3",
      "--received-message-text": "#655A4E",
      "--input-bg-color": "#FFFFFF",
      "--input-border-color": "#DCD0B4",
      "--input-focus-border-color": "#D35400",
      "--input-focus-shadow-color": "rgba(211, 84, 0, 0.2)",
      "--placeholder-text-color": "#B0A08D",
      "--avatar-bg-color": "#F5E0B3",
      "--avatar-text-color": "#D35400",
      "--scrollbar-thumb-color": "#D35400",
      "--scrollbar-track-color": "#FDF0D5",
      "--button-primary-bg": "#D35400",
      "--button-primary-text": "#FFFFFF",
      "--button-primary-hover-bg": "#A04000",
      "--loading-text-color": "#8A7967",
      "--bg-color-rgb": "253, 246, 227",
    },
    previewColors: ["#F9E9C4", "#D35400", "#2ECC71", "#3498DB", "#655A4E"],
  },
};

export const applyThemeToDOM = (themeName) => {
  const theme = themes[themeName];
  if (!theme) {
    console.warn(`Theme "${themeName}" not found. Applying default (light).`);
    applyThemeToDOM(themes.light.name.toLowerCase()); // Đảm bảo key là lowercase
    return;
  }
  const root = document.documentElement;
  Object.keys(theme.colors).forEach(key => {
    root.style.setProperty(key, theme.colors[key]);
  });
};

export const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('selectedTheme');
  // Chuyển đổi key sang lowercase để khớp với keys trong object `themes`
  const savedThemeKey = savedTheme ? savedTheme.toLowerCase() : null;
  if (savedThemeKey && themes[savedThemeKey]) {
    return savedThemeKey;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && themes.dark) {
    return 'dark';
  }
  return 'light';
};