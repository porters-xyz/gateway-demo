import React from "react";
import { Stack, Table, Input, CopyButton, Tooltip } from "@mantine/core";
import { IEndpoint } from "@frontend/utils/types";
import { useAtomValue } from "jotai";
import { endpointsAtom } from "@frontend/utils/atoms";
import _ from "lodash";
import { useParams } from "next/navigation";
const EndpointList: React.FC = () => {
  const list = useAtomValue(endpointsAtom) as IEndpoint[];
  const appId = _.get(useParams(), "app");
  const rows = list.map((endpoint: IEndpoint) => (
    <Table.Tr key={endpoint.id} style={{ cursor: "pointer" }}>
      <Table.Th>{_.toUpper(_.replace(endpoint.name, /-/g, " "))}</Table.Th>
      <Table.Td>
        <CopyButton value={`https://${endpoint.name}.rpc.porters.xyz/${appId}`}>
          {({ copied, copy }) => (
            <Tooltip
              label={copied ? "Copied Endpoint" : "Copy Endpoint"}
              bg={copied ? "orange" : "black"}
            >
              <Input
                value={`https://${endpoint.name}.rpc.porters.xyz/${appId}`}
                readOnly
                style={{ cursor: "pointer" }}
                onClick={copy}
              />
            </Tooltip>
          )}
        </CopyButton>
      </Table.Td>
    </Table.Tr>
  ));

  if (list.length === 0) {
    return <Stack>Loading..</Stack>;
  }

  return (
    <Stack>
      <Table
        horizontalSpacing="xl"
        verticalSpacing="md"
        style={{ background: "#FEFCFA", borderRadius: 5 }}
        highlightOnHover
        highlightOnHoverColor="#00000004"
      >
        <Table.Thead c="umbra.1">
          <Table.Tr>
            <Table.Th style={{ fontWeight: "normal" }}>Network</Table.Th>
            <Table.Th style={{ fontWeight: "normal" }}>Your Endpoint</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Stack>
  );
};

export default EndpointList;
