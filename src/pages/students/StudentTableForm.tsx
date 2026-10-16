import {
    Box,
    Typography,
    Table as TableMUI,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    IconButton,
    Select,
    MenuItem,
    CircularProgress,
    Paper,
} from "@mui/material";
import {
    FileUploadOutlined,
    FileDownloadOutlined,
    Add as AddIcon,
    DeleteOutlineOutlined,
    CheckCircleOutlineOutlined,
} from "@mui/icons-material";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Dialog from "../../components/common/Dialog";
import Snackbar from "../../components/common/Snackbar";
import useStudentTableForm from "../../hooks/useStudentTableForm";
import type { InstitutionType } from "../../types/Student.types";
const getFieldError = (errorObj?: { message?: string }, value?: string) => {
    if (!errorObj) return { hasError: false, message: undefined };
    if (errorObj.message?.toLowerCase().includes("required") && value && value.trim() !== "") {
        return { hasError: false, message: undefined };
    }
    return { hasError: Boolean(errorObj), message: errorObj.message };
};

const StudentTableForm = () => {
    const {
        isEditMode,
        isLoadingSingle,
        isSaving,
        institutionType,
        handleInstitutionTypeChange,
        fields,
        register,
        handleSubmit,
        onSubmit,
        errors,
        clearErrors,
        handleAddRow,
        handleRemoveRow,
        handleClear,
        fileInputRef,
        selectedFile,
        isParsingFile,
        handleTriggerUpload,
        handleFileChange,
        handleDownloadSample,
        importResult,
        setImportResult,
        snackbar,
        handleCloseSnackbar,
        navigate,
    } = useStudentTableForm();

    if (isLoadingSingle) {
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
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                }}
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box>
                        <Typography
                            sx={{
                                fontSize: 24,
                                fontWeight: 700,
                                color: "#101828",
                                lineHeight: 1.25,
                            }}
                        >
                            Students
                        </Typography>
                        <Typography sx={{ mt: 0.4, fontSize: 13, color: "#667085" }}>
                            Manage college, student limits and renewal details.
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={() => navigate("/institution/students")}
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Select
                        size="small"
                        value={institutionType}
                        onChange={(e) =>
                            handleInstitutionTypeChange(e.target.value as InstitutionType)
                        }
                        sx={{
                            borderRadius: 2,
                            fontSize: 13,
                            fontWeight: 500,
                            bgcolor: "#ffffff",
                            minWidth: 120,
                            "& .MuiSelect-select": {
                                py: 0.75,
                                px: 1.5,
                            },
                        }}
                    >
                        <MenuItem value="College" sx={{ fontSize: 13 }}>
                            College
                        </MenuItem>
                        <MenuItem value="Institution" sx={{ fontSize: 13 }}>
                            Institution
                        </MenuItem>
                    </Select>
                </Box>
            </Box>

            {!isEditMode && (
                <Card
                    sx={{
                        border: "1px solid #eaecf0",
                        borderRadius: 2.5,
                        bgcolor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                    }}
                    contentSx={{
                        p: { xs: 2.5, sm: 3 },
                        "&:last-child": { pb: { xs: 2.5, sm: 3 } },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>
                            Import Students details
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<FileDownloadOutlined sx={{ fontSize: 18 }} />}
                            onClick={handleDownloadSample}
                            sx={{
                                textTransform: "none",
                                color: "#e11d48",
                                borderColor: "#fda4af",
                                borderRadius: 2,
                                fontSize: 13,
                                fontWeight: 600,
                                px: 2,
                                py: 0.6,
                                "&:hover": {
                                    borderColor: "#f43f5e",
                                    bgcolor: "#fff1f2",
                                },
                            }}
                        >
                            Download Sample
                        </Button>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Typography sx={{ fontSize: 13, color: "#667085" }}>
                            Import Excel file : csv, xml, xlsx
                        </Typography>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".csv,.xlsx,.xls,.xml"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />

                        <Button
                            variant="outlined"
                            startIcon={<FileUploadOutlined sx={{ fontSize: 18 }} />}
                            onClick={handleTriggerUpload}
                            loading={isParsingFile}
                            sx={{
                                width: "fit-content",
                                textTransform: "none",
                                borderRadius: 2,
                                borderColor: "#d0d5dd",
                                color: "#344054",
                                fontSize: 13,
                                fontWeight: 600,
                                px: 2,
                                py: 0.7,
                                "&:hover": {
                                    bgcolor: "#f9fafb",
                                    borderColor: "#98a2b3",
                                },
                            }}
                        >
                            {selectedFile ? `File: ${selectedFile.name}` : "Upload File"}
                        </Button>
                    </Box>
                </Card>
            )}

            <Card
                sx={{
                    border: "1px solid #eaecf0",
                    borderRadius: 2.5,
                    bgcolor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(16, 24, 40, 0.04)",
                }}
                contentSx={{
                    p: { xs: 2.5, sm: 3 },
                    "&:last-child": { pb: { xs: 2.5, sm: 3 } },
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 1.5,
                        mb: 2,
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#101828" }}>
                            {isEditMode ? "Edit Student Details" : "Add Student Manually"}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 12,
                                color: "#475467",
                                bgcolor: "#f2f4f7",
                                px: 1,
                                py: 0.25,
                                borderRadius: 1.5,
                                fontWeight: 600,
                            }}
                        >
                            {fields.length} {fields.length === 1 ? "record" : "records"}
                        </Typography>
                    </Box>

                    {selectedFile && !isEditMode && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                                sx={{
                                    fontSize: 12.5,
                                    color: "#1d4ed8",
                                    bgcolor: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    px: 1.5,
                                    py: 0.4,
                                    borderRadius: 1.5,
                                    fontWeight: 600,
                                }}
                            >
                                Prepopulated from {selectedFile.name} ({fields.length} row
                                {fields.length === 1 ? "" : "s"})
                            </Typography>
                            <Button
                                variant="text"
                                size="small"
                                onClick={handleClear}
                                sx={{
                                    fontSize: 12,
                                    color: "#667085",
                                    textTransform: "none",
                                    p: 0.5,
                                    minWidth: "unset",
                                    "&:hover": { color: "#ef4444" },
                                }}
                            >
                                Clear
                            </Button>
                        </Box>
                    )}
                </Box>

                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: "1px solid #eaecf0",
                        borderRadius: 2,
                        overflowX: "auto",
                        maxHeight: fields.length > 5 ? 580 : "none",
                    }}
                >
                    <TableMUI sx={{ minWidth: 1100 }}>
                        <TableHead sx={{ bgcolor: "#f9fafb" }}>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        width: 50,
                                    }}
                                >
                                    #
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 170,
                                    }}
                                >
                                    Register number *
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 170,
                                    }}
                                >
                                    Student Name *
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 110,
                                    }}
                                >
                                    Degree
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 110,
                                    }}
                                >
                                    Batch *
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 130,
                                    }}
                                >
                                    Department *
                                </TableCell>
                                {institutionType === "College" && (
                                    <TableCell
                                        sx={{
                                            fontWeight: 600,
                                            fontSize: 12.5,
                                            color: "#475467",
                                            minWidth: 100,
                                        }}
                                    >
                                        Section
                                    </TableCell>
                                )}
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 190,
                                    }}
                                >
                                    Email *
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        minWidth: 150,
                                    }}
                                >
                                    Phone *
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: 12.5,
                                        color: "#475467",
                                        width: 60,
                                        align: "center",
                                    }}
                                >
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {fields.map((field, index) => {
                                const rowErrors = errors.students?.[index];

                                const regError = getFieldError(rowErrors?.registerNumber, field.registerNumber);
                                const nameError = getFieldError(rowErrors?.studentName, field.studentName);
                                const degError = getFieldError(rowErrors?.degree, field.degree);
                                const batchError = getFieldError(rowErrors?.batch, field.batch);
                                const deptError = getFieldError(rowErrors?.department, field.department);
                                const secError = getFieldError(rowErrors?.section, field.section);
                                const emailError = getFieldError(rowErrors?.email, field.email);
                                const phoneError = getFieldError(rowErrors?.phoneNumber, field.phoneNumber);

                                return (
                                    <TableRow
                                        key={field.id}
                                        hover
                                        sx={{ "&:last-child td": { borderBottom: 0 } }}
                                    >
                                        <TableCell
                                            sx={{
                                                fontSize: 13,
                                                color: "#667085",
                                                fontWeight: 500,
                                                verticalAlign: "top",
                                                pt: 2,
                                            }}
                                        >
                                            {index + 1}
                                        </TableCell>

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="e.g. 621321106001"
                                                {...register(`students.${index}.registerNumber` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.registerNumber) {
                                                            clearErrors(`students.${index}.registerNumber` as any);
                                                        }
                                                    },
                                                })}
                                                error={regError.hasError}
                                                helperText={regError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="e.g. Student 1"
                                                {...register(`students.${index}.studentName` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.studentName) {
                                                            clearErrors(`students.${index}.studentName` as any);
                                                        }
                                                    },
                                                })}
                                                error={nameError.hasError}
                                                helperText={nameError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="e.g. B.E"
                                                {...register(`students.${index}.degree` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.degree) {
                                                            clearErrors(`students.${index}.degree` as any);
                                                        }
                                                    },
                                                })}
                                                error={degError.hasError}
                                                helperText={degError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="e.g. 2026"
                                                {...register(`students.${index}.batch` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.batch) {
                                                            clearErrors(`students.${index}.batch` as any);
                                                        }
                                                    },
                                                })}
                                                error={batchError.hasError}
                                                helperText={batchError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="e.g. ECE"
                                                {...register(`students.${index}.department` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.department) {
                                                            clearErrors(`students.${index}.department` as any);
                                                        }
                                                    },
                                                })}
                                                error={deptError.hasError}
                                                helperText={deptError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        {institutionType === "College" && (
                                            <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    placeholder="e.g. A"
                                                    {...register(`students.${index}.section` as const, {
                                                        onChange: () => {
                                                            if (rowErrors?.section) {
                                                                clearErrors(`students.${index}.section` as any);
                                                            }
                                                        },
                                                    })}
                                                    error={secError.hasError}
                                                    helperText={secError.message}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root": {
                                                            borderRadius: 1.5,
                                                            fontSize: 13,
                                                        },
                                                        "& .MuiOutlinedInput-input": {
                                                            py: 0.7,
                                                            px: 1.2,
                                                        },
                                                        "& .MuiFormHelperText-root": {
                                                            mx: 0.5,
                                                            fontSize: 11,
                                                        },
                                                    }}
                                                />
                                            </TableCell>
                                        )}

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                type="email"
                                                placeholder="e.g. student@gmail.com"
                                                {...register(`students.${index}.email` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.email) {
                                                            clearErrors(`students.${index}.email` as any);
                                                        }
                                                    },
                                                })}
                                                error={emailError.hasError}
                                                helperText={emailError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1, verticalAlign: "top" }}>
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="e.g. 9876543210"
                                                {...register(`students.${index}.phoneNumber` as const, {
                                                    onChange: () => {
                                                        if (rowErrors?.phoneNumber) {
                                                            clearErrors(`students.${index}.phoneNumber` as any);
                                                        }
                                                    },
                                                })}
                                                error={phoneError.hasError}
                                                helperText={phoneError.message}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        borderRadius: 1.5,
                                                        fontSize: 13,
                                                    },
                                                    "& .MuiOutlinedInput-input": { py: 0.7, px: 1.2 },
                                                    "& .MuiFormHelperText-root": {
                                                        mx: 0.5,
                                                        fontSize: 11,
                                                    },
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ py: 1, align: "center", verticalAlign: "top", pt: 1.5 }}>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveRow(index)}
                                                disabled={isEditMode}
                                                sx={{
                                                    border: "1px solid #fecaca",
                                                    borderRadius: 1.5,
                                                    p: 0.6,
                                                    color: "#ef4444",
                                                    bgcolor: "#fff",
                                                    "&:hover": { bgcolor: "#fef2f2" },
                                                    "&.Mui-disabled": { opacity: 0.4 },
                                                }}
                                            >
                                                <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </TableMUI>
                </TableContainer>

                {!isEditMode && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <IconButton
                            onClick={handleAddRow}
                            sx={{
                                border: "1px dashed #d0d5dd",
                                borderRadius: 2,
                                px: 2,
                                py: 0.6,
                                color: "#475467",
                                bgcolor: "#f9fafb",
                                "&:hover": { bgcolor: "#f2f4f7", borderColor: "#98a2b3" },
                            }}
                        >
                            <AddIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                )}

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 1.5,
                        mt: 3,
                    }}
                >
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/institution/students")}
                        disabled={isSaving}
                        sx={{
                            textTransform: "none",
                            color: "#475467",
                            borderColor: "#d0d5dd",
                            borderRadius: 1.5,
                            px: 2.75,
                            py: 0.85,
                            fontSize: 13,
                            fontWeight: 600,
                            "&:hover": { borderColor: "#98a2b3", bgcolor: "#f9fafb" },
                        }}
                    >
                        Cancel
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
                            px: 3,
                            py: 0.85,
                            fontSize: 13,
                            fontWeight: 600,
                            boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                            "&:hover": { bgcolor: "#1d4ed8" },
                        }}
                    >
                        {isEditMode ? "Update Student" : "Save"}
                    </Button>
                </Box>
            </Card>

            <Dialog
                open={Boolean(importResult)}
                onClose={() => setImportResult(null)}
                title="File Import Completed"
                maxWidth="xs"
                showCloseButton
                actions={
                    <Button
                        variant="contained"
                        onClick={() => {
                            setImportResult(null);
                            navigate("/institution/students");
                        }}
                        sx={{ textTransform: "none", bgcolor: "#2563eb", borderRadius: 1.5 }}
                    >
                        Go to Student Registry
                    </Button>
                }
            >
                {importResult && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#16a34a" }}>
                            <CheckCircleOutlineOutlined />
                            <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                                {importResult.successCount} of {importResult.totalProcessed} records imported
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, color: "#667085" }}>
                            Failed records: {importResult.failedCount}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: "#667085" }}>
                            Current seat usage: {importResult.usedSeats} / {importResult.totalSeats} (
                            {importResult.remainingSeats} remaining)
                        </Typography>
                    </Box>
                )}
            </Dialog>

            <Snackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </Box>
    );
};

export default StudentTableForm;
