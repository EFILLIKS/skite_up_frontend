import { useEffect, useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  studentTableSchema,
  createEmptyStudentRow,
  type StudentTableFormData,
} from "../utils/StudentSchema";
import {
  parseCSV,
  parseXLSX,
  parseXML,
  convertRowsToStudents,
  downloadSampleCSV,
} from "../utils/studentImportUtils";
import {
  useCreateStudentsBatchMutation,
  useGetStudentByIdQuery,
  useUpdateStudentMutation,
} from "../features/studentservice/StudentApi";
import type {
  InstitutionType,
  StudentImportResponseData,
  StudentManualRow,
} from "../types/Student.types";
import type { SnackbarState } from "../types/Snackbar.types";

export const useStudentTableForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id && id !== "new");

  const [institutionType, setInstitutionType] = useState<InstitutionType>("College");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [importResult, setImportResult] = useState<StudentImportResponseData | null>(null);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [createBatch, { isLoading: isBatchCreating }] = useCreateStudentsBatchMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

  const { data: studentDetail, isLoading: isLoadingSingle } = useGetStudentByIdQuery(
    id as string,
    { skip: !isEditMode }
  );

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<StudentTableFormData>({
    resolver: yupResolver(studentTableSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      students: [
        createEmptyStudentRow("College"),
        createEmptyStudentRow("College"),
        createEmptyStudentRow("College"),
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "students",
  });

  useEffect(() => {
    if (isEditMode && studentDetail?.data) {
      const s = studentDetail.data;
      replace([
        {
          id: s.id,
          registerNumber: s.registerNumber || "",
          studentName: s.studentName || "",
          degree: s.degree || "",
          batch: s.batch || "2026",
          department: s.department || "",
          section: s.section || "",
          email: s.email || "",
          phoneNumber: s.phoneNumber || "",
          institutionType: s.institutionType || "College",
        },
      ]);
      clearErrors();
    }
  }, [isEditMode, studentDetail, replace, clearErrors]);

  const handleInstitutionTypeChange = (newType: InstitutionType) => {
    setInstitutionType(newType);
    const currentRows = getValues("students") || [];
    const updated = currentRows.map((r) => ({
      ...r,
      institutionType: newType,
      section: newType === "College" ? r.section || "A" : "",
    }));
    replace(updated);
    clearErrors();
  };

  const handleAddRow = () => {
    append(createEmptyStudentRow(institutionType));
  };

  const handleRemoveRow = (index: number) => {
    if (fields.length === 1) {
      replace([createEmptyStudentRow(institutionType)]);
      clearErrors();
      return;
    }
    remove(index);
    clearErrors();
  };

  const handleClear = () => {
    replace([
      createEmptyStudentRow(institutionType),
      createEmptyStudentRow(institutionType),
      createEmptyStudentRow(institutionType),
    ]);
    clearErrors();
    setSelectedFile(null);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setIsParsingFile(true);

    try {
      let parsedStudents: StudentManualRow[] = [];
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith(".csv") || fileName.endsWith(".txt")) {
        const text = await file.text();
        const matrix = parseCSV(text);
        parsedStudents = convertRowsToStudents(matrix, institutionType);
      } else if (fileName.endsWith(".xml")) {
        const text = await file.text();
        parsedStudents = parseXML(text, institutionType);
      } else if (fileName.endsWith(".xlsx")) {
        parsedStudents = await parseXLSX(file, institutionType);
      } else {
        const text = await file.text();
        const matrix = parseCSV(text);
        parsedStudents = convertRowsToStudents(matrix, institutionType);
      }

      if (parsedStudents.length === 0) {
        setSnackbar({
          open: true,
          message: `No student records found in ${file.name}. Please check the file columns and format.`,
          severity: "warning",
        });
        return;
      }

      replace(parsedStudents);
      clearErrors();

      setSnackbar({
        open: true,
        message: `Loaded ${parsedStudents.length} student(s) from ${file.name} into the table. Review details and click Save.`,
        severity: "success",
      });
    } catch (err: unknown) {
      console.error("Error reading file:", err);
      setSnackbar({
        open: true,
        message: `Failed to read ${file.name}. Please ensure the file format is valid CSV or Excel.`,
        severity: "error",
      });
    } finally {
      setIsParsingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownloadSample = () => {
    downloadSampleCSV(institutionType);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const isSaving = isBatchCreating || isUpdating || isSubmitting;

  const onSubmit = async (data: StudentTableFormData) => {
    if (isEditMode && id) {
      const target = data.students[0];
      try {
        await updateStudent({
          id,
          changes: {
            registerNumber: target.registerNumber,
            studentName: target.studentName,
            degree: target.degree || undefined,
            batch: target.batch,
            department: target.department,
            section: target.section,
            email: target.email || undefined,
            phoneNumber: target.phoneNumber || undefined,
          },
        }).unwrap();

        setSnackbar({
          open: true,
          message: "Student details updated successfully",
          severity: "success",
        });
        setTimeout(() => navigate("/institution/students"), 800);
      } catch (err: unknown) {
        let msg = "Failed to update student";
        if (typeof err === "object" && err !== null && "data" in err) {
          const errorData = (err as { data?: { message?: string } }).data;
          if (errorData?.message) msg = errorData.message;
        }
        setSnackbar({ open: true, message: msg, severity: "error" });
      }
      return;
    }

    try {
      const sanitizedStudents = data.students.map((r) => ({
        registerNumber: r.registerNumber.trim(),
        studentName: r.studentName.trim(),
        degree: (r.degree || "").trim(),
        batch: r.batch.trim() || "2026",
        department: r.department.trim(),
        section: institutionType === "College" ? (r.section || "A").trim() : "",
        email: (r.email || "").trim(),
        phoneNumber: (r.phoneNumber || "").trim(),
        institutionType,
      }));

      const res = await createBatch({
        institutionType,
        students: sanitizedStudents,
      }).unwrap();

      if (res?.data && res.data.failedCount && res.data.failedCount > 0) {
        setImportResult(res.data);
        return;
      }

      setSnackbar({
        open: true,
        message:
          res?.message ||
          (sanitizedStudents.length === 1
            ? "Student saved successfully"
            : `Successfully saved ${sanitizedStudents.length} student(s)`),
        severity: "success",
      });

      setTimeout(() => {
        navigate("/institution/students");
      }, 900);
    } catch (err: unknown) {
      let msg = "Failed to save students";
      if (typeof err === "object" && err !== null && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        if (errorData?.message) msg = errorData.message;
      }
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  return {
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
    control,
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
  };
};

export default useStudentTableForm;
