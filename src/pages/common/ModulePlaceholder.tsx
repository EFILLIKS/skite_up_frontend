import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface ModulePlaceholderProps {
  title: string;
  subtitle: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({ title, subtitle }) => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1d2939" }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "#667085", mt: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          border: "1px solid #eaecf0",
          bgcolor: "#ffffff",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#344054" }}>
          {title} Module
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          This section is currently being configured for teachers.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ModulePlaceholder;
