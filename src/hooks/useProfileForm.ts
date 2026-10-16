import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  profileSchema,
  type ProfileFormData,
} from "../utils/ProfileSchema";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "../features/authservice/AuthApi";
import type { SnackbarState } from "../types/Snackbar.types";

const defaultFormValues: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  profilePicture: "",
  state: "Tamil Nadu",
  district: "Namakkal",
};

export const useProfileForm = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const { data: profileResponse, isLoading: isLoadingProfile } = useProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: defaultFormValues,
  });

  useEffect(() => {
    if (profileResponse?.data) {
      const user = profileResponse.data;
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        profilePicture: user.profilePicture || "",
        state: "Tamil Nadu",
        district: "Namakkal",
      });
    }
  }, [profileResponse, reset]);

  const handleCancel = () => {
    if (profileResponse?.data) {
      const user = profileResponse.data;
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        profilePicture: user.profilePicture || "",
        state: "Tamil Nadu",
        district: "Namakkal",
      });
    } else {
      reset(defaultFormValues);
    }
    navigate(-1);
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: {
        firstName: string;
        lastName?: string;
        phone?: string;
        email?: string;
        password?: string;
        profilePicture?: string;
      } = {
        firstName: data.firstName,
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        profilePicture: data.profilePicture || "",
      };

      if (data.password && data.password.trim().length >= 8) {
        payload.password = data.password.trim();
      }

      const res = (await updateProfile(payload).unwrap()) as {
        message?: string;
      };

      setSnackbar({
        open: true,
        message: res?.message || "Profile updated successfully!",
        severity: "success",
      });
    } catch (err: unknown) {
      const errorObj = err as { data?: { message?: string }; message?: string };
      setSnackbar({
        open: true,
        message:
          errorObj?.data?.message ||
          errorObj?.message ||
          "Failed to update profile. Please try again.",
        severity: "error",
      });
    }
  };

  return {
    isLoadingProfile,
    isUpdating,
    register,
    handleSubmit,
    onSubmit,
    handleCancel,
    watch,
    errors,
    isDirty,
    snackbar,
    handleCloseSnackbar,
    profileData: profileResponse?.data,
    updateProfile,
  };
};

export default useProfileForm;
