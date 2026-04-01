import { useAnimatedValue } from '../hooks/useAnimatedValue'

export default function AnimatedMoney({ amount, className, style }) {
  const animated = useAnimatedValue(amount, 500)
  return (
    <span className={className} style={style}>
      ¥{animated.toLocaleString()}
    </span>
  )
}
