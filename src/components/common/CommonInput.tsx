import { useState } from 'react'
import type { ChangeEventHandler, HTMLInputTypeAttribute, ReactNode } from 'react'
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded'
import VisibilityRounded from '@mui/icons-material/VisibilityRounded'
import { IconButton, InputAdornment, TextField } from '@mui/material'
import type { TextFieldProps } from '@mui/material/TextField'

export interface CommonInputProps extends Omit<TextFieldProps, 'InputProps' | 'inputProps' | 'onChange' | 'slotProps' | 'type' | 'variant'> {
  /** Optional content displayed inside the input before the editable value. */
  startIcon?: ReactNode
  /** Optional content displayed inside the input after the editable value. */
  endIcon?: ReactNode
  /** The native input type. Password fields receive a visibility control by default. */
  type?: HTMLInputTypeAttribute
  /** TextField-compatible input event for input and multiline fields. */
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  /** Material UI TextField variant. Defaults to outlined. */
  variant?: 'outlined' | 'filled' | 'standard'
  /** Disable the built-in show/hide control for password fields. */
  passwordToggle?: boolean
  /** Native maximum input length. */
  maxLength?: number
  /** Native minimum numeric/date value. */
  min?: number | string
  /** Native maximum numeric/date value. */
  max?: number | string
}

export default function CommonInput({
  startIcon,
  endIcon,
  type = 'text',
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  passwordToggle = true,
  error = false,
  helperText,
  multiline = false,
  maxLength,
  min,
  max,
  onChange,
  ...textFieldProps
}: CommonInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && passwordVisible ? 'text' : type
  const visibilityControl = isPassword && passwordToggle ? (
    <IconButton
      aria-label={passwordVisible ? 'Hide password' : 'Show password'}
      aria-pressed={passwordVisible}
      edge="end"
      onClick={() => setPasswordVisible((visible) => !visible)}
      onMouseDown={(event) => event.preventDefault()}
      size="small"
    >
      {passwordVisible ? <VisibilityOffRounded fontSize="small" /> : <VisibilityRounded fontSize="small" />}
    </IconButton>
  ) : null
  const resolvedEndIcon = endIcon || visibilityControl ? (
    <>
      {endIcon}
      {visibilityControl}
    </>
  ) : undefined

  return (
    <TextField
      {...textFieldProps}
      onChange={onChange}
      type={resolvedType}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      error={error}
      helperText={helperText}
      multiline={multiline}
      slotProps={{
        input: {
          startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : undefined,
          endAdornment: resolvedEndIcon ? <InputAdornment position="end">{resolvedEndIcon}</InputAdornment> : undefined,
        },
        htmlInput: {
          maxLength,
          min,
          max,
        },
      }}
      sx={{
        '& .MuiInputLabel-root': {
          color: 'text.secondary',
          fontWeight: 600,
          '&.Mui-focused': { color: 'primary.main' },
          '&.Mui-error': { color: 'error.main' },
        },
        '& .MuiOutlinedInput-root': {
          minHeight: multiline ? undefined : 50,
          borderRadius: 1,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          fontSize: 15,
          fontWeight: 500,
          transition: (theme) => theme.transitions.create(['border-color', 'box-shadow', 'background-color']),
          '& fieldset': { borderColor: 'divider' },
          '&:hover fieldset': { borderColor: 'primary.light' },
          '&.Mui-focused': {
            backgroundColor: 'background.paper',
            '& fieldset': { borderColor: 'primary.main', borderWidth: 1.5 },
            boxShadow: (theme) => `0 0 0 3px ${theme.palette.primary.main}14`,
          },
          '&.Mui-error fieldset': { borderColor: 'error.main' },
          '&.Mui-disabled': { backgroundColor: 'action.hover' },
          '&.Mui-disabled fieldset': { borderColor: 'divider' },
          '& input::placeholder, & textarea::placeholder': { color: 'text.secondary', opacity: 0.72 },
        },
        '& .MuiFilledInput-root': {
          minHeight: multiline ? undefined : 50,
          borderRadius: 2,
          backgroundColor: 'action.hover',
          '&:hover': { backgroundColor: 'action.selected' },
          '&.Mui-focused': { backgroundColor: 'background.paper' },
        },
        '& .MuiInputBase-input': { paddingTop: multiline ? 1.5 : undefined, paddingBottom: multiline ? 1.5 : undefined },
        '& .MuiFormHelperText-root': {
          marginLeft: 0,
          marginRight: 0,
          marginTop: 0.75,
          fontSize: 12,
          lineHeight: 1.45,
          fontWeight: 500,
        },
        '& .MuiInputAdornment-root': { color: 'text.secondary' },
      }}
    />
  )
}
