import { Theme } from "@typesDef/themes";

const dark: Theme = {
  id: 0,
  name: "dark",
  colors: {
    primary: "#212529",
    secondary: "",

    background: {
      primary: "#212529",
      secondary: "",
      contrast: "",
    },
    text: {
      primary: "",
      secondary: "",
      contrast: "#f8f9fa",
    },

    grey: {
      50: "#363636",
      100: "#545454",
      200: "#676767",
      300: "#7B7B7B",
      400: "#888888",
      500: "#999999",
      600: "#ADADAD",
      700: "#C8C8C8",
      800: "#E2E2E2",
      900: "#EDEDED",
      950: "#F7F7F7",
    },
  },
  button: {
    background: "",
    text: "",
    outline: "",
  },
  spacing: {
    xxs: "4px",
    xs: "8px",
    sm: "16px",
    md: "24px",
    lg: "32px",
    xl: "48px",
    xxl: "64px",
  },
};

export default dark;
