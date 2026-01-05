import { useCallback, type CSSProperties, type Dispatch, type PropsWithChildren, type SetStateAction } from "react"
import "./SideBar.css"

type Side = "left" | "right" | "top" | "bottom"

interface SideBarProps extends PropsWithChildren {
    size?: string
    side?: Side
    background?: string
    hasLabel?: boolean
    isOpen: boolean,
    setIsOpen?: Dispatch<SetStateAction<boolean>>
}

function SideBar({
    size,
    side = "left",
    background = "linear-gradient(120deg, #2c3e50, #a6fbe4)",
    hasLabel = true,
    isOpen,
    setIsOpen = () => { },
    children
}: SideBarProps) {
    const toggleSideBar = useCallback(() => {
        setIsOpen(prev => !prev)
    }, [])

    const side2Style = () => {
        switch (side) {
            case "left":
                return {
                    left: 0,
                    top: 0,
                    width: `${size !== undefined ? size : "240px"}`,
                    height: "100vh",
                    transform: "translateX(-100%)"
                }
            case "right":
                return {
                    right: 0,
                    top: 0,
                    width: `${size !== undefined ? size : "240px"}`,
                    height: "100vh",
                    transform: "translateX(100%)"
                }
            case "top":
                return {
                    left: 0,
                    top: 0,
                    width: "100vw",
                    height: `${size !== undefined ? size : "80px"}`,
                    transform: "translateY(-100%)"
                }
            case "bottom":
                return {
                    left: 0,
                    bottom: 0,
                    width: "100vw",
                    height: `${size !== undefined ? size : "80px"}`,
                    transform: "translateY(100%)"
                }
        }
    }
    const sidebarStyle = {
        background: background,

        ...side2Style()
    } as CSSProperties

    return (
        <>
            {
                hasLabel && (
                    <label
                        className={`toggle-btn ${isOpen ? "toggle-btn-open" : ""}`}
                        onClick={toggleSideBar}
                    >
                        {isOpen ? "X" : "☰"}
                    </label>
                )
            }
            <div
                className="sidebar"
                style={
                    {
                        ...sidebarStyle,
                        ...(
                            isOpen && {
                                transform: "translateX(0) translateY(0)"
                            }
                        )
                    }
                }
            >
            {children}
        </div >
        </>
    )
}

export default SideBar