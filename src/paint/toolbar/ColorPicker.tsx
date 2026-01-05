import React, { useState, useRef, useEffect, useCallback, type PropsWithChildren, type SetStateAction, type Dispatch } from 'react'

import { hsv2Hsl, type HsvColor } from '../../utils/color/ColorUtils'

interface ColorPickerProps extends PropsWithChildren {
    size: number,
    color: HsvColor,
    setColor: Dispatch<SetStateAction<HsvColor>>
}

type Focus = "h" | "sv" | ""

function ColorPicker({ size, color, setColor }: ColorPickerProps) {
    const CENTER = size / 2
    const RADIUS_OUTSIDE = size / 2
    const RADIUS_INSIDE = RADIUS_OUTSIDE * 0.8
    const SQUARE_RADIUS = RADIUS_INSIDE / Math.sqrt(2)

    const H_TIP_RADIUS = size * 0.02
    const SV_TIP_RADIUS = size * 0.015

    const [focus, setFocus] = useState<Focus>("")
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const getHslStringFromHsv = (h: number, s: number, v: number) => {
        const { h: h_hsl, s: s_hsl, l: l_hsl } =
            hsv2Hsl(
                {
                    h: h,
                    s: s,
                    v: v,
                }
            )
        return `hsl(${Math.round(h_hsl)}, ${Math.round(s_hsl)}%, ${Math.round(l_hsl)}%)`
    };

    const drawCurrentColor = useCallback(() => {
        const canvas = canvasRef.current!

        const ctx = canvas.getContext('2d')!

        ctx.save()
        {
            ctx.fillStyle = getHslStringFromHsv(color.h, color.s, color.v)
            const w = size * 0.1
            const h = size * 0.1
            const x = CENTER * 0.05
            const y = size - CENTER * 0.05 - h
            ctx.fillRect(x, y, w, h)
        }
        ctx.restore()
    }, [color])

    const drawColorWheel = useCallback(() => {
        const canvas = canvasRef.current!

        const ctx = canvas.getContext('2d')!

        function drawH() {
            const ringWidth = RADIUS_OUTSIDE - RADIUS_INSIDE

            ctx.lineWidth = ringWidth

            for (let i = 0; i < 360; i++) {
                const startAngle = (i - 1) * Math.PI / 180
                const endAngle = i * Math.PI / 180

                const pixelColor = getHslStringFromHsv(i + 150, 100, 100)
                ctx.strokeStyle = pixelColor

                ctx.save()
                {
                    ctx.beginPath()

                    const drawRadius = RADIUS_INSIDE + ringWidth / 2

                    ctx.arc(
                        CENTER,
                        CENTER,
                        drawRadius,
                        startAngle,
                        endAngle,
                        false
                    )
                    ctx.stroke()
                }
                ctx.restore()
            }
        }

        function drawSV() {
            const start = Math.round(CENTER - SQUARE_RADIUS)
            const end = Math.round(CENTER + SQUARE_RADIUS)
            for (let x = start; x < end; x++) {
                for (let y = start; y < end; y++) {
                    const pixelColor = getHslStringFromHsv(
                        color.h,
                        100 * ((x - CENTER) / (SQUARE_RADIUS * 2) + 0.5),
                        100 * (0.5 - (y - CENTER) / (SQUARE_RADIUS * 2)),
                    )
                    ctx.save()
                    {
                        ctx.fillStyle = pixelColor
                        ctx.fillRect(x, y, 1, 1)
                    }
                    ctx.restore()
                }
            }
        }

        // 小圆tip
        function drawTips() {
            {
                const ringWidth = RADIUS_OUTSIDE - RADIUS_INSIDE
                const indicatorRadius = RADIUS_INSIDE + ringWidth / 2

                let indicatorAngleRad = (color.h - 150) * Math.PI / 180

                const x = CENTER + indicatorRadius * Math.cos(indicatorAngleRad)
                const y = CENTER + indicatorRadius * Math.sin(indicatorAngleRad)

                ctx.save()
                {
                    ctx.beginPath()

                    ctx.arc(x, y, H_TIP_RADIUS, 0, Math.PI * 2, false)

                    ctx.fillStyle = getHslStringFromHsv(color.h, color.s, color.v)
                    ctx.strokeStyle = "#fff"
                    ctx.lineWidth = 2

                    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
                    ctx.shadowBlur = 3

                    ctx.fill()
                    ctx.stroke()
                }
                ctx.restore()
            }
            {
                const x = CENTER - SQUARE_RADIUS + (color.s / 100) * (SQUARE_RADIUS * 2)
                const y = CENTER + SQUARE_RADIUS - (color.v / 100) * (SQUARE_RADIUS * 2)
                ctx.save()
                {
                    ctx.beginPath()

                    ctx.arc(x, y, SV_TIP_RADIUS, 0, Math.PI * 2, false)
                    ctx.fillStyle = getHslStringFromHsv(color.h, color.s, color.v)
                    ctx.strokeStyle = "#fff"
                    ctx.lineWidth = 2

                    ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
                    ctx.shadowBlur = 3

                    ctx.fill()
                    ctx.stroke()
                }
                ctx.restore()
            }
        }

        ctx.clearRect(0, 0, size, size);

        drawH()
        drawSV()
        drawTips()

    }, [color])

    useEffect(() => {
        drawColorWheel()
    }, [drawColorWheel])

    useEffect(() => {
        drawCurrentColor()
    }, [color])

    const calHSV = useCallback((clientX: number, clientY: number) => {
        const canvas = canvasRef.current!

        const rect = canvas.getBoundingClientRect()

        const x = clientX - rect.left - CENTER
        const y = clientY - rect.top - CENTER

        function calH() {
            let h = Math.atan2(y, x) * 180 / Math.PI
            h = h + 150
            h = (h % 360 + 360) % 360

            return h
        }

        function calSV() {
            let s = 100 * (x / (SQUARE_RADIUS * 2) + 0.5)
            let v = 100 * (0.5 - y / (SQUARE_RADIUS * 2))

            s = Math.min(100, Math.max(0, s))
            v = Math.min(100, Math.max(0, v))

            return {
                s: s,
                v: v
            }
        }

        const h = (focus === "h") ? calH() : undefined
        const sv = (focus === "sv") ? calSV() : undefined

        return {
            ...(h && {
                h: h,
            }),
            ...(sv && {
                s: sv.s,
                v: sv.v,
            })
        }
    }, [focus])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        const canvas = canvasRef.current!

        const rect = canvas.getBoundingClientRect()

        const x = e.clientX - rect.left - CENTER
        const y = e.clientY - rect.top - CENTER

        const dist = Math.sqrt(x * x + y * y)

        if (dist > RADIUS_INSIDE) {
            setFocus("h")
        } else if (
            x >= -SQUARE_RADIUS
            && x <= SQUARE_RADIUS
            && y >= -SQUARE_RADIUS
            && y <= SQUARE_RADIUS
        ) {
            setFocus("sv")
        }

        const newHSV = calHSV(e.clientX, e.clientY)

        if (newHSV) {
            setColor(prev => ({
                ...prev,
                ...(newHSV.h && { h: newHSV.h }),
                ...(newHSV.s && { s: newHSV.s }),
                ...(newHSV.v && { v: newHSV.v }),
            }))
        }
    }, [focus, calHSV])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (focus === "") return

        const newHSV = calHSV(e.clientX, e.clientY)

        setColor(prev => ({
            ...prev,
            ...("h" in newHSV && { h: newHSV.h }),
            ...("s" in newHSV && { s: newHSV.s }),
            ...("v" in newHSV && { v: newHSV.v }),
        }))

    }, [focus, calHSV])

    const handleMouseUp = useCallback(() => {
        setFocus("")
    }, [focus, calHSV])


    useEffect(() => {
        if (focus !== "") {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [focus, handleMouseMove])

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                onMouseDown={handleMouseDown}
                style={{
                    cursor: 'crosshair',
                }}
            />
        </div>
    )
}

export default ColorPicker