import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams } from "react-router-dom";
import {
  collegeSchema,
  type CollegeFormData,
} from "../utils/CollegeSchema";
import {
  useCreateInstitutionMutation,
  useUpdateInstitutionMutation,
  useGetInstitutionQuery,
  type CreateInstitutionRequest,
} from "../features/institutionservice/InstitutionApi";
import type { SnackbarState } from "../types/Snackbar.types";

const defaultFormValues: CollegeFormData = {
  institutionName: "",
  institutionCode: "",
  email: "",
  address: "",
  city: "",
  state: "Tamilnadu",
  country: "India",
  postalCode: "",
  website: "",
  firstName: "",
  lastName: "",
  phone: "",
  settings: {
    mcqTest: true,
    codingTest: true,
    lsrwTest: true,
  },
};

export const useCollegeForm = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id && id !== "new");
  const navigate = useNavigate();

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const {
    data: institutionDetail,
    isLoading: isLoadingCollege,
  } = useGetInstitutionQuery(id as string, {
    skip: !isEditMode,
  });

  const [createInstitution, { isLoading: isCreating }] = useCreateInstitutionMutation();
  const [updateInstitution, { isLoading: isUpdating }] = useUpdateInstitutionMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CollegeFormData>({
    resolver: yupResolver(collegeSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (isEditMode && institutionDetail?.data) {
      const item = institutionDetail.data;
      reset({
        institutionName: item.institutionName || "",
        institutionCode: item.institutionCode || "",
        email: item.email || item.organization?.orgEmail || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "Tamilnadu",
        country: item.country || "India",
        postalCode: item.postalCode || "",
        website: item.website || "",
        firstName: item.firstName || "",
        lastName: item.lastName || "",
        phone: item.phone || item.organization?.orgPhoneNumber || "",
        settings: {
          mcqTest: item.settings?.mcqTest ?? true,
          codingTest: item.settings?.codingTest ?? true,
          lsrwTest: item.settings?.lsrwTest ?? true,
        },
      });
    }
  }, [isEditMode, institutionDetail, reset]);

  const handleClear = () => {
    reset(defaultFormValues);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = async (data: CollegeFormData) => {
    try {
      if (isEditMode && id) {
        await updateInstitution({
          id,
          changes: {
            institutionName: data.institutionName,
            institutionCode: data.institutionCode,
            address: data.address,
            city: data.city,
            state: data.state,
            country: data.country,
            postalCode: data.postalCode,
            website: data.website,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            settings: {
              mcqTest: Boolean(data.settings?.mcqTest),
              codingTest: Boolean(data.settings?.codingTest),
              lsrwTest: Boolean(data.settings?.lsrwTest),
            },
          },
        }).unwrap();

        setSnackbar({
          open: true,
          message: "College updated successfully!",
          severity: "success",
        });

        setTimeout(() => {
          navigate("/colleges");
        }, 800);
      } else {
        const payload: CreateInstitutionRequest = {
          institutionName: data.institutionName,
          institutionCode: data.institutionCode,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postalCode: data.postalCode,
          website: data.website || "",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || "",
          settings: {
            mcqTest: Boolean(data.settings?.mcqTest),
            codingTest: Boolean(data.settings?.codingTest),
            lsrwTest: Boolean(data.settings?.lsrwTest),
          },
        };

        const res = (await createInstitution(payload).unwrap()) as {
          message?: string;
          statusCode?: number;
        };

        setSnackbar({
          open: true,
          message: res?.message || "College created successfully!",
          severity: "success",
        });

        setTimeout(() => {
          navigate("/colleges");
        }, 800);
      }
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setSnackbar({
        open: true,
        message:
          errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to save college. Please check your inputs.",
        severity: "error",
      });
    }
  };

  return {
    isEditMode,
    isLoadingCollege,
    isSaving: isCreating || isUpdating,
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

export default useCollegeForm;
