import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Switch,
  Slider,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { jwtDecode } from "jwt-decode";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Snackbar from "../../components/common/Snackbar";
import useProfileForm from "../../hooks/useProfileForm";
import type { JwtPayload } from "../../types/JwtDecode.types";
import type { ProfileUpdateDto } from "../../types/Auth.api.types";

const tabs = ["Profile", "System"];

const stateOptions = [
  { label: "Tamil Nadu", value: "Tamil Nadu" },
  { label: "Kerala", value: "Kerala" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Telangana", value: "Telangana" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Delhi", value: "Delhi" },
];

const districtOptions = [
  { label: "Namakkal", value: "Namakkal" },
  { label: "Salem", value: "Salem" },
  { label: "Trichy", value: "Trichy" },
  { label: "Chennai", value: "Chennai" },
  { label: "Coimbatore", value: "Coimbatore" },
  { label: "Madurai", value: "Madurai" },
  { label: "Erode", value: "Erode" },
];

const getUserRole = (): string => {
  const role = sessionStorage.getItem("role") || localStorage.getItem("role");
  if (role) return role;
  const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.role || "";
    } catch {
      return "";
    }
  }
  return "";
};

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Profile");


  const {
    isLoadingProfile,
    isUpdating,
    register,
    handleSubmit,
    onSubmit,
    handleCancel,
    watch,
    errors,
    snackbar,
    handleCloseSnackbar,
    profileData,
    updateProfile,
  } = useProfileForm();

  const userRole = getUserRole();
  const isInstitutionAdmin =
    userRole === "ROLE_INSTITUTION_ADMIN" ||
    profileData?.role === "ROLE_INSTITUTION_ADMIN";

  const totalRange =
    profileData?.totalMembers ??
    ((profileData?.studentRange ?? 0) + (profileData?.teacherRange ?? 0) > 0
      ? (profileData?.studentRange ?? 0) + (profileData?.teacherRange ?? 0)
      : 20);

  const [keyboardOption, setKeyboardOption] = useState(false);
  const [defaultPasswordView, setDefaultPasswordView] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState(true);
  const [studentRange, setStudentRange] = useState<number>(20);
  const teacherRange = Math.max(0, totalRange - studentRange);
  const [themeMode, setThemeMode] = useState("System Theme");
  const [isSavingSystem, setIsSavingSystem] = useState(false);
  const [systemSnackbar, setSystemSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (profileData) {
      setKeyboardOption(Boolean(profileData.keyboardOption));
      setDefaultPasswordView(profileData.defaultPasswordView !== false);
      setNotificationSettings(profileData.notificationSettings !== false);
      const total =
        profileData.totalMembers ??
        ((profileData.studentRange ?? 0) + (profileData.teacherRange ?? 0) > 0
          ? (profileData.studentRange ?? 0) + (profileData.teacherRange ?? 0)
          : 20);
      setStudentRange(profileData.studentRange ?? total);
      if (profileData.theme) {
        setThemeMode(profileData.theme);
      }
    }
  }, [profileData]);

  const handleCancelSystemSettings = () => {
    if (profileData) {
      setKeyboardOption(Boolean(profileData.keyboardOption));
      setDefaultPasswordView(profileData.defaultPasswordView !== false);
      setNotificationSettings(profileData.notificationSettings !== false);
      const total =
        profileData.totalMembers ??
        ((profileData.studentRange ?? 0) + (profileData.teacherRange ?? 0) > 0
          ? (profileData.studentRange ?? 0) + (profileData.teacherRange ?? 0)
          : 20);
      setStudentRange(profileData.studentRange ?? total);
      setThemeMode(profileData.theme || "System Theme");
    } else {
      setKeyboardOption(false);
      setDefaultPasswordView(true);
      setNotificationSettings(true);
      setStudentRange(20);
      setThemeMode("System Theme");
    }
    navigate(-1);
  };

  const handleSaveSystemSettings = async () => {
    try {
      setIsSavingSystem(true);
      const calculatedTeacherRange = Math.max(0, totalRange - studentRange);
      const payload: ProfileUpdateDto = {
        studentRange,
        teacherRange: calculatedTeacherRange,
        keyboardOption,
        defaultPasswordView,
        notificationSettings,
        theme: themeMode,
        settings: {
          ...(profileData?.settings || {}),
          studentRange,
          teacherRange: calculatedTeacherRange,
          keyboardOption,
          defaultPasswordView,
          notificationSettings,
          theme: themeMode,
        },
      };

      const res = await updateProfile(payload).unwrap();

      setSystemSnackbar({
        open: true,
        message: res?.message || "System settings saved successfully",
        severity: "success",
      });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setSystemSnackbar({
        open: true,
        message:
          errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to save system settings. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSavingSystem(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 6 }}>
      <Box>
        <Typography
          sx={{
            fontSize: 24,
            fontWeight: 700,
            color: "#101828",
            lineHeight: 1.25,
          }}
        >
          Settings
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: 13, color: "#667085" }}>
          modify your Taste
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3.5,
          borderBottom: "1px solid #eaecf0",
          pb: 0,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Box
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                pb: 1.5,
                cursor: "pointer",
                userSelect: "none",
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#db2777" : "#667085",
                borderBottom: isActive ? "2px solid #db2777" : "2px solid transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  color: isActive ? "#db2777" : "#101828",
                },
              }}
            >
              {tab}
            </Box>
          );
        })}
      </Box>

      {activeTab === "Profile" && (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 3,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Your photo
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                This will be displayed on your profile.
              </Typography>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", md: "58%" },
                display: "flex",
                alignItems: "center",
                gap: 2.5,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "#f2f4f7",
                  border: "2px dashed #d0d5dd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#98a2b3", bgcolor: "#eaecf0" },
                }}
              >
                <IconButton size="small" component="label" sx={{ p: 1.5 }}>
                  <AddIcon sx={{ color: "#667085", fontSize: 24 }} />
                  <input type="file" hidden accept="image/*" />
                </IconButton>
              </Box>
              <Typography sx={{ fontSize: 12, color: "#667085" }}>
                JPG, GIF or PNG. Max size 2MB
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Name
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                First and last name
              </Typography>
            </Box>
            <Box
              sx={{
                width: { xs: "100%", md: "58%" },
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Input
                type="text"
                label="First Name"
                textFieldProps={{
                  ...register("firstName"),
                  placeholder: "First name",
                  error: !!errors.firstName,
                  helperText: errors.firstName?.message,
                }}
              />
              <Input
                type="text"
                label="Last Name"
                textFieldProps={{
                  ...register("lastName"),
                  placeholder: "Last name",
                  error: !!errors.lastName,
                  helperText: errors.lastName?.message,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Email address
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Used for notifications and account recovery
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "58%" } }}>
              <Input
                type="email"
                label="Email"
                textFieldProps={{
                  ...register("email"),
                  placeholder: "user@example.com",
                  disabled: true,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Phone number
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Used to sign in, for email receipt and product updates
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "58%" } }}>
              <Input
                type="text"
                label="Phone number"
                textFieldProps={{
                  ...register("phone"),
                  placeholder: "+91-9876543210",
                  error: !!errors.phone,
                  helperText: errors.phone?.message,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Password
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Leave empty to keep existing, or min 8 characters
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "58%" } }}>
              <Input
                type="password"
                label="New Password"
                textFieldProps={{
                  ...register("password"),
                  placeholder: "Enter new password",
                  error: !!errors.password,
                  helperText: errors.password?.message,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                State
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Select your State
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "58%" } }}>
              <Input
                type="select"
                label="State"
                options={stateOptions}
                textFieldProps={{
                  ...register("state"),
                  value: watch("state") || "Tamil Nadu",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                District
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Select your District
              </Typography>
            </Box>
            <Box sx={{ width: { xs: "100%", md: "58%" } }}>
              <Input
                type="select"
                label="District"
                options={districtOptions}
                textFieldProps={{
                  ...register("district"),
                  value: watch("district") || "Namakkal",
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1.5,
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancel}
              sx={{
                textTransform: "none",
                color: "#db2777",
                borderColor: "#db2777",
                bgcolor: "#fff",
                borderRadius: 1.5,
                px: 3,
                py: 0.85,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#be185d",
                  bgcolor: "#fdf2f8",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              type="submit"
              loading={isUpdating}
              sx={{
                textTransform: "none",
                bgcolor: "#2563eb",
                color: "#ffffff",
                borderRadius: 1.5,
                px: 3.5,
                py: 0.85,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      )}

      {activeTab === "System" && (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Keyboard Option
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                keyboard operated by mouse
              </Typography>
            </Box>

            <Switch
              checked={keyboardOption}
              onChange={(e) => setKeyboardOption(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#2563eb",
                  "& + .MuiSwitch-track": { bgcolor: "#2563eb" },
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Default password view
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Password visibility shows on all pages
              </Typography>
            </Box>

            <Switch
              checked={defaultPasswordView}
              onChange={(e) => setDefaultPasswordView(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#2563eb",
                  "& + .MuiSwitch-track": { bgcolor: "#2563eb" },
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Notification Settings
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                System notificaton shared through email
              </Typography>
            </Box>

            <Switch
              checked={notificationSettings}
              onChange={(e) => setNotificationSettings(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#2563eb",
                  "& + .MuiSwitch-track": { bgcolor: "#2563eb" },
                },
              }}
            />
          </Box>

          {isInstitutionAdmin && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                py: 2.75,
                borderBottom: "1px solid #f2f4f7",
                gap: 2,
              }}
            >
              <Box sx={{ width: { xs: "100%", md: "38%" } }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                  Range
                </Typography>
                <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                  Students and Teachers range
                </Typography>
              </Box>

              <Box sx={{ width: { xs: "100%", md: "48%" } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    mb: 0.5,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>
                      {studentRange}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }}>
                      Students
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>
                      {teacherRange}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#667085" }}>
                      Teachers
                    </Typography>
                  </Box>
                </Box>

                <Slider
                  value={studentRange}
                  min={0}
                  max={Math.max(1, totalRange)}
                  step={1}
                  disabled={totalRange <= 0}
                  onChange={(_, val) => setStudentRange(Number(val))}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    "& .MuiSlider-rail": {
                      bgcolor: "#9d174d",
                      opacity: 1,
                    },
                    "& .MuiSlider-track": {
                      bgcolor: "#2563eb",
                      border: "none",
                    },
                    "& .MuiSlider-thumb": {
                      height: 22,
                      width: 22,
                      bgcolor: "#ffffff",
                      border: "4px solid #0f172a",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      "&:hover, &.Mui-focusVisible": {
                        boxShadow: "0 0 0 6px rgba(37, 99, 235, 0.16)",
                      },
                    },
                  }}
                />
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              py: 2.75,
              borderBottom: "1px solid #f2f4f7",
              gap: 2,
            }}
          >
            <Box sx={{ width: { xs: "100%", md: "38%" } }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#101828" }}>
                Theme
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "#667085", mt: 0.35 }}>
                Dark, Ligh, System theme
              </Typography>
            </Box>

            <Box sx={{ width: { xs: "100%", md: "320px" } }}>
              <Select
                fullWidth
                size="small"
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value)}
                sx={{
                  borderRadius: 1.5,
                  fontSize: 13,
                  bgcolor: "#ffffff",
                  "& .MuiSelect-select": {
                    py: 0.8,
                    px: 1.5,
                  },
                }}
              >
                <MenuItem value="System Theme" sx={{ fontSize: 13 }}>
                  System Theme
                </MenuItem>
                <MenuItem value="Light Theme" sx={{ fontSize: 13 }}>
                  Light Theme
                </MenuItem>
                <MenuItem value="Dark Theme" sx={{ fontSize: 13 }}>
                  Dark Theme
                </MenuItem>
              </Select>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 1.5,
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCancelSystemSettings}
              disabled={isSavingSystem}
              sx={{
                textTransform: "none",
                color: "#db2777",
                borderColor: "#db2777",
                bgcolor: "#fff",
                borderRadius: 1.5,
                px: 3,
                py: 0.85,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  borderColor: "#be185d",
                  bgcolor: "#fdf2f8",
                },
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveSystemSettings}
              loading={isSavingSystem}
              sx={{
                textTransform: "none",
                bgcolor: "#2563eb",
                color: "#ffffff",
                borderRadius: 1.5,
                px: 3.5,
                py: 0.85,
                fontSize: 13,
                fontWeight: 600,
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                "&:hover": {
                  bgcolor: "#1d4ed8",
                },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      )}



      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />

      <Snackbar
        open={systemSnackbar.open}
        message={systemSnackbar.message}
        severity={systemSnackbar.severity}
        onClose={() => setSystemSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default Settings;
