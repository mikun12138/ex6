import { useCallback, useEffect, useRef, useState } from "react"
import SideBar from "../widgets/Sidebar"
import ColorPicker from "./toolbar/ColorPicker"
import { color2string, hsv2Hsl, type HsvColor } from "../utils/color/ColorUtils"
import Button from "../widgets/Button"
import { mikuSounds } from "../assets/sounds"
import "./Paint.css"
import miku_cong_image from "../assets/1.png"

type DrawingMode = "tap" | "pen"

function Paint() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const [color, setColor] = useState<HsvColor>({ h: 0, s: 100, v: 100 })

    let isDrawing = false
    let drawingArr: number[][] = []

    const [drawTip, setDrawTip] = useState(true)

    const [drawingMode, _] = useState<DrawingMode>("pen")

    useEffect(() => {
        if (drawTip === true) {
            return
        }
        const canvas = canvasRef.current!

        const ctx = canvas.getContext("2d")!

        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }, [drawTip])

    let handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()

        switch (drawingMode) {
            case "pen": {
                if (drawTip === true) {
                    setDrawTip(false)
                }
                isDrawing = true
                drawingArr = []
            }
        }

    }, [drawingMode, isDrawing, color])

    let handleMouseMove = useCallback((e: React.MouseEvent) => {

        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        switch (drawingMode) {
            case "pen": {
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
            }
        }

    }, [drawingMode, isDrawing, color])

    let handleMouseUp = useCallback((_: React.MouseEvent) => {
        switch (drawingMode) {
            case "pen": {
                isDrawing = false
            }
        }
    }, [drawingMode, isDrawing, color])

    let musicKeys = (function () {
        let result = []
        let index = 0
        for (const x of [-40, -30, -20, -10, 10, 20, 30, 40]) {
            for (const y of [-36, -12, 12, 36]) {
                const [isJumping, setIsJumping] = useState(false)
                const currentIndex = index;

                result.push(
                    <Button
                        style={{
                            backgroundImage: `url(${miku_cong_image})`,
                            backgroundSize: 'auto 100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: "center"
                        }}
                        className={`jumpable ${isJumping ? "jumping" : ""}`}
                        x={x}
                        y={y}
                        width={9}
                        height={21}
                        onClick={() => {
                            setDrawTip(false)
                            setIsJumping(true)

                            let soundName = `${currentIndex}.mp3`

                            new Audio(mikuSounds[soundName as keyof typeof mikuSounds]).play()
                                .catch(err => console.error(`Failed to play sound: ${soundName}`, err))
                        }}
                        onAnimationEnd={() => setIsJumping(false)}
                    >
                    </Button>
                )
                index += 1
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