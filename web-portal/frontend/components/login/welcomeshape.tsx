import React from "react";
import { Flex } from "@mantine/core";
const styles = {
  container: {
    overflow: "hidden",
    maxWidth: "80%",
    minWidth: "400px",
    backgroundColor: "#13030320",
  },
  border: {
    border: "2px solid #FFA44B",
  },
  circle: {
    width: "40px",
    height: "40px",
    border: "2px solid #FFA44B",
    borderRadius: "50%",
    backgroundColor: "#3C2B27",
  },
  topLeftCircle: {
    marginTop: "-20px",
    float: "left",
    marginLeft: "-20px",
  },
  topRightCircle: {
    marginTop: "-20px",
    float: "right",
    marginRight: "-20px",
  },
  bottomLeftCircle: {
    marginBottom: "-22px",
    marginTop: "-20px",
    float: "left",
    marginLeft: "-20px",
  },
  bottomRightCircle: {
    marginBottom: "-22px",
    marginTop: "-20px",
    float: "right",
    marginRight: "-20px",
  },
};

const Circle = ({ styles }: { styles: any }) => <i style={styles} />;
const WelcomeShape = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={styles.container}>
      <div style={styles.border}>
        <Circle styles={{ ...styles.circle, ...styles.topLeftCircle }} />
        <Circle styles={{ ...styles.circle, ...styles.topRightCircle }} />
        <Flex
          mih={50}
          gap="lg"
          h={400}
          p={40}
          justify="flex-start"
          align="center"
          direction="column"
          wrap="nowrap"
        >
          {children}
        </Flex>
        <Circle styles={{ ...styles.circle, ...styles.bottomRightCircle }} />
        <Circle styles={{ ...styles.circle, ...styles.bottomLeftCircle }} />
      </div>
    </div>
  );
};

export default WelcomeShape;
