import type {
    TextFieldProps,
    RadioGroupProps,
    SwitchProps,
    CheckboxProps,
} from "@mui/material";

export type InputType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "radio"
    | "switch"
    | "checkbox";

export interface InputOption {
    label: string;
    value: string | number;
}

export interface BaseInputProps {
    label?: string;
}

export type AppInputProps =
    | (BaseInputProps & {
        type: "text" | "email" | "password" | "number";
        textFieldProps?: TextFieldProps;
    })
    | (BaseInputProps & {
        type: "select";
        options: InputOption[];
        textFieldProps?: TextFieldProps;
    })
    | (BaseInputProps & {
        type: "textarea";
        textFieldProps?: TextFieldProps;
    })
    | (BaseInputProps & {
        type: "radio";
        options: InputOption[];
        radioProps?: RadioGroupProps;
    })
    | (BaseInputProps & {
        type: "switch";
        switchProps?: SwitchProps;
    })
    | (BaseInputProps & {
        type: "checkbox";
        checkboxProps?: CheckboxProps;
    });

export type CustomInputProps = AppInputProps;