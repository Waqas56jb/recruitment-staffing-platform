import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '@staffora/api'
import { useI18n } from '../../i18n'
import { siteConfig } from '../../config/site'
import {
  collectErrors,
  CV_ACCEPT,
  CV_MAX_BYTES,
  email as emailRule,
  optionalPhone,
  required,
  validateCvFile,
} from '../../utils/validation'
import Button from '../ui/Button'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useToast } from '../ui/Toast'
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from './FormControls'
import FormField from './FormField'

const defaults = {
  fullName: '',
  email: '',
  phone: '',
  preferredRole: '',
  preferredLocation: '',
  employmentType: '',
  experience: '',
  skills: '',
  qualifications: '',
  introduction: '',
  privacy: false,
}

export default function CandidateInterestForm() {
  const { push } = useToast()
  const { t } = useI18n()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [cvFile, setCvFile] = useState(null)
  const [cvError, setCvError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({ defaultValues: defaults })

  const onSubmit = async (values) => {
    const fileError = validateCvFile(cvFile)
    setCvError(fileError)

    const nextErrors = collectErrors({
      fullName: required(values.fullName, 'Full name is required'),
      email: required(values.email, 'Email is required') || emailRule(values.email),
      phone: optionalPhone(values.phone),
      preferredRole: required(values.preferredRole, 'Preferred role is required'),
      preferredLocation: required(values.preferredLocation, 'Preferred location is required'),
      employmentType: required(values.employmentType, 'Select employment type'),
      privacy: required(values.privacy, 'Privacy consent is required'),
    })

    clearErrors()
    const keys = Object.keys(nextErrors)
    if (keys.length || fileError) {
      keys.forEach((key) => setError(key, { type: 'manual', message: nextErrors[key] }))
      push({
        tone: 'error',
        title: t('Check the form'),
        message: t('Please correct the highlighted fields.'),
      })
      return
    }

    setSubmitting(true)
    try {
      await api('/api/public/candidate-interest', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          cvFileName: cvFile?.name || '',
          cvSizeLabel: cvFile ? `${Math.ceil(cvFile.size / 1024)} KB` : '',
        }),
      })
      setSubmitted(true)
      reset(defaults)
      setCvFile(null)
      push({ title: t('Interest saved'), message: t('The team can see your details. The CV file itself stays on this device.') })
    } catch (error) {
      push({ tone: 'error', title: t('Could not submit'), message: t(error.message) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="form-panel"
    >
      <div className="mb-6 border-b border-line pb-5 sm:mb-8 sm:pb-6">
        <p className="eyebrow text-accent">{t('Expression of interest')}</p>
        <h3 className="mt-2 display-md">{t('Tell us about you')}</h3>
        <p className="mt-2 text-sm text-muted sm:mt-3">{t(siteConfig.forms.cvNote)}</p>
      </div>

      <div className="form-grid">
        <FormField id="fullName" label="Full name" required error={errors.fullName?.message}>
          <FormInput id="fullName" autoComplete="name" error={errors.fullName} {...register('fullName')} />
        </FormField>
        <FormField id="email" label="Email" required error={errors.email?.message}>
          <FormInput id="email" type="email" autoComplete="email" error={errors.email} {...register('email')} />
        </FormField>
        <FormField id="phone" label="Phone (optional)" error={errors.phone?.message}>
          <FormInput id="phone" type="tel" autoComplete="tel" error={errors.phone} {...register('phone')} />
        </FormField>
        <FormField id="preferredRole" label="Preferred role" required error={errors.preferredRole?.message}>
          <FormInput id="preferredRole" error={errors.preferredRole} {...register('preferredRole')} />
        </FormField>
        <FormField id="preferredLocation" label="Preferred location" required error={errors.preferredLocation?.message}>
          <FormInput id="preferredLocation" error={errors.preferredLocation} {...register('preferredLocation')} />
        </FormField>
        <FormField id="employmentType" label="Employment type" required error={errors.employmentType?.message}>
          <FormSelect id="employmentType" error={errors.employmentType} {...register('employmentType')}>
            <option value="">{t('Select type')}</option>
            <option value="Temporary">{t('Temporary')}</option>
            <option value="Permanent">{t('Permanent')}</option>
            <option value="Contract">{t('Contract')}</option>
            <option value="Open to all">{t('Open to all')}</option>
          </FormSelect>
        </FormField>
        <FormField id="experience" label="Experience" className="sm:col-span-2 xl:col-span-3">
          <FormTextarea id="experience" rows={3} {...register('experience')} />
        </FormField>
        <FormField id="skills" label="Skills" className="sm:col-span-2 xl:col-span-3">
          <FormTextarea id="skills" rows={3} {...register('skills')} />
        </FormField>
        <FormField id="qualifications" label="Qualifications" className="sm:col-span-2 xl:col-span-3">
          <FormInput id="qualifications" {...register('qualifications')} />
        </FormField>
        <FormField id="introduction" label="Short introduction" className="sm:col-span-2 xl:col-span-3">
          <FormTextarea id="introduction" rows={3} {...register('introduction')} />
        </FormField>
        <FormField
          id="cv"
          label="CV upload"
          hint={`${t('Accepted: PDF or Word. Max {size}MB.', { size: Math.round(CV_MAX_BYTES / (1024 * 1024)) })} ${t(siteConfig.forms.cvNote)}`}
          error={cvError}
          className="sm:col-span-2 xl:col-span-3"
        >
          <input
            id="cv"
            type="file"
            accept={CV_ACCEPT.join(',')}
            className="input-field file:mr-4 file:rounded file:border-0 file:bg-ink file:px-3 file:py-2 file:font-display file:text-sm file:font-semibold file:tracking-normal file:text-cream"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setCvFile(file)
              setCvError(validateCvFile(file))
            }}
          />
        </FormField>
      </div>

      <div className="mt-6 space-y-5 border-t border-line pt-6 sm:mt-8">
        <FormCheckbox
          id="candidate-privacy"
          label="I consent to Staffora storing this interest. The CV file name is saved; the file itself stays on this device."
          error={errors.privacy?.message}
          {...register('privacy')}
        />
        <div className="flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center">
          <Button type="submit" disabled={submitting} className="w-full xs:w-auto">
            {submitting ? t('Submitting…') : t('Submit interest')}
          </Button>
          {submitting ? <LoadingSpinner label={t('Submitting')} /> : null}
        </div>
        {submitted ? (
          <p className="rounded-lg bg-paper px-4 py-3 text-sm text-muted" role="status">
            {t('Interest saved. Create an account if you want to apply to published roles.')}
          </p>
        ) : null}
      </div>
    </form>
  )
}
