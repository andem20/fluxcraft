import { Container } from "@mui/material";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { TransformCard } from "../components/QueryCard";

export function Home() {
  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />
      <TransformCard />
    </Container>
  );
}
