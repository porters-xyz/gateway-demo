import { createTheme, rem, Button } from "@mantine/core";

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

  fontFamily: "Karla, sans-serif",
  headings: {
    fontFamily: "Crimson Text, sans-serif",
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
          fontFamily: "Crimson Text, sans-serif",
          fontWeight: 700,
          fontSize: rem(20),
        },
      },
    }),
  },
});
