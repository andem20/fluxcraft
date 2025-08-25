import { Container } from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard } from "../components/TransformCard";

export function Home() {
  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />
      <TransformCard />
    </Container>
  );
}
