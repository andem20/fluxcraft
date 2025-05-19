import {
  Button,
  Card,
  CardContent,
  Container,
  Input,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export function Contact() {
  return (
    <Container sx={{ mt: 10 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3">Contact Us</Typography>
        <Card elevation={6} sx={{ p: 6, width: "100%", maxWidth: 600 }}>
          <CardContent>
            <Stack spacing={3}>
              <TextField label="Name" variant="outlined" fullWidth />
              <TextField label="Email" variant="outlined" fullWidth />
              <TextField
                label="Message"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
              />
              <Input type="file" fullWidth />
              <Button variant="contained" size="large">
                Send Message
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
