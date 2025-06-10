import { Box, Card, CardContent, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import React from "react";

const codingSteps = [
  { title: "Input", description: "Receive data" },
  { title: "Process", description: "Apply logic" },
  { title: "Output", description: "Return result" },
];

export function TransformPipeline() {
  return (
    <Card elevation={3} sx={{ p: 2, m: 2 }}>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Specify transformation
        </Typography>
        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} p={2}>
          {codingSteps.map((step, index) => (
            <React.Fragment key={index}>
              <Card
                sx={{
                  minWidth: 150,
                }}
              >
                <CardContent>
                  <Typography variant="h6">{step.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
              {index < codingSteps.length - 1 && (
                <ArrowForwardIcon sx={{ fontSize: 40, color: "gray" }} />
              )}
            </React.Fragment>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
