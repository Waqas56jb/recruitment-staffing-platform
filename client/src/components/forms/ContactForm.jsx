import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { siteConfig } from '../../config/site'
import {
  collectErrors,
  email as emailRule,
  optionalPhone,
  required,
} from '../../utils/validation'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useToast } from '../ui/Toast'
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from './FormControls'
import FormField from './FormField'

const defaults = {
  name: '',
  email: '',
  phone: '',
  enquiryType: '',
  subject: '',
  message: '',
  privacy: false,
}

export default function ContactForm() {
  const { push } = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({ defaultValues: defaults })

  const onSubmit = async (values) => {
    const nextErrors = collectErrors({
      name: required(values.name, 'Name is required'),
      email: required(values.email, 'Email is required') || emailRule(values.email),
      phone: optionalPhone(values.phone),
      enquiryType: required(values.enquiryType, 'Select an enquiry type'),
      subject: required(values.subject, 'Subject is required'),
      message: required(values.message, 'Message is required'),
      privacy: required(values.privacy, 'Privacy consent is required'),
    })

    clearErrors()
    const keys = Object.keys(nextErrors)
    if (keys.length) {
      keys.forEach((key) => setError(key, { type: 'manual', message: nextErrors[key] }))
      push({
        tone: 'error',
        title: 'Check the form',
        message: 'Please correct the highlighted fields.',
      })
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    setSubmitted(true)
    reset(defaults)
    push({
      title: 'Message captured locally',
      message: siteConfig.forms.demoNotice,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="form-panel"
    >
      <p className="mb-5 text-sm text-muted sm:mb-6">{siteConfig.forms.demoNotice}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <FormField id="name" label="Name" required error={errors.name?.message}>
          <FormInput id="name" autoComplete="name" error={errors.name} {...register('name')} />
        </FormField>
        <FormField id="email" label="Email" required error={errors.email?.message}>
          <FormInput id="email" type="email" autoComplete="email" error={errors.email} {...register('email')} />
        </FormField>
        <FormField id="phone" label="Phone (optional)" error={errors.phone?.message}>
          <FormInput id="phone" type="tel" autoComplete="tel" error={errors.phone} {...register('phone')} />
        </FormField>
        <FormField id="enquiryType" label="Enquiry type" required error={errors.enquiryType?.message}>
          <FormSelect id="enquiryType" error={errors.enquiryType} {...register('enquiryType')}>
            <option value="">Select type</option>
            <option>Employer staffing request</option>
            <option>Candidate enquiry</option>
            <option>Partnership</option>
            <option>General</option>
          </FormSelect>
        </FormField>
        <FormField id="subject" label="Subject" required error={errors.subject?.message} className="sm:col-span-2">
          <FormInput id="subject" error={errors.subject} {...register('subject')} />
        </FormField>
        <FormField id="message" label="Message" required error={errors.message?.message} className="sm:col-span-2">
          <FormTextarea id="message" rows={5} error={errors.message} {...register('message')} />
        </FormField>
      </div>
      <div className="mt-6 space-y-5 border-t border-line pt-6">
        <FormCheckbox
          id="contact-privacy"
          label="I consent to Staffora processing this enquiry. I understand this demo does not transmit data to a server."
          error={errors.privacy?.message}
          {...register('privacy')}
        />
        <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
          <Button type="submit" disabled={submitting} className="w-full xs:w-auto">
            {submitting ? 'Sending…' : 'Send message'}
          </Button>
          {submitting ? <LoadingSpinner /> : null}
        </div>
        {submitted ? (
          <p className="rounded-lg bg-paper px-4 py-3 text-sm text-muted" role="status">
            Message validated locally. No enquiry was sent or stored remotely.
          </p>
        ) : null}
      </div>
    </form>
  )
}
