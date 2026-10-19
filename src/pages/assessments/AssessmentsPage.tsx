import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import Snackbar from "../../components/common/Snackbar";
import type { SnackbarState } from "../../types/Snackbar.types";
import type { AssessmentTab } from "../../types/Assessment.types";
import AssessmentResultTab from "./components/AssessmentResultTab";
import AssessmentAssignTab from "./components/AssessmentAssignTab";
import AssessmentHistoryTab from "./components/AssessmentHistoryTab";

export const AssessmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssessmentTab>("Result");

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSuccess = (message: string) => {
    setSnackbar({ open: true, message, severity: "success" });
  };

  const showError = (message: string) => {
    setSnackbar({ open: true, message, severity: "error" });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "100vh", bgcolor: "#fafafa" }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 700, color: "#101828", fontSize: { xs: "20px", sm: "24px" } }}
        >
          Assessments
        </Typography>
        <Typography variant="body2" sx={{ color: "#667085", mt: 0.5, fontSize: "13.5px" }}>
          Active assessments currently assigned to students across Objective, LSRW, Cognitive games and Coding.
        </Typography>
      </Box>

      <Box sx={{ borderBottom: "1px solid #eaecf0", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val as AssessmentTab)}
          sx={{
            minHeight: 44,
            "& .MuiTabs-indicator": {
              backgroundColor: "#b42318",
              height: 2.5,
              borderRadius: "2px",
            },
          }}
        >
          {(["Result", "Assign", "History"] as AssessmentTab[]).map((tab) => (
            <Tab
              key={tab}
              value={tab}
              label={tab}
              sx={{
                textTransform: "none",
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: "14px",
                color: activeTab === tab ? "#b42318" : "#667085",
                minHeight: 44,
                px: 2,
                "&.Mui-selected": {
                  color: "#b42318",
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {activeTab === "Result" && (
        <AssessmentResultTab onSuccess={showSuccess} onError={showError} />
      )}
      {activeTab === "Assign" && (
        <AssessmentAssignTab onSuccess={showSuccess} onError={showError} />
      )}
      {activeTab === "History" && (
        <AssessmentHistoryTab />
      )}

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Box>
  );
};

export default AssessmentsPage;
