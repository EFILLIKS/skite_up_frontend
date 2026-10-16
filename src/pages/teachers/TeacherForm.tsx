import { Box, Typography, CircularProgress } from "@mui/material";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Snackbar from "../../components/common/Snackbar";
import useTeacherForm from "../../hooks/useTeacherForm";

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Invited", value: "Invited" },
];

const TeacherForm = () => {
  const {
    isEditMode,
    isLoadingTeacher,
    isSaving,
    register,
    handleSubmit,
    onSubmit,
    handleClear,
    watch,
    setValue,
    errors,
    snackbar,
    handleCloseSnackbar,
    navigate,
  } = useTeacherForm();

  if (isLoadingTeacher) {
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
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 4 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
        <Box>
          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 700,
              color: "#101828",
              lineHeight: 1.25,
            }}
          >
            {isEditMode ? "Edit Teacher" : "Add New Teacher"}
          </Typography>
          <Typography sx={{ mt: 0.4, fontSize: 13, color: "#667085" }}>
            {isEditMode
              ? "Update teacher profile, contact details and credentials."
              : "Create teacher account, assign department and send login credentials."}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => navigate("/institution/teachers")}
          sx={{
            width: "fit-content",
            textTransform: "none",
            borderRadius: 1.5,
            borderColor: "#93c5fd",
            bgcolor: "#fff",
            color: "#2563eb",
            fontSize: 12.5,
            fontWeight: 600,
            px: 1.5,
            py: 0.4,
            minHeight: "unset",
            boxShadow: "none",
            "&:hover": {
              borderColor: "#60a5fa",
              bgcolor: "#eff6ff",
            },
          }}
        >
          &lt;&lt; Back
        </Button>
      </Box>

      <Card
        sx={{
          border: "1px solid #eaecf0",
          borderRadius: 2.5,
          bgcolor: "#ffffff",
          boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
        }}
        contentSx={{
          p: { xs: 2.5, sm: 3.5 },
          "&:last-child": { pb: { xs: 2.5, sm: 3.5 } },
        }}
      >
        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 700,
            color: "#101828",
            mb: 3,
          }}
        >
          Teacher Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            columnGap: 3,
            rowGap: 2.75,
          }}
        >
          <Input
            type="text"
            label="First Name *"
            textFieldProps={{
              ...register("firstName"),
              placeholder: "Eg: Priya",
              error: !!errors.firstName,
              helperText: errors.firstName?.message,
            }}
          />

          <Input
            type="text"
            label="Last Name *"
            textFieldProps={{
              ...register("lastName"),
              placeholder: "Eg: Raman",
              error: !!errors.lastName,
              helperText: errors.lastName?.message,
            }}
          />

          <Input
            type="email"
            label="Email Address *"
            textFieldProps={{
              ...register("email"),
              placeholder: "Eg: priya.raman@srgcollege.edu",
              error: !!errors.email,
              helperText: errors.email?.message,
              disabled: isEditMode,
            }}
          />

          <Input
            type="text"
            label="Phone Number"
            textFieldProps={{
              ...register("phoneNumber"),
              placeholder: "Eg: +91 9876543210",
              error: !!errors.phoneNumber,
              helperText: errors.phoneNumber?.message,
            }}
          />

          <Input
            type="text"
            label="Department *"
            textFieldProps={{
              ...register("department"),
              placeholder: "Eg: CSE",
              error: !!errors.department,
              helperText: errors.department?.message,
            }}
          />

          <Input
            type="text"
            label="Subject *"
            textFieldProps={{
              ...register("subject"),
              placeholder: "Eg: Computer Science",
              error: !!errors.subject,
              helperText: errors.subject?.message,
            }}
          />

          {isEditMode && (
            <Input
              type="select"
              label="Status *"
              options={statusOptions}
              textFieldProps={{
                ...register("status"),
                value: watch("status") || "Active",
                onChange: (e) =>
                  setValue("status", e.target.value, { shouldValidate: true }),
                error: !!errors.status,
                helperText: errors.status?.message,
              }}
            />
          )}
        </Box>
      </Card>

      {!isEditMode && (
        <Card
          sx={{
            border: "1px solid #bfdbfe",
            borderRadius: 2.5,
            bgcolor: "#eff6ff",
            boxShadow: "none",
          }}
          contentSx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}
        >
          <Typography sx={{ fontSize: 13, color: "#1d4ed8", fontWeight: 500 }}>
            ℹ Note: An automated welcome email containing a secure 8-character temporary password will be sent to the teacher's registered email address upon account creation.
          </Typography>
        </Card>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1.5,
          mt: 0.5,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleClear}
          sx={{
            textTransform: "none",
            color: "#e11d48",
            borderColor: "#f43f5e",
            bgcolor: "#fff",
            borderRadius: 1.5,
            px: 2.75,
            py: 0.85,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              borderColor: "#be123c",
              bgcolor: "#fff1f2",
            },
          }}
        >
          Clear all
        </Button>

        <Button
          variant="contained"
          type="submit"
          loading={isSaving}
          sx={{
            textTransform: "none",
            bgcolor: "#2563eb",
            color: "#ffffff",
            borderRadius: 1.5,
            px: 2.75,
            py: 0.85,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
            "&:hover": {
              bgcolor: "#1d4ed8",
            },
          }}
        >
          {isEditMode ? "Update Teacher" : "Add Teacher"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default TeacherForm;