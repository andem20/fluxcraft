import { Container, Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../stores/Store";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export function Success() {
  const fileSelector = useSelector((state: RootState) => state.file.file);
  const dfSelector = useSelector((state: RootState) => state.file.df);
  const navigate = useNavigate();

  useEffect(() => {
    if (!fileSelector) {
      navigate("/");
    }
  }, []);

  return (
    <Container sx={{ mt: 8 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          elevation={3}
          sx={{ p: 4, position: "relative", overflow: "hidden" }}
        >
          <CardContent>
            <Typography variant="h4" gutterBottom>
              File Uploaded!
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              {dfSelector?.print()}
            </Typography>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                opacity: 0.2,
              }}
            ></Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
}
