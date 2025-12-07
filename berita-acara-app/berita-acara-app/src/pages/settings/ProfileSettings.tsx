import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Divider,
  Avatar,
  Chip,
  Alert,
  IconButton,
  Drawer,
} from "@mui/material";
import {
  Lock as LockIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import PageHeader from "../../components/PageHeader";
import SignatureUpload from "../../components/SignatureUpload";

const ProfileSettings: React.FC = () => {
  const { userProfile, updateUserProfile, changePassword } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [address, setAddress] = useState(userProfile?.address || "");
  const [signatureUrl, setSignatureUrl] = useState(
    userProfile?.signatureUrl || ""
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Check if user has approval authority
  const hasApprovalAuthority = ["pic_gudang", "direksi", "admin"].includes(
    userProfile?.role || ""
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      await updateUserProfile({ name, phone, address, signatureUrl });
      showToast("Profil berhasil diperbarui", "success");
      setEditDialogOpen(false); // Close dialog on success
    } catch (error: any) {
      console.error("Error updating profile:", error);
      showToast("Gagal memperbarui profil", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast("Password saat ini wajib diisi", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Password baru tidak cocok", "error");
      return;
    }
    if (password.length < 6) {
      showToast("Password minimal 6 karakter", "error");
      return;
    }

    setLoadingPassword(true);
    try {
      await changePassword(password);
      showToast("Password berhasil diubah", "success");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      showToast(error.message || "Gagal mengubah password", "error");
    } finally {
      setLoadingPassword(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: { [key: string]: string } = {
      admin: "Administrator",
      pic_gudang: "PIC Gudang",
      pic_pemesan: "PIC Pemesan",
      vendor: "Vendor",
      direksi: "Direksi",
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (
    role: string
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    const colorMap: {
      [key: string]:
      | "default"
      | "primary"
      | "secondary"
      | "error"
      | "info"
      | "success"
      | "warning";
    } = {
      admin: "error",
      pic_gudang: "primary",
      pic_pemesan: "info",
      vendor: "warning",
      direksi: "secondary",
    };
    return colorMap[role] || "default";
  };

  return (
    <Box>
      <PageHeader
        title="Pengaturan Profil"
        breadcrumbs={[{ label: "Pengaturan Profil" }]}
      />

      <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
        <Stack spacing={3}>
          {/* Main Profile Card - Unified Section */}
          <Card elevation={2}>
            <CardContent sx={{ p: 4 }}>
              {/* Header with Avatar and Actions */}
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={4}
                alignItems={{ xs: "center", md: "flex-start" }}
              >
                {/* Avatar Section */}
                <Box sx={{ textAlign: "center" }}>
                  <Avatar
                    src={userProfile?.photoURL}
                    sx={{
                      width: 140,
                      height: 140,
                      bgcolor: "primary.main",
                      fontSize: "3.5rem",
                      fontWeight: 700,
                      mb: 2,
                      border: "4px solid",
                      borderColor: "background.paper",
                      boxShadow: 3,
                    }}
                  >
                    {!userProfile?.photoURL &&
                      (userProfile?.name?.charAt(0).toUpperCase() ||
                        userProfile?.email?.charAt(0).toUpperCase() ||
                        "U")}
                  </Avatar>

                  {/* Photo Actions */}
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button
                      variant="outlined"
                      size="small"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      sx={{ textTransform: 'none' }}
                    >
                      Upload
                      {' '}
                      <input
                        type="file"
                        hidden
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              showToast('File size must be less than 2MB', 'error');
                              return;
                            }
                            setLoadingProfile(true);
                            try {
                              const { uploadFile } = await import('../../services/storageService');
                              const url = await uploadFile(file, 'profile-photos');
                              await updateUserProfile({ photoURL: url });
                              showToast('Foto profil berhasil diupload', 'success');
                            } catch (error) {
                              console.error('Upload failed:', error);
                              showToast('Upload gagal', 'error');
                            } finally {
                              setLoadingProfile(false);
                            }
                          }
                        }}
                      />
                    </Button>
                    {userProfile?.photoURL && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={async () => {
                          setLoadingProfile(true);
                          try {
                            await updateUserProfile({ photoURL: '' });
                            showToast('Foto profil berhasil dihapus', 'success');
                          } catch (error) {
                            console.error('Remove failed:', error);
                            showToast('Gagal menghapus foto', 'error');
                          } finally {
                            setLoadingProfile(false);
                          }
                        }}
                        disabled={loadingProfile}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </Box>

                {/* Profile Info */}
                <Box sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="h4" fontWeight={700}>
                      {userProfile?.name || "User"}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setEditDialogOpen(true)}
                      sx={{
                        color: "primary.main",
                        "&:hover": { bgcolor: "primary.lighter" },
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      icon={<BadgeIcon />}
                      label={getRoleLabel(userProfile?.role || "")}
                      color={getRoleColor(userProfile?.role || "")}
                      size="small"
                    />
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Active"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* Profile Details */}
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flex: 1 }}
                      >
                        <EmailIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {userProfile?.email}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flex: 1 }}
                      >
                        <PhoneIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            No. Telepon
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {userProfile?.phone || "-"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ flex: 1 }}
                      >
                        <CalendarIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Bergabung
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {userProfile?.createdAt
                              ? new Date(
                                userProfile.createdAt
                              ).toLocaleDateString("id-ID")
                              : "-"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Box sx={{ flex: 1 }} /> {/* Spacer */}
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <LocationIcon
                        fontSize="small"
                        color="action"
                        sx={{ mt: 0.5 }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Alamat
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {userProfile?.address || "-"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Digital Signature Section - Only for approval authorities */}
          {hasApprovalAuthority && (
            <Card elevation={2}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Tanda Tangan Digital
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Upload tanda tangan untuk approval otomatis pada dokumen BAPB
                  dan BAPP
                </Typography>

                {userProfile?.signatureUrl ? (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Tanda Tangan Saat Ini:
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        border: "2px solid",
                        borderColor: "success.light",
                        borderRadius: 2,
                        bgcolor: "success.lighter",
                        display: "inline-block",
                      }}
                    >
                      <img
                        src={userProfile.signatureUrl}
                        alt="Current signature"
                        style={{
                          maxWidth: "300px",
                          maxHeight: "100px",
                          display: "block",
                        }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    Belum ada tanda tangan. Upload tanda tangan Anda untuk
                    approval otomatis.
                  </Alert>
                )}

                <SignatureUpload
                  currentSignature={signatureUrl}
                  label="Upload Tanda Tangan Baru"
                  onUploadComplete={(base64) => {
                    setSignatureUrl(base64);
                    showToast(
                      "Tanda tangan berhasil diupload. Klik Simpan untuk menyimpan perubahan.",
                      "success"
                    );
                  }}
                />

                <Button
                  variant="contained"
                  disabled={
                    loadingProfile || signatureUrl === userProfile?.signatureUrl
                  }
                  onClick={handleUpdateProfile}
                  startIcon={
                    loadingProfile ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{ mt: 2 }}
                >
                  {loadingProfile ? "Menyimpan..." : "Simpan Tanda Tangan"}
                </Button>
              </CardContent>
            </Card>
          )}
        </Stack>

        {/* Edit Profile Drawer */}
        <Drawer
          anchor="right"
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          slotProps={{
            paper: {
              sx: {
                width: { xs: "100%", sm: 500 },
                borderRadius: 0,
              },
            },
          }}
        >
          {/* Drawer Header */}
          <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Edit Profil
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Perbarui informasi profil Anda
                </Typography>
              </Box>
              <IconButton
                onClick={() => setEditDialogOpen(false)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>

          {/* Drawer Content */}
          <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
            <Stack spacing={3}>
              {/* Profile Avatar Section */}
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Avatar
                  src={userProfile?.photoURL}
                  sx={{
                    width: 100,
                    height: 100,
                    mx: "auto",
                    mb: 1.5,
                    bgcolor: "primary.main",
                    fontSize: "2.5rem",
                    fontWeight: 700,
                  }}
                >
                  {!userProfile?.photoURL &&
                    (userProfile?.name?.charAt(0).toUpperCase() || "U")}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>
                  {userProfile?.name || "User"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {userProfile?.email}
                </Typography>
              </Box>

              <Divider />

              {/* Form Fields */}
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 2 }}
                >
                  Informasi Dasar
                </Typography>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={userProfile?.email || ""}
                    disabled
                    variant="outlined"
                    helperText="Hubungi administrator untuk mengubah email Anda"
                    sx={{
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "text.primary",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    placeholder="Masukkan nama lengkap"
                  />

                  <TextField
                    fullWidth
                    label="No. Telepon"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant="outlined"
                    placeholder="+62 812 3456 7890"
                    helperText="Format: +62 xxx xxxx xxxx"
                  />

                  <TextField
                    fullWidth
                    label="Alamat"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    variant="outlined"
                    multiline
                    rows={5}
                    placeholder="Masukkan alamat lengkap Anda"
                    helperText="Alamat akan digunakan untuk keperluan administrasi"
                  />
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Change Password Section */}
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      bgcolor: "error.lighter",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "error.main",
                    }}
                  >
                    <LockIcon fontSize="small" />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Ubah Password
                  </Typography>
                </Stack>

                <Alert severity="warning" sx={{ mb: 2.5 }}>
                  Pastikan password baru Anda kuat dan mudah diingat
                </Alert>

                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Password Saat Ini"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    variant="outlined"
                    placeholder="Masukkan password saat ini"
                    helperText="Wajib diisi untuk keamanan akun Anda"
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Password Baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    variant="outlined"
                    placeholder="Minimal 6 karakter"
                    helperText="Password minimal 6 karakter"
                  />

                  <TextField
                    fullWidth
                    type="password"
                    label="Konfirmasi Password Baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    variant="outlined"
                    placeholder="Ketik ulang password baru"
                    helperText="Harus sama dengan password baru"
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Drawer Footer */}
          <Box
            sx={{
              p: 3,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Button
                onClick={() => setEditDialogOpen(false)}
                disabled={loadingProfile || loadingPassword}
                size="large"
                sx={{ px: 3 }}
              >
                Tutup
              </Button>

              <Stack direction="row" spacing={2}>
                {/* Change Password Button */}
                {(currentPassword || password || confirmPassword) && (
                  <Button
                    onClick={handleChangePassword}
                    variant="outlined"
                    color="error"
                    disabled={loadingPassword || loadingProfile}
                    size="large"
                    startIcon={
                      loadingPassword ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <LockIcon />
                      )
                    }
                    sx={{ px: 3 }}
                  >
                    {loadingPassword ? "Mengubah..." : "Ubah Password"}
                  </Button>
                )}

                {/* Save Profile Button */}
                <Button
                  onClick={handleUpdateProfile}
                  variant="contained"
                  disabled={loadingProfile || loadingPassword}
                  size="large"
                  startIcon={
                    loadingProfile ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SaveIcon />
                    )
                  }
                  sx={{ px: 4 }}
                >
                  {loadingProfile ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Drawer>
      </Box>
    </Box >
  );
};

export default ProfileSettings;
