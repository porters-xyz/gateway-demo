import React, { useState } from "react";
import { Modal, TextInput, Text, Flex, Stack } from "@mantine/core";
import _ from "lodash";
import Image from "next/image";
import { IToken } from "@frontend/utils/types";

interface Props {
  options: IToken[];
  opened: boolean;
  onSelect: (option: IToken) => void;
  onClose: () => void;
}

export const SearchableSelectModal: React.FC<Props> = ({
  options,
  onSelect,
  opened,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState<string | null>(null);

  const onChange = (newValue: string) => {
    setSearchValue(newValue);
  };

  const filteredOptions = _.filter(options, (option: IToken) =>
    typeof searchValue === "string"
      ? _.toLower(option.symbol).includes(_.toLower(searchValue))
      : options,
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select token to swap"
      centered
    >
      <TextInput
        size="lg"
        radius="md"
        style={{ marginBottom: 20 }}
        placeholder="Search..."
        defaultValue={""}
        onChange={(event) => onChange(event.target.value)}
        title="Select Token to swap"
      />
      <Stack>
        {filteredOptions.map((option) => (
          <Flex
            key={_.get(option, "address")}
            onClick={() => onSelect(option)}
            align="center"
            p={8}
          >
            <Image
              src={_.get(option, "logoURI")}
              alt="ETH"
              width={32}
              height={32}
              style={{ marginRight: 20, borderRadius: 50 }}
            />
            <Stack gap={1}>
              <Text style={{ fontWeight: 700 }}>
                {_.get(option, "symbol") + ` - ` + _.get(option, "name")}
              </Text>
              <Text size="sm">{_.get(option, "address")}</Text>
            </Stack>
          </Flex>
        ))}
      </Stack>
    </Modal>
  );
};
