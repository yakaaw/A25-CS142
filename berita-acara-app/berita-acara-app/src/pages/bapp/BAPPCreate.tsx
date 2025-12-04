import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import BAPPForm from '../../components/BAPPForm';
import { useNavigate } from 'react-router-dom';

const BAPPCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <DescriptionIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Buat BAPP Baru
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Isi formulir di bawah untuk membuat Berita Acara Penyelesaian Pekerjaan
            </Typography>
          </Box>
        </Box>
      </Paper>
      <BAPPForm onSaved={(id) => navigate(`/bapp/${id}`)} />
    </Container>
  );
};

export default BAPPCreate;
