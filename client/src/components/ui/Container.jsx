import { cn } from '../../utils/cn'

export default function Container({ className, children, as: Tag = 'div' }) {
  return <Tag className={cn('container-site', className)}>{children}</Tag>
}
