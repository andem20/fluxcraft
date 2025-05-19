import { Typography, Container, Card, CardContent, Button } from '@mui/material';

export function About() {
  return (
    <Container sx={{ mt: 8 }}>
      <Card elevation={3} sx={{ p: 4 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            About
          </Typography>
          <Typography variant="body1">
            Discover more about us and what we do.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}