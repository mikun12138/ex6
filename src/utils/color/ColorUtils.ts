export interface HsvColor {
    h: number
    s: number
    v: number
}

export interface HslColor {
    h: number
    s: number
    l: number
}

export interface RgbColor {
    r: number
    g: number
    b: number
}

export function hsv2Hsl({ h, s, v }: HsvColor): HslColor {
    s /= 100
    v /= 100

    const l = v * (1 - s / 2)

    const s_hsl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l)

    return {
        h: h,
        s: s_hsl * 100,
        l: l * 100
    }
}

export function color2string({h, s, l}: HslColor) {
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`
}
