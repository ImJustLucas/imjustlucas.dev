type ButtonTheme = {
  background: string;

  text: string;
  outline: string;
};

type Spacing = {
  xxs: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
};

export type Theme = {
  id: number;
  name: string;
  colors: {
    primary: string;
    secondary: string;

    background: {
      primary: string;
      secondary: string;
      contrast: string;
    };

    text: {
      primary: string;
      secondary: string;
      contrast: string;
    };

    grey: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
      950: string;
    };
  };
  button: ButtonTheme;
  spacing: Spacing;
};
