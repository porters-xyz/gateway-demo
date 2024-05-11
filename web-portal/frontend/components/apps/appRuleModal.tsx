import {
  useSearchParams,
  usePathname,
  useRouter,
  useParams,
} from "next/navigation";
import { Button, Modal } from "@mantine/core";
import SecretKeyForm from "./forms/secretKeyRuleForm";
import ApprovedChainForm from "./forms/approvedChainsForm";
import AllowedUserAgentsForm from "./forms/allowedUserAgentsForm";
import AllowedOriginsForm from "./forms/allowedOriginsForm";
import _ from "lodash";
import RateLimitForm from "./forms/rateLimitForm";

export default function CreateAppRuleModal() {
  const searchParams = useSearchParams();
  const shouldOpen = searchParams?.get("rule");
  const title = _.startCase(searchParams?.get("rule")?.replace("-", " "));
  const path = usePathname();
  const router = useRouter();

  return (
    <Modal
      opened={Boolean(shouldOpen)}
      onClose={() => router.replace(path as string)}
      title={`Update ` + title}
      centered
    >
      {shouldOpen === "allowed-origins" && <AllowedOriginsForm />}
      {shouldOpen === "secret-key" && <SecretKeyForm />}
      {shouldOpen === "approved-chains" && <ApprovedChainForm />}
      {shouldOpen === "allowed-user-agents" && <AllowedUserAgentsForm />}
      {shouldOpen === "rate-limit" && <RateLimitForm />}
    </Modal>
  );
}
