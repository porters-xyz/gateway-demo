import { createTheme, rem, Button, Input } from "@mantine/core";
import { Crimson_Text, Karla, Red_Rose } from "next/font/google";
export const crimson = Crimson_Text({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const karla = Karla({
  display: "swap",
  fallback: ["serif"],
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const redRose = Red_Rose({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "500", "700"],
});

export const theme = createTheme({
  white: "#F6EEE6",
  black: "#3C2B27",
  primaryColor: "carrot",
  colors: {
    umbra: Array(10).fill("#3C2B27") as any,
    cream: ['#EAD9CA', "#F6EEE6", "#F6EEE6", "#F6EEE6", "#F6EEE6", "#F6EEE6", "#F6EEE6", "#F6EEE6", "#F6EEE6", "#F6EEE6"],
    brown: Array(10).fill("#F0E3D7") as any,
    gray: Array(10).fill("#00000020") as any,
    blue: Array(10).fill("#22559B") as any,
    carrot: [
      "#311E0D",
      "#452200",
      "#532B00",
      "#62390F",
      "#784A1D",
      "#9A5F24",
      "#FFA44B",
      "#F3993F",
      "#FFA54D",
      "#FEE0C6",
    ],
    blume: Array(10).fill("#22559B") as any,
  },
  shadows: {
    xs: "none",
    md: "1px 1px 3px rgba(0, 0, 0, .25)",
    xl: "5px 5px 3px rgba(0, 0, 0, .25)",
  },
  fontFamily: karla.style.fontFamily,
  headings: {
    fontFamily: crimson.style.fontFamily,
    fontWeight: "500",
    sizes: {
      h1: { fontSize: rem(36) },
    },
  },
  components: {
    Button: Button.extend({
      defaultProps: {
        color: "carrot",
        size: "md",
        style: {
          fontFamily: crimson.style.fontFamily,
          fontWeight: 700,
          fontSize: rem(20),
        },
      },
    }),
  },
});
