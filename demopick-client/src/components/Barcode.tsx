import React, { useEffect, useRef } from 'react'
import JsBarcode from 'jsbarcode'

export interface BarcodeProps {
  value: string
  format?: 'CODE128' | 'CODE39' | 'EAN13'
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  background?: string
  lineColor?: string
  margin?: number
  className?: string
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  format = 'CODE128',
  width = 1.8,
  height = 50,
  displayValue = true,
  fontSize = 13,
  background = '#ffffff',
  lineColor = '#0f172a',
  margin = 8,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current || !value) return

    try {
      JsBarcode(svgRef.current, value, {
        format,
        width,
        height,
        displayValue,
        fontSize,
        background,
        lineColor,
        margin,
        font: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        textMargin: 6,
        flat: true,
      })
    } catch (err) {
      console.warn('JsBarcode generation error for value:', value, err)
    }
  }, [value, format, width, height, displayValue, fontSize, background, lineColor, margin])

  if (!value) return null

  return (
    <svg
      ref={svgRef}
      className={`max-w-full h-auto inline-block rounded-md ${className}`}
      aria-label={`Barcode ${value}`}
    />
  )
}

export default Barcode
