import { Container } from "@mui/material";
import { UploadCard } from "../components/UploadCard";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { QueryCard } from "../components/QueryCard";

export function Home() {
  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />
      <UploadCard />

      <QueryCard />
    </Container>
  );
}
