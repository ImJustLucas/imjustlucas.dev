import { Theme } from "@typesDef/themes";

const light: Theme = {
  id: 0,
  name: "light",
  colors: {
    primary: "#f8f9fa",
    secondary: "",

    background: {
      primary: "#f8f9fa",
      secondary: "",
      contrast: "",
    },
    text: {
      primary: "#2b2d42",
      secondary: "",
      contrast: "#2b2d42",
    },

    gray: {
      50: "#F7F7F7",
      100: "#EDEDED",
      200: "#E2E2E2",
      300: "#C8C8C8",
      400: "#ADADAD",
      500: "#999999",
      600: "#888888",
      700: "#7B7B7B",
      800: "#676767",
      900: "#545454",
      950: "#363636",
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

export default light;
