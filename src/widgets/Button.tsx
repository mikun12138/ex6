import type { CSSProperties, PropsWithChildren } from "react"
import "./Button.css"

interface ButtonProps extends PropsWithChildren {
    x: number,
    y: number,
    width: number,
    height: number,
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    className?: string
    style?: React.CSSProperties
    onAnimationEnd?: () => void
}

function Button(
    {x, y, width, height, onClick, onAnimationEnd, children, className, style }: ButtonProps
) {
    const finalStyle = {
        "--x": `${x}%`,
        "--y": `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        ...style
    } as CSSProperties

    return (
        <>
            <button className={`btn btn-basic ${className}`}
                style={finalStyle}
                onClick={onClick}
                onAnimationEnd={onAnimationEnd}
            >
                {children}
            </button>
        </>
    )
}

export default Button