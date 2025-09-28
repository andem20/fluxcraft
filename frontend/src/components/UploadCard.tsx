import { Card, CardContent, Typography, Stack, Modal } from "@mui/material";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { fileSlice } from "../stores/slices/FileSlice";
import { dataframesOverviewSlice } from "../stores/Store";
import { JsDataFrame } from "polars-wasm";
import { JsonFetch } from "./JsonFetch";
import { FileUpload } from "./FileUpload";
import { LoadStep, TransformStep } from "./TransformCard";

export interface DataSourceProps {
  step: TransformStep;
  onLoadFile: (loadFile: LoadStep) => void;
  setLoading: (loading: boolean) => void;
  updateDataframeStore: (df: JsDataFrame) => void;
  loading: boolean;
}

interface UploadCardProps {
  open: boolean;
  step: TransformStep;
  onClose: () => void;
  onLoadFile: (loadFile: LoadStep) => void;
}

export function UploadCard({
  open,
  step,
  onClose,
  onLoadFile,
}: UploadCardProps) {
  const fluxcraftSelector = useSelector(
    (state: RootState) => state.file.fluxcraft
  );
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState(false);

  function updateDataframeStore(df: JsDataFrame) {
    dispatch(fileSlice.actions.setDataFrame(df));
    dispatch(
      dataframesOverviewSlice.actions.update(
        fluxcraftSelector.get_dataframe_names()
      )
    );
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Card elevation={3} sx={{ p: 3, maxWidth: 800, width: "100%" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {step.pending && `Cell #${step.id} Find: `}
            <b>{step.pending?.step.load[0]?.name ?? "Upload or Fetch Data"}</b>
          </Typography>

          <Stack spacing={3}>
            {(!step.pending || step.pending?.step.load[0]?.type === "FILE") && (
              <FileUpload
                step={step}
                loading={loading}
                setLoading={setLoading}
                onLoadFile={onLoadFile}
                updateDataframeStore={updateDataframeStore}
              />
            )}

            {(!step.pending || step.pending?.step.load[0]?.type === "HTTP") && (
              <JsonFetch
                step={step}
                onLoadFile={onLoadFile}
                setLoading={setLoading}
                updateDataframeStore={updateDataframeStore}
                loading={loading}
              />
            )}
          </Stack>
        </CardContent>
      </Card>
    </Modal>
  );
}
