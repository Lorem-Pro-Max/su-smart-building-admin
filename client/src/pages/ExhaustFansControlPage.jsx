import Container from "@components/layout/ContentLayout/Container";
import {
  ExhaustFansControlTitleIcon,
  ExhaustFansControlButtonIcon,
} from "@assets/icons";
import { useExhaustFans } from "@hooks/pageHooks/useExhaustFans";

function ExhaustFansControlPage() {
  const { dataState, control } = useExhaustFans();

  return (
    <Container
      pageIcon={<ExhaustFansControlTitleIcon />}
      pageButtonIcon={<ExhaustFansControlButtonIcon />}
      pageTitle="พัดลมดูดอากาศ"
      dataState={dataState}
      control={control}
    />
  );
}

export default ExhaustFansControlPage;
