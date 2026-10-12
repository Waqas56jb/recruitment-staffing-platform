import { cn } from '../../utils/cn'
export default function Card({ className, children }) {
  return <div className={cn('card-panel p-5', className)}>{children}</div>
}
