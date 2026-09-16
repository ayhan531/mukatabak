import { useReveal } from '../lib/useReveal'

export default function Reveal({ as: Tag = 'div', delay = 0, style, children, ...rest }) {
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'in' : ''}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms', ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
