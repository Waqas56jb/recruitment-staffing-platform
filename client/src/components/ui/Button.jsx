import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  secondary: 'bg-white text-ink border border-line hover:bg-cream',
  outline: 'border border-current bg-transparent hover:bg-black/5',
  dark: 'bg-ink text-white hover:bg-ink-soft',
  ghost: 'bg-transparent text-ink hover:bg-black/5',
  lightOutline: 'border border-white/40 text-white hover:bg-white hover:text-ink',
}

const sizes = {
  sm: 'min-h-9 px-3.5 py-2 text-sm',
  md: 'min-h-10 px-4 py-2.5 text-sm',
  lg: 'min-h-11 px-5 py-3 text-base',
}

export default function Button({
  as = 'button',
  to,
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  type = 'button',
  ...props
}) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-md font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    sizes[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  if (href || as === 'a') {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  )
}
