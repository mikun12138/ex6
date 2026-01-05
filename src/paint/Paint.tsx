import { useCallback, useEffect, useRef, useState } from "react"
import SideBar from "../widgets/Sidebar"
import ColorPicker from "./toolbar/ColorPicker"
import { color2string, hsv2Hsl, type HsvColor } from "../utils/color/ColorUtils"
import Button from "../widgets/Button"
import { mikuSounds } from "../assets/sounds"
import "./Paint.css"
import onion_image from "../assets/onion.png"
import miku_image from "../assets/miku.png"
import bread_image from "../assets/bread.png"
import teto_image from "../assets/teto.png"
import { INDEX_TO_CONFIG, KEY_MAP, type KeyConfig, type MusicKeyEffect } from "./MusicEffects"

function Paint() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [color, setColor] = useState<HsvColor>({ h: 0, s: 100, v: 100 })

    let isDrawing = false
    let drawingArr: number[][] = []

    const [drawTip, setDrawTip] = useState(true)

    useEffect(() => {
        if (drawTip) {
            return
        }
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [drawTip])

    let handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()

        if (drawTip) {
            setDrawTip(false)
        }

        isDrawing = true
        drawingArr = []

    }, [isDrawing, color])

    let handleMouseMove = useCallback((e: React.MouseEvent) => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        if (isDrawing) {
            const rect = canvas.getBoundingClientRect()
            const scaleX = canvas.width / rect.width
            const scaleY = canvas.height / rect.height
            const y = (e.clientY - rect.top) * scaleX
            const x = (e.clientX - rect.left) * scaleY

            drawingArr.push([x, y])

            ctx.lineJoin = "round"
            ctx.lineWidth = 5
            ctx.strokeStyle = color2string(hsv2Hsl(color))
            ctx.beginPath()
            drawingArr.length > 1 && ctx.moveTo(drawingArr[drawingArr.length - 2][0], drawingArr[drawingArr.length - 2][1])
            ctx.lineTo(drawingArr[drawingArr.length - 1][0], drawingArr[drawingArr.length - 1][1])
            ctx.closePath()
            ctx.stroke()
        }

    }, [isDrawing, color])

    let handleMouseUp = useCallback((_: React.MouseEvent) => {
        isDrawing = false
    }, [isDrawing, color])

    /**
     * music
     */

    const activeEffects = useRef<MusicKeyEffect[]>([])

    const [jumpingStates, setJumpingStates] = useState<Record<number, boolean>>({})

    const playNote = useCallback((keyConfig: KeyConfig) => {
        setDrawTip(false)
        setJumpingStates(prev => ({ ...prev, [keyConfig.index]: true }))

        const soundName = `${keyConfig.index}.mp3`
        const audio = new Audio(mikuSounds[soundName as keyof typeof mikuSounds])
        audio.play().catch(err => console.error(err))

        if (keyConfig.effect != null) {
            activeEffects.current.push(keyConfig.effect())
        }

    }, [color])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase()
            if (KEY_MAP.hasOwnProperty(key)) {
                playNote(KEY_MAP[key])
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [playNote])

    useEffect(() => {
        const canvas = canvasRef.current!!
        const ctx = canvas.getContext("2d")!!

        const render = () => {
            activeEffects.current = activeEffects.current.filter(effect => {
                ctx.fillStyle = "rgba(255, 255, 255, 0.02)"
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                return effect.draw(ctx)
            })

            requestAnimationFrame(render)
        }

        const animationId = requestAnimationFrame(render)
        return () => cancelAnimationFrame(animationId)
    }, [])


    const musicKeys = (() => {
        let result = []
        const xValues = [-40, -30, -20, -10, 10, 20, 30, 40]
        const yValues = [-36, -12, 12, 36]

        let index = 0
        for (let j = 0; j < yValues.length; j++) {
            for (let i = 0; i < xValues.length; i++) {
                const currentIndex = index
                const x = xValues[i]
                const y = yValues[j]

                result.push(
                    <Button
                        key={currentIndex}
                        style={{
                            backgroundImage: `url(${(() => {
                                    if (index < 8) {
                                        return onion_image
                                    } else if (index < 16) {
                                        return miku_image
                                    } else if (index < 24) {
                                        return bread_image
                                    } else if (index < 32) {
                                        return teto_image
                                    }
                                })()
                                })`,
                            backgroundSize: 'auto 100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: "center"
                        }}
                        className={`jumpable ${jumpingStates[currentIndex] ? "jumping" : ""}`}
                        x={x}
                        y={y}
                        width={9}
                        height={21}
                        onClick={() => playNote(INDEX_TO_CONFIG[currentIndex])}
                        onAnimationEnd={() => {
                            setJumpingStates(prev => ({ ...prev, [currentIndex]: false }))
                        }}
                    />
                )
                index++
            }
        }
        return result
    })()


    return (
        <>
            <div
                style={{
                    position: "relative",
                    maxWidth: "100%",
                    maxHeight: "80vh",

                    backgroundColor: "#d4d4d4ff",

                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    width={1920} height={1080}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "80vh",
                        border: "1px solid #9c9c9cff",
                    }}>
                </canvas>
                {drawTip && (
                    <div
                        style={{
                            position: "absolute",
                            color: "black",
                            fontSize: "32px",
                            pointerEvents: "none",
                            userSelect: "none",
                        }}
                    >
                        Draw SomeThing Here...
                    </div>
                )}
            </div>

            <SideBar
                size={"20vh"}
                side={"bottom"}
                background={"linear-gradient(120deg, #2f3f4fff, #555555ff)"}
                hasLabel={false}
                isOpen={true}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "1px solid #5e5e5eff",
                        padding: "20px"
                    }}
                >
                    <ColorPicker
                        size={200}
                        color={color}
                        setColor={setColor}
                    >
                    </ColorPicker>
                </div>
                {musicKeys}
            </SideBar>
        </>
    )
}

export default Paint