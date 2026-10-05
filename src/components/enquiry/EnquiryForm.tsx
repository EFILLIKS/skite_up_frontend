import { useState } from 'react'
import type { FormEvent } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import CloseRounded from '@mui/icons-material/CloseRounded'
import SendRounded from '@mui/icons-material/SendRounded'
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, IconButton, Snackbar, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import CommonInput from '../common/CommonInput'
import { emptyEnquiry, enquirySchema, type EnquiryFormValues } from './enquirySchema'
import { useSubmitEnquiryMutation } from '../../services/contactApi'

interface EnquiryFormProps {
  open: boolean
  onClose: () => void
}

export default function EnquiryForm({ open, onClose }: EnquiryFormProps) {
  const [submitEnquiry, { isLoading }] = useSubmitEnquiryMutation()
  const [successOpen, setSuccessOpen] = useState(false)
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<EnquiryFormValues>({
    resolver: yupResolver(enquirySchema),
    defaultValues: emptyEnquiry,
    mode: 'onSubmit',
  })
  const [requestError, setRequestError] = useState(false)
  const submitting = isLoading || isSubmitting

  const submit = async (values: EnquiryFormValues) => {
    setRequestError(false)
    try {
      await submitEnquiry(values).unwrap()
      reset(emptyEnquiry)
      onClose()
      setSuccessOpen(true)
    } catch {
      setRequestError(true)
    }
  }

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(submit)(event)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={submitting ? undefined : onClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="enquiry-dialog-title"
        className="enquiry-dialog"
      >
        <Box className="enquiry-dialog__heading">
          <div>
            <span className="enquiry-dialog__eyebrow">CONTACT SKITEUP</span>
            <Typography id="enquiry-dialog-title" component="h2">Let’s start a conversation.</Typography>
            <p>Tell us a little about your institution and how we can help.</p>
          </div>
          <IconButton onClick={onClose} disabled={submitting} aria-label="Close enquiry form">
            <CloseRounded />
          </IconButton>
        </Box>
        <DialogContent className="enquiry-dialog__content">
          {requestError && (
            <Alert severity="error" className="enquiry-form__alert">
              Unable to submit your enquiry. Please try again.
            </Alert>
          )}
          <Box component="form" noValidate onSubmit={handleFormSubmit} className="enquiry-form">
            <div className="enquiry-form__grid">
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => <CommonInput {...field} label="Name" placeholder="Enter your name" required fullWidth error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />}
              />
              <Controller
                name="institutionName"
                control={control}
                render={({ field, fieldState }) => <CommonInput {...field} label="Institution Name" placeholder="Enter your institution name" fullWidth error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />}
              />
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => <CommonInput {...field} label="Email Address" placeholder="Enter your email address" type="email" autoComplete="email" required fullWidth error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field, fieldState }) => <CommonInput {...field} label="Phone Number" placeholder="Enter your phone number" type="tel" autoComplete="tel" required fullWidth error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />}
              />
              <Controller
                name="subject"
                control={control}
                render={({ field, fieldState }) => <CommonInput {...field} label="Subject" placeholder="Enter the subject" fullWidth error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />}
              />
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => <CommonInput {...field} label="Description / Enquiry" placeholder="Tell us how we can help you..." required fullWidth multiline minRows={4} maxRows={8} error={Boolean(fieldState.error)} helperText={fieldState.error?.message} />}
              />
            </div>
            <div className="enquiry-form__footer">
              <Typography component="p">Required fields are marked with an asterisk.</Typography>
              <Button type="submit" variant="contained" disabled={submitting} endIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendRounded />}>
                {submitting ? 'Submitting...' : 'Submit Enquiry'}
              </Button>
            </div>
          </Box>
        </DialogContent>
      </Dialog>
      <Snackbar open={successOpen} autoHideDuration={6500} onClose={() => setSuccessOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSuccessOpen(false)}>
          Thank you for contacting SkiteUp. Your enquiry has been submitted successfully. Our team will get back to you soon.
        </Alert>
      </Snackbar>
    </>
  )
}