import type { PropsWithChildren } from "react"
import "./Overlay.css"

interface OverlayProps extends PropsWithChildren {
    isOverlaying: boolean
}

function Overlay({ isOverlaying }: OverlayProps) {
    return (
        <>
            <div className={`overlay ${isOverlaying ? "overlay-overlaying" : ""}`}></div>
        </>
    )
}

export default Overlay