import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  teacherSchema,
  type TeacherValidationData,
} from "../utils/TeacherSchema";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useGetTeacherByIdQuery,
} from "../features/teacherservice/TeacherApi";
import type { TeacherItem } from "../types/Teacher.types";
import type { SnackbarState } from "../types/Snackbar.types";

export interface UseTeacherFormProps {
  teacherToEdit?: TeacherItem | null;
  onSuccess?: () => void;
  onClose?: () => void;
}

const defaultValues: TeacherValidationData = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  department: "",
  subject: "",
  status: "Active",
};

export const useTeacherForm = (props?: UseTeacherFormProps) => {
  const { id: paramId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const id = props?.teacherToEdit?.id || paramId;
  const isEditMode = Boolean(id && id !== "new");

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: teacherDetailResponse,
    isLoading: isLoadingTeacher,
  } = useGetTeacherByIdQuery(id as string, {
    skip: !isEditMode || !id,
  });

  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TeacherValidationData>({
    resolver: yupResolver(teacherSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    const item = props?.teacherToEdit || teacherDetailResponse?.data;
    if (isEditMode && item) {
      reset({
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        email: item.email || "",
        phoneNumber: item.phoneNumber || "",
        department: item.department || "",
        subject: item.subject || "",
        status: item.status || "Active",
      });
    } else if (!isEditMode) {
      reset(defaultValues);
    }
  }, [isEditMode, props?.teacherToEdit, teacherDetailResponse, reset]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClear = () => {
    reset(defaultValues);
  };

  const onSubmit = async (formData: TeacherValidationData) => {
    try {
      if (isEditMode && id) {
        const res = await updateTeacher({
          id,
          changes: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            department: formData.department,
            subject: formData.subject,
            phoneNumber: formData.phoneNumber || undefined,
            status: formData.status || undefined,
          },
        }).unwrap();

        setSnackbar({
          open: true,
          message: res.message || "Teacher updated successfully",
          severity: "success",
        });

        if (props?.onSuccess) {
          props.onSuccess();
        } else {
          setTimeout(() => {
            navigate("/institution/teachers");
          }, 800);
        }

        if (props?.onClose) {
          props.onClose();
        }
      } else {
        const res = await createTeacher({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department,
          subject: formData.subject,
          status: formData.status || "Active",
        }).unwrap();

        setSnackbar({
          open: true,
          message: res.message || "Teacher created successfully",
          severity: "success",
        });

        reset(defaultValues);

        if (props?.onSuccess) {
          props.onSuccess();
        } else {
          setTimeout(() => {
            navigate("/institution/teachers");
          }, 800);
        }

        if (props?.onClose) {
          props.onClose();
        }
      }
    } catch (err: unknown) {
      let errorMsg = isEditMode
        ? "Failed to update teacher"
        : "Failed to create teacher";

      if (typeof err === "object" && err !== null && "data" in err) {
        const errorData = (err as { data?: { message?: string } }).data;
        if (errorData?.message) {
          errorMsg = errorData.message;
        }
      }

      setSnackbar({
        open: true,
        message: errorMsg,
        severity: "error",
      });
    }
  };

  return {
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
  };
};

export default useTeacherForm;
