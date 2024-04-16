import { Stack, Button, Flex, Select, TextInput } from "@mantine/core";
import { karla } from "@frontend/utils/theme";

export default function Swap() {
  return (
    <Stack p={8}>
      <Flex
        p={8}
        mt={20}
        bg="white"
        style={{
          borderRadius: 10,
          alignItems: "flex-end",
        }}
      >
        <TextInput
          placeholder="Enter amount"
          label="Swap"
          type="number"
          styles={{
            input: {
              outline: "none",
              border: "none",
              fill: "#fff",
              fontSize: 24,
            },
            label: {
              color: "#000",
              fontFamily: karla.style.fontFamily,
              marginLeft: 10,
            },
          }}
          wrapperProps={{
            style: {
              width: "100%",
            },
          }}
        />
        <Select
          placeholder="Select"
          defaultValue={"ETH"}
          data={["ETH", "BTC", "USDT"]}
          styles={{
            input: { outline: "none", border: "none", background: "white" },
          }}
        />
      </Flex>
      <Flex
        bg="white"
        p={8}
        style={{
          borderRadius: 10,
          alignItems: "flex-end",
        }}
      >
        <TextInput
          label="Get"
          styles={{
            input: {
              outline: "none",
              border: "none",
              fill: "#fff",
              fontSize: 24,
            },
            label: {
              color: "#000",
              fontFamily: karla.style.fontFamily,
              marginLeft: 10,
            },
          }}
          wrapperProps={{
            style: {
              width: "100%",
            },
          }}
        />
        <Select
          defaultValue={"PORTR"}
          data={["PORTR"]}
          readOnly
          styles={{
            input: { outline: "none", border: "none", background: "white" },
          }}
        />
      </Flex>
      <Button size="lg">Swap</Button>
    </Stack>
  );
}
