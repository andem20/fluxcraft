import {
  Container,
  Card,
  CardContent,
  Stack,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../stores/Store";
import { UploadCard } from "../components/UploadCard";
import { DataframeOverviewCard } from "../components/DataframeOverviewCard";
import { QueryCard } from "../components/QueryCard";

export function Home() {
  const dfSelector = useSelector((state: RootState) => state.file.df);

  function handleNext() {
    if (dfSelector) {
      // renderDataframe(dfSelector);
    }
  }

  useEffect(() => {
    handleNext();
  }, []);

  return (
    <Container maxWidth={false} disableGutters>
      <DataframeOverviewCard />
      <UploadCard handleNext={handleNext} />

      <QueryCard />
    </Container>
  );
}
