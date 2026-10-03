
import {
    TextField,
    MenuItem,
    Radio,
    RadioGroup,
    FormControl,
    FormControlLabel,
    FormLabel,
    Switch,
    Checkbox,
} from "@mui/material";

import type { AppInputProps } from "../../types/Input.types";

const Input = (props: AppInputProps) => {
    switch (props.type) {
        case "text":
        case "email":
        case "password":
        case "number": {
            const { ref, ...fieldProps } = props.textFieldProps ?? {};

            return (
                <TextField
                    fullWidth
                    size="small"
                    label={props.label}
                    type={props.type}
                    {...fieldProps}
                    inputRef={ref}
                />
            );
        }

        case "select":
            return (
                <TextField
                    select
                    fullWidth
                    size="small"
                    label={props.label}
                    {...props.textFieldProps}
                >
                    {props.options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            );

        case "textarea":
            return (
                <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    size="small"
                    label={props.label}
                    {...props.textFieldProps}
                />
            );

        case "radio":
            return (
                <FormControl>
                    {props.label && <FormLabel>{props.label}</FormLabel>}

                    <RadioGroup {...props.radioProps}>
                        {props.options.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio />}
                                label={option.label}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            );

        case "switch":
            return (
                <FormControlLabel
                    control={<Switch {...props.switchProps} />}
                    label={props.label ?? ""}
                />
            );

        case "checkbox":
            return (
                <FormControlLabel
                    control={<Checkbox {...props.checkboxProps} />}
                    label={props.label ?? ""}
                />
            );

        default:
            return null;
    }
};

export default Input;
