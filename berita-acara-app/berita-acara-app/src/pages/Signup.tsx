import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link as MuiLink,
  MenuItem,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('vendor');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(email.trim(), password, { name: name.trim(), role });
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error', err);
      setError(err?.message || 'Gagal mendaftar');
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700} textAlign="center" gutterBottom>
              Daftar - Reportify
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                margin="normal"
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                margin="normal"
                autoComplete="email"
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                margin="normal"
                autoComplete="new-password"
              />

              <TextField
                fullWidth
                select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                margin="normal"
              >
                <MenuItem value="vendor">Vendor</MenuItem>
                <MenuItem value="pic_gudang">PIC Gudang</MenuItem>
                <MenuItem value="pic_pemesan">PIC Pemesan</MenuItem>
                <MenuItem value="direksi">Direksi</MenuItem>
              </TextField>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, mb: 2 }}
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
              </Button>

              <Typography variant="body2" textAlign="center" color="text.secondary">
                Sudah punya akun?{' '}
                <MuiLink component={Link} to="/login" underline="hover">
                  Login di sini
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupPage;
