export function OverlayLayer(props: { children?: React.ReactNode }) {
  const { children } = props

  return (
    <div
      data-testid="overlay-layer"
      aria-label="Overlay layer"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  )
}
