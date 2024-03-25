import { createTheme, rem, Button } from "@mantine/core";
import { Crimson_Text, Karla } from "next/font/google";
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

export const theme = createTheme({
  white: "#F6EEE6",
  black: "#3C2B27",
  colors: {
    umbra: [
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
      "#3C2B27",
    ],
    cream: [
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
      "#F6EEE6",
    ],
    brown: [
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
      "#F0E3D7",
    ],
    carrot: [
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
      "#FFA44B",
    ],
    blume: [
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
      "#22559B",
    ],
  },

  shadows: {
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
