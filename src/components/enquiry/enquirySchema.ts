import * as yup from 'yup'

export const enquirySchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  institutionName: yup.string().trim().default(''),
  email: yup
    .string()
    .trim()
    .email('Please enter a valid email address')
    .required('Email address is required'),
  phoneNumber: yup.string().trim().required('Phone number is required'),
  subject: yup.string().trim().default(''),
  description: yup.string().trim().required('Description / Enquiry is required'),
})

export type EnquiryFormValues = yup.InferType<typeof enquirySchema>

export const emptyEnquiry: EnquiryFormValues = {
  name: '',
  institutionName: '',
  email: '',
  phoneNumber: '',
  subject: '',
  description: '',
}