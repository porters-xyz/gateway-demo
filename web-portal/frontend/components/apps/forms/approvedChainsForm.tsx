import _ from "lodash";
import { Button } from "@mantine/core";
import React from "react";

import { endpointsAtom, existingRuleValuesAtom } from "@frontend/utils/atoms";
import { useAtomValue, useAtom } from "jotai";
import { IEndpoint } from "@frontend/utils/types";
import { SearchableMultiSelect } from "@frontend/components/common/SearchableMultiSelect";

import { useUpdateRuleMutation } from "@frontend/utils/hooks";
import { useSearchParams, useParams } from "next/navigation";

export default function ApprovedChainForm() {
  const list = useAtomValue(endpointsAtom) as IEndpoint[];
  const items = _.map(list, "name");

  const appId = useParams()?.app as string;
  const searchParams = useSearchParams();
  const rule = searchParams?.get("rule") as string;
  const { mutateAsync, isPending, isSuccess } = useUpdateRuleMutation(
    appId,
    rule,
  );
  const [value, setValue] = useAtom(existingRuleValuesAtom);

  return (
    <React.Fragment>
      <SearchableMultiSelect items={items} value={value} setValue={setValue} />
      <Button
        fullWidth
        style={{ marginTop: 32 }}
        onClick={() => mutateAsync(value)}
        loading={isPending && !isSuccess}
      >
        Update Approved Chains
      </Button>
    </React.Fragment>
  );
}
