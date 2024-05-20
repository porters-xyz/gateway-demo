import { useState } from "react";
import {
  CheckIcon,
  Combobox,
  Group,
  Pill,
  PillsInput,
  useCombobox,
  ScrollArea,
  Text
} from "@mantine/core";

export function SearchableMultiSelect({
  items,
  value,
  setValue,
}: {
  items: string[];
  value: string[];
  setValue: (value: string[]) => void;
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");

  const handleValueSelect = (val: string) =>
    setValue(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );

  const handleValueRemove = (val: string) =>
    setValue(value.filter((v) => v !== val));

  const values = value.map((item) => (
    <Pill
      key={item}
      withRemoveButton
      onRemove={() => handleValueRemove(item)}
      bg="blue"
      c="#fff"
      size="lg"
    >
      {item}
    </Pill>
  ));

  const options = items
    .filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
    .map((item) => (
      <Combobox.Option value={item} key={item} active={value.includes(item)}>
        <Group gap="sm">
          {value.includes(item) ? <CheckIcon size={12} /> : null}
          <span>{item}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={handleValueSelect}
      withinPortal={true}
      size="md"
    >
      <Combobox.DropdownTarget >
        <PillsInput onClick={() => combobox.openDropdown()} size="md" styles={{
          input: {
            backgroundColor:'#FEFCFA'
          },

        }}>
          <Pill.Group>
            {values}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder="Search Chain/Network"
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" && search.length === 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown style={{
        backgroundColor:'#FEFCFA'
      }}>
      <ScrollArea.Autosize mah={200} type="scroll">
        <Combobox.Options>
        <Combobox.Header>
                    <Text fz="xs">Scroll to see more networks</Text>
                  </Combobox.Header>
          {options.length > 0 ? (
            options
          ) : (
            <Combobox.Empty>Nothing found...</Combobox.Empty>
          )}
        </Combobox.Options>
        </ScrollArea.Autosize>
      </Combobox.Dropdown>
    </Combobox>
  );
}
