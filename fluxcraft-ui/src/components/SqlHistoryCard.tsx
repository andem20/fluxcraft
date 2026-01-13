import {
  Card,
  CardContent,
  Modal,
  Stack,
  Typography,
  Divider,
  Box,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { AccessTime, Delete, History } from "@mui/icons-material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../stores/Store";
import { historySlice } from "../stores/slices/HistorySlice";
import moment from "moment";
import { useState } from "react";

interface SqlHistoryCardProps {
  open: boolean;
  onClose: () => void;
}

export function SqlHistoryCard({ open, onClose }: SqlHistoryCardProps) {
  const history = useSelector((state: RootState) => state.history);
  const dispatch = useDispatch<AppDispatch>();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClear = () => setConfirmOpen(true);
  const handleConfirm = () => {
    dispatch(historySlice.actions.clear());
    setConfirmOpen(false);
  };
  const handleCancel = () => setConfirmOpen(false);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Card
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 800,
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* HEADER */}
          <CardContent sx={{ flex: "0 0 auto" }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <History fontSize="small" />
                <Typography variant="h6">Query history</Typography>
              </Stack>

              <Button
                size="small"
                variant="outlined"
                onClick={handleClear}
                color="error"
                startIcon={<Delete />}
              >
                Clear
              </Button>
            </Stack>
            <Divider sx={{ mt: 1 }} />
          </CardContent>

          {/* SCROLLABLE HISTORY */}
          <Box sx={{ overflowY: "auto", px: 2, pb: 2, flex: "1 1 auto" }}>
            <Stack spacing={2}>
              {history.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic" }}
                >
                  No queries executed yet
                </Typography>
              )}

              {history.map((entry, index) => (
                <SqlHistoryItem
                  key={index}
                  query={entry.query}
                  timestamp={entry.timestamp}
                />
              ))}
            </Stack>
          </Box>
        </Card>
      </Modal>

      {/* CONFIRMATION MODAL */}
      <Modal
        open={confirmOpen}
        onClose={handleCancel}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Card sx={{ width: 400, p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6">Confirm Clear</Typography>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to clear the SQL history? This action cannot
              be undone.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" color="error" onClick={handleConfirm}>
                Clear
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Modal>
    </>
  );
}

interface SqlHistoryItemProps {
  query: string;
  timestamp: Date;
}

function SqlHistoryItem({ query, timestamp }: SqlHistoryItemProps) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        p: 1.5,
      }}
    >
      {/* META */}
      <Stack direction="row" spacing={0.5}>
        <AccessTime fontSize="inherit" color="secondary" />
        <Typography variant="caption" color="text.secondary">
          {moment(timestamp).format("YYYY-MM-DD HH:mm:ss")}
        </Typography>
      </Stack>

      {/* SQL */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "action.hover",
          borderRadius: 1,
          p: 1,
          fontFamily: "monospace",
          fontSize: 13,
          whiteSpace: "pre-wrap",
        }}
      >
        <Tooltip title="Copy SQL">
          <IconButton
            size="small"
            onClick={() => navigator.clipboard.writeText(query)}
            sx={{ position: "absolute", top: 4, right: 4 }}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>

        {query}
      </Box>
    </Box>
  );
}
