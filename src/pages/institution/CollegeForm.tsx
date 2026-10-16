import { Box, Typography, CircularProgress } from "@mui/material";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Snackbar from "../../components/common/Snackbar";
import useCollegeForm from "../../hooks/useCollegeForm";

const stateOptions = [
  { label: "Tamilnadu", value: "Tamilnadu" },
  { label: "Karnataka", value: "Karnataka" },
  { label: "Kerala", value: "Kerala" },
  { label: "Andhra Pradesh", value: "Andhra Pradesh" },
  { label: "Telangana", value: "Telangana" },
  { label: "Maharashtra", value: "Maharashtra" },
  { label: "Delhi", value: "Delhi" },
  { label: "Gujarat", value: "Gujarat" },
  { label: "Uttar Pradesh", value: "Uttar Pradesh" },
  { label: "West Bengal", value: "West Bengal" },
];

const countryOptions = [
  { label: "India", value: "India" },
  { label: "United States", value: "United States" },
  { label: "United Kingdom", value: "United Kingdom" },
  { label: "Canada", value: "Canada" },
  { label: "Australia", value: "Australia" },
  { label: "Singapore", value: "Singapore" },
  { label: "United Arab Emirates", value: "United Arab Emirates" },
];

const CollegeForm = () => {
  const {
    isEditMode,
    isLoadingCollege,
    isSaving,
    register,
    handleSubmit,
    onSubmit,
    handleClear,
    watch,
    errors,
    snackbar,
    handleCloseSnackbar,
    navigate,
  } = useCollegeForm();

  if (isLoadingCollege) {
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
            Colleges
          </Typography>
          <Typography sx={{ mt: 0.4, fontSize: 13, color: "#667085" }}>
            Manage college, student limits and renewal details.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => navigate("/colleges")}
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
          College Details
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
            label="Name of the college *"
            textFieldProps={{
              ...register("institutionName"),
              placeholder: "Eg: KNCET College",
              error: !!errors.institutionName,
              helperText: errors.institutionName?.message,
            }}
          />

          <Input
            type="text"
            label="College Code *"
            textFieldProps={{
              ...register("institutionCode"),
              placeholder: "SHS-01",
              error: !!errors.institutionCode,
              helperText: errors.institutionCode?.message,
            }}
          />

          <Input
            type="text"
            label="Address *"
            textFieldProps={{
              ...register("address"),
              placeholder: "12/3, Thottiyam",
              error: !!errors.address,
              helperText: errors.address?.message,
            }}
          />

          <Input
            type="text"
            label="City *"
            textFieldProps={{
              ...register("city"),
              placeholder: "Trichy",
              error: !!errors.city,
              helperText: errors.city?.message,
            }}
          />

          <Input
            type="select"
            label="State *"
            options={stateOptions}
            textFieldProps={{
              ...register("state"),
              value: watch("state") || "",
              error: !!errors.state,
              helperText: errors.state?.message,
            }}
          />

          <Input
            type="select"
            label="Country *"
            options={countryOptions}
            textFieldProps={{
              ...register("country"),
              value: watch("country") || "",
              error: !!errors.country,
              helperText: errors.country?.message,
            }}
          />

          <Input
            type="text"
            label="PostalCode *"
            textFieldProps={{
              ...register("postalCode"),
              placeholder: "638181",
              error: !!errors.postalCode,
              helperText: errors.postalCode?.message,
            }}
          />

          <Input
            type="text"
            label="Website"
            textFieldProps={{
              ...register("website"),
              placeholder: "www.abcollege.com",
              error: !!errors.website,
              helperText: errors.website?.message,
            }}
          />
        </Box>
      </Card>

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
          User Details
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(4, 1fr)",
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
              placeholder: "Seymour",
              error: !!errors.firstName,
              helperText: errors.firstName?.message,
            }}
          />

          <Input
            type="text"
            label="Last Name *"
            textFieldProps={{
              ...register("lastName"),
              placeholder: "Skinner",
              error: !!errors.lastName,
              helperText: errors.lastName?.message,
            }}
          />

          <Input
            type="email"
            label="Email id *"
            textFieldProps={{
              ...register("email"),
              placeholder: "head@springfieldhigh.edu",
              error: !!errors.email,
              helperText: errors.email?.message,
            }}
          />

          <Input
            type="text"
            label="Phone"
            textFieldProps={{
              ...register("phone"),
              placeholder: "+91 9876543210",
              error: !!errors.phone,
              helperText: errors.phone?.message,
            }}
          />
        </Box>
      </Card>

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
      </Card>

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
          {isEditMode ? "Update College" : "Add College"}
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

export default CollegeForm;