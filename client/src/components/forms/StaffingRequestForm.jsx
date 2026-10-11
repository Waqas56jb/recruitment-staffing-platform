import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { siteConfig } from '../../config/site'
import { industries } from '../../data/industries'
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
  companyName: '',
  contactName: '',
  businessEmail: '',
  phone: '',
  website: '',
  industry: '',
  jobRoles: '',
  headcount: '',
  skills: '',
  qualifications: '',
  experience: '',
  location: '',
  employmentType: '',
  startDate: '',
  duration: '',
  hours: '',
  payRange: '',
  additional: '',
  privacy: false,
}

export default function StaffingRequestForm() {
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
      companyName: required(values.companyName, 'Company name is required'),
      contactName: required(values.contactName, 'Contact name is required'),
      businessEmail:
        required(values.businessEmail, 'Business email is required') ||
        emailRule(values.businessEmail),
      phone: optionalPhone(values.phone),
      industry: required(values.industry, 'Select an industry'),
      jobRoles: required(values.jobRoles, 'Describe the required roles'),
      headcount: required(values.headcount, 'Enter the number of employees'),
      location: required(values.location, 'Work location is required'),
      employmentType: required(values.employmentType, 'Select employment type'),
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
    await new Promise((resolve) => setTimeout(resolve, 900))
    setSubmitting(false)
    setSubmitted(true)
    reset(defaults)
    push({
      title: 'Request captured locally',
      message: siteConfig.forms.demoNotice,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="form-panel"
    >
      <div className="mb-6 border-b border-line pb-5 sm:mb-8 sm:pb-6">
        <p className="eyebrow text-accent">Staffing request</p>
        <h3 className="mt-2 display-md">Tell us what you need</h3>
        <p className="mt-2 max-w-3xl text-sm text-muted sm:mt-3">{siteConfig.forms.demoNotice}</p>
      </div>

      <div className="form-grid">
        <FormField id="companyName" label="Company name" required error={errors.companyName?.message}>
          <FormInput id="companyName" autoComplete="organization" error={errors.companyName} {...register('companyName')} />
        </FormField>
        <FormField id="contactName" label="Contact name" required error={errors.contactName?.message}>
          <FormInput id="contactName" autoComplete="name" error={errors.contactName} {...register('contactName')} />
        </FormField>
        <FormField id="businessEmail" label="Business email" required error={errors.businessEmail?.message}>
          <FormInput id="businessEmail" type="email" autoComplete="email" error={errors.businessEmail} {...register('businessEmail')} />
        </FormField>
        <FormField id="phone" label="Phone number" error={errors.phone?.message}>
          <FormInput id="phone" type="tel" autoComplete="tel" error={errors.phone} {...register('phone')} />
        </FormField>
        <FormField id="website" label="Company website">
          <FormInput id="website" type="url" inputMode="url" placeholder="https://" {...register('website')} />
        </FormField>
        <FormField id="industry" label="Industry" required error={errors.industry?.message}>
          <FormSelect id="industry" error={errors.industry} {...register('industry')}>
            <option value="">Select industry</option>
            {industries.map((item) => (
              <option key={item.id} value={item.title}>
                {item.title}
              </option>
            ))}
            <option value="Other">Other</option>
          </FormSelect>
        </FormField>
        <FormField id="jobRoles" label="Required job roles" required error={errors.jobRoles?.message} className="sm:col-span-2 xl:col-span-3">
          <FormTextarea id="jobRoles" rows={3} error={errors.jobRoles} {...register('jobRoles')} />
        </FormField>
        <FormField id="headcount" label="Number of employees" required error={errors.headcount?.message}>
          <FormInput id="headcount" inputMode="numeric" error={errors.headcount} {...register('headcount')} />
        </FormField>
        <FormField id="employmentType" label="Employment type" required error={errors.employmentType?.message}>
          <FormSelect id="employmentType" error={errors.employmentType} {...register('employmentType')}>
            <option value="">Select type</option>
            <option>Temporary</option>
            <option>Permanent</option>
            <option>Contract</option>
            <option>Mixed / unsure</option>
          </FormSelect>
        </FormField>
        <FormField id="location" label="Work location" required error={errors.location?.message}>
          <FormInput id="location" error={errors.location} {...register('location')} />
        </FormField>
        <FormField id="skills" label="Skills" className="sm:col-span-2 xl:col-span-3">
          <FormTextarea id="skills" rows={3} {...register('skills')} />
        </FormField>
        <FormField id="qualifications" label="Qualifications">
          <FormInput id="qualifications" {...register('qualifications')} />
        </FormField>
        <FormField id="experience" label="Experience">
          <FormInput id="experience" {...register('experience')} />
        </FormField>
        <FormField id="startDate" label="Start date">
          <FormInput id="startDate" type="date" {...register('startDate')} />
        </FormField>
        <FormField id="duration" label="Expected duration">
          <FormInput id="duration" {...register('duration')} />
        </FormField>
        <FormField id="hours" label="Working hours or shifts">
          <FormInput id="hours" {...register('hours')} />
        </FormField>
        <FormField id="payRange" label="Optional pay range">
          <FormInput id="payRange" {...register('payRange')} />
        </FormField>
        <FormField id="additional" label="Additional requirements" className="sm:col-span-2 xl:col-span-3">
          <FormTextarea id="additional" rows={3} {...register('additional')} />
        </FormField>
      </div>

      <div className="mt-6 space-y-5 border-t border-line pt-6 sm:mt-8">
        <FormCheckbox
          id="privacy"
          label="I consent to Staffora processing this information to respond to my staffing enquiry. I understand this demo does not transmit data to a server."
          error={errors.privacy?.message}
          {...register('privacy')}
        />
        <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
          <Button type="submit" disabled={submitting} className="w-full xs:w-auto">
            {submitting ? 'Submitting…' : 'Submit staffing request'}
          </Button>
          {submitting ? <LoadingSpinner label="Validating locally" /> : null}
        </div>
        {submitted ? (
          <p className="rounded-lg bg-paper px-4 py-3 text-sm text-muted" role="status">
            Form validated successfully in your browser. No enquiry was sent or stored remotely.
          </p>
        ) : null}
      </div>
    </form>
  )
}
