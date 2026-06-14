interface ThemeToken {
  light: {
    background: string;
    textColor: string;
    borderColor: string;
    primaryColor: string;
    lighterBackground: string;
    redColor: string;
  };
  dark: {
    background: string;
    textColor: string;
  };
}

export const token: ThemeToken = {
  light: {
    background: "#FFF2E9",
    textColor: "#070707",
    borderColor: "#070707",
    primaryColor: "#FFD913",
    lighterBackground: "#363636",
    redColor: "#F04B4B",
  },
  dark: {
    background: "#FFF2E9",
    textColor: "#070707",
  },
};
