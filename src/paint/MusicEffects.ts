import onion_image from "../assets/onion.png"
import miku_image from "../assets/miku.png"
import bread_image from "../assets/bread.png"
import teto_image from "../assets/teto.png"
import { random } from "../utils/Math"

export type KeyConfig = {
    index: number
    effect?: () => MusicKeyEffect
}
export interface MusicKeyEffect {
    draw(ctx: CanvasRenderingContext2D): boolean
}

class SlideImageEffect implements MusicKeyEffect {
    private image: HTMLImageElement
    private progress: number = 0
    private speed: number = 0.03
    private sizePercent: number = 0.15
    private yPercent: number
    private targetXPercent: number
    private startXPercent: number = -0.2

    private isActive: boolean = true

    constructor(image: HTMLImageElement) {
        this.image = image
        this.yPercent = Math.random()
        this.targetXPercent = Math.random() * 0.8
    }

    draw(ctx: CanvasRenderingContext2D): boolean {
        this.progress += this.speed

        if (this.progress >= 1) {
            this.isActive = false
        }

        const canvasW = ctx.canvas.width
        const canvasH = ctx.canvas.height
        const size = canvasW * this.sizePercent

        const currentXPercent = this.startXPercent + (this.targetXPercent - this.startXPercent) * this.easeOutQuart(this.progress)
        const drawX = currentXPercent * canvasW
        const drawY = this.yPercent * (canvasH - size)

        ctx.save()
        ctx.globalAlpha = Math.min(this.progress * 2, 1)
        ctx.drawImage(this.image, drawX, drawY, size, size)
        ctx.restore()

        return this.isActive
    }

    private easeOutQuart(x: number): number {
        return 1 - Math.pow(1 - x, 4)
    }
}

class CustomImageMotionEffect implements MusicKeyEffect {
    private image: HTMLImageElement
    private frequency: number = 1
    private frame: number
    private isActive: boolean = true
    private t2pos?: (time: number) => [x: number, y: number]
    private t2rotate?: (time: number) => number
    private t2scale?: (time: number) => [x: number, y: number]
    private t2a?: (time: number) => number
    private t2filter?: (time: number) => [sepia: number, saturate: number, hue_rotate: number]

    private sizePercent: number = 0.15

    private currentFrame = 0
    private frer = 0

    constructor(
        image: HTMLImageElement,
        frequency: number = 1,
        time: number,
        t2pos?: (time: number) => [x: number, y: number],
        t2rotate?: (time: number) => number,
        t2scale?: (time: number) => [x: number, y: number],
        t2a?: (time: number) => number,
        t2filter?: (time: number) => [sepia: number, saturate: number, hue_rotate: number]
    ) {
        this.image = image
        this.frequency = frequency
        this.frame = time * 60
        this.t2pos = t2pos
        this.t2rotate = t2rotate
        this.t2scale = t2scale
        this.t2a = t2a
        this.t2filter = t2filter
    }


    draw(ctx: CanvasRenderingContext2D): boolean {
        this.currentFrame++

        let progress = this.currentFrame / this.frame
        progress = progress > 1 ? 1 : progress

        this.frer += this.frequency
        while (this.frer > 1) {
            const canvasW = ctx.canvas.width
            const canvasH = ctx.canvas.height
            const size = canvasW * this.sizePercent

            let pos = this.t2pos?.(progress) || [0.5, 0.5]
            const drawX = pos[0] * canvasW
            const drawY = pos[1] * canvasH
            const rotate = this.t2rotate?.(progress) || 0
            const scale = this.t2scale?.(progress) || [1, 1]
            const a = this.t2a?.(progress) || 1
            const t2filter = this.t2filter?.(progress) || [0.4, 3, 0]

            ctx.save()
            ctx.translate(drawX, drawY)
            ctx.rotate((rotate * Math.PI) / 180)
            ctx.scale(scale[0], scale[1])
            ctx.globalAlpha = a
            ctx.filter = `sepia(${t2filter[0]}) saturate(${t2filter[1]}) hue-rotate(${t2filter[2]}deg)`
            ctx.drawImage(this.image, -size / 2, -size / 2, size, size)
            ctx.restore()
            this.frer--
        }

        if (progress >= 1) {
            this.isActive = false
        }

        return this.isActive
    }
}

const onionImg = new Image()
onionImg.src = onion_image
const mikuImg = new Image()
mikuImg.src = miku_image
const breadImg = new Image()
breadImg.src = bread_image
const tetoImage = new Image()
tetoImage.src = teto_image


export const KEY_MAP: Record<string, KeyConfig> = {
    // row 1
    "1": {
        index: 0, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = Math.random()
            const r3 = Math.random()

            return new CustomImageMotionEffect(
                onionImg, 0.5, 1, (t) => {
                    return [r0, r1]
                }, (t) => {
                    return r2 * 360 + t * (450 + r3 * 450)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "2": { index: 1, effect: () => new SlideImageEffect(onionImg) },
    "3": {
        index: 2, effect: () => {
            let r0 = Math.random()
            let r1 = Math.random()
            return new CustomImageMotionEffect(
                onionImg, 0.1, 1, (t) => {
                    return [Math.random(), Math.random()]
                }, (t) => {
                    return r0 * 360 + t * r1 * 360
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "4": {
        index: 3, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                onionImg, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-170, -50)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "7": {
        index: 4, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                onionImg, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-60, 30)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "8": {
        index: 5, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                onionImg, 0.2, 5, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    let x = r0
                    let y = r1 + (1 - et) * 0.15 * r2

                    x *= 0.5
                    y *= 0.5
                    y = 1 - y

                    const targetX = x + 3
                    const targetY = y - 5

                    const resultX = t > 0.3 ? x + (x + targetX) * (t - 0.3) : x
                    const resultY = t > 0.3 ? y + (y + targetY) * (t - 0.3) : y

                    return [resultX, resultY]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "9": {
        index: 6, effect: () => {
            const r0 = Math.random()
            return new CustomImageMotionEffect(
                onionImg, 0.4, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "0": {
        index: 7, effect: () => {
            const r0 = random(0.4, 0.6)
            return new CustomImageMotionEffect(
                onionImg, 0.3, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return -30 + (t * 600) % random(40, 80)
                }, (t) => {
                    let scale = 6
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        random(0, 0.3),
                        7,
                        t < 0.3 ? 0 : random(-40, 40)
                    ]
                }
            )
        }
    },

    // row 2
    "q": {
        index: 8, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = Math.random()
            const r3 = Math.random()

            return new CustomImageMotionEffect(
                mikuImg, 0.5, 1, (t) => {
                    return [r0, r1]
                }, (t) => {
                    return r2 * 360 + t * (450 + r3 * 450)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "w": { index: 9, effect: () => new SlideImageEffect(mikuImg) },
    "e": {
        index: 10, effect: () => {
            let r0 = Math.random()
            let r1 = Math.random()
            return new CustomImageMotionEffect(
                mikuImg, 0.1, 1, (t) => {
                    return [Math.random(), Math.random()]
                }, (t) => {
                    return r0 * 360 + t * r1 * 360
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "r": {
        index: 11, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                mikuImg, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-170, -50)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "u": {
        index: 12, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                mikuImg, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-60, 30)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "i": {
        index: 13, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                mikuImg, 0.2, 5, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    let x = r0
                    let y = r1 + (1 - et) * 0.15 * r2

                    x *= 0.5
                    y *= 0.5
                    y = 1 - y

                    const targetX = x + 3
                    const targetY = y - 5

                    const resultX = t > 0.3 ? x + (x + targetX) * (t - 0.3) : x
                    const resultY = t > 0.3 ? y + (y + targetY) * (t - 0.3) : y

                    return [resultX, resultY]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "o": {
        index: 14, effect: () => {
            const r0 = Math.random()
            return new CustomImageMotionEffect(
                mikuImg, 0.4, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "p": {
        index: 15, effect: () => {
            const r0 = random(0.4, 0.6)
            return new CustomImageMotionEffect(
                mikuImg, 0.3, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return -30 + (t * 600) % random(40, 80)
                }, (t) => {
                    let scale = 6
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        random(0, 0.3),
                        7,
                        t < 0.3 ? 0 : random(-40, 40)
                    ]
                }
            )
        }
    },

    // row 3
    "a": {
        index: 16, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = Math.random()
            const r3 = Math.random()

            return new CustomImageMotionEffect(
                breadImg, 0.5, 1, (t) => {
                    return [r0, r1]
                }, (t) => {
                    return r2 * 360 + t * (450 + r3 * 450)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "s": { index: 17, effect: () => new SlideImageEffect(breadImg) },
    "d": {
        index: 18, effect: () => {
            let r0 = Math.random()
            let r1 = Math.random()
            return new CustomImageMotionEffect(
                breadImg, 0.1, 1, (t) => {
                    return [Math.random(), Math.random()]
                }, (t) => {
                    return r0 * 360 + t * r1 * 360
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "f": {
        index: 19, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                breadImg, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-170, -50)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "j": {
        index: 20, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                breadImg, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-60, 30)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "k": {
        index: 21, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                breadImg, 0.2, 5, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    let x = r0
                    let y = r1 + (1 - et) * 0.15 * r2

                    x *= 0.5
                    y *= 0.5
                    y = 1 - y

                    const targetX = x + 3
                    const targetY = y - 5

                    const resultX = t > 0.3 ? x + (x + targetX) * (t - 0.3) : x
                    const resultY = t > 0.3 ? y + (y + targetY) * (t - 0.3) : y

                    return [resultX, resultY]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "l": {
        index: 22, effect: () => {
            const r0 = Math.random()
            return new CustomImageMotionEffect(
                breadImg, 0.4, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "": {
        index: 23, effect: () => {
            const r0 = random(0.4, 0.6)
            return new CustomImageMotionEffect(
                breadImg, 0.3, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return -30 + (t * 600) % random(40, 80)
                }, (t) => {
                    let scale = 6
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        random(0, 0.3),
                        7,
                        t < 0.3 ? 0 : random(-40, 40)
                    ]
                }
            )
        }
    },

    // row 4
    "z": {
        index: 24, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = Math.random()
            const r3 = Math.random()

            return new CustomImageMotionEffect(
                tetoImage, 0.5, 1, (t) => {
                    return [r0, r1]
                }, (t) => {
                    return r2 * 360 + t * (450 + r3 * 450)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "x": { index: 25, effect: () => new SlideImageEffect(tetoImage) },
    "c": {
        index: 26, effect: () => {
            let r0 = Math.random()
            let r1 = Math.random()
            return new CustomImageMotionEffect(
                tetoImage, 0.1, 1, (t) => {
                    return [Math.random(), Math.random()]
                }, (t) => {
                    return r0 * 360 + t * r1 * 360
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "v": {
        index: 27, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                tetoImage, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-170, -50)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    "m": {
        index: 28, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            const r3 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                tetoImage, 0.2, 1, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    const x = r0 - (1 - et) * 0.75 * r2
                    const y = r1 - (1 - et) * 0.75 * r3

                    return [x, y]
                }, (t) => {
                    return random(-60, 30)
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0.4,
                        3,
                        random(-90, 90)
                    ]
                }
            )
        }
    },
    ",": {
        index: 29, effect: () => {
            const r0 = Math.random()
            const r1 = Math.random()
            const r2 = -1 + Math.random() * 2
            return new CustomImageMotionEffect(
                tetoImage, 0.2, 5, (t) => {

                    const s = 1.70158
                    const et = (t - 1) * (t - 1) * ((s + 1) * (t - 1) + s) + 1

                    let x = r0
                    let y = r1 + (1 - et) * 0.15 * r2

                    x *= 0.5
                    y *= 0.5
                    y = 1 - y

                    const targetX = x + 3
                    const targetY = y - 5

                    const resultX = t > 0.3 ? x + (x + targetX) * (t - 0.3) : x
                    const resultY = t > 0.3 ? y + (y + targetY) * (t - 0.3) : y

                    return [resultX, resultY]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    ".": {
        index: 30, effect: () => {
            const r0 = Math.random()
            return new CustomImageMotionEffect(
                tetoImage, 0.4, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return 0
                }, (t) => {
                    let random = Math.random()
                    let scale = random + t * random
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        0,
                        7,
                        t < 0.3 ? 0 : random(-90, 90)
                    ]
                }
            )
        }
    },
    "/": {
        index: 31, effect: () => {
            const r0 = random(0.4, 0.6)
            return new CustomImageMotionEffect(
                tetoImage, 0.3, 5, (t) => {
                    return [1.2 - t * 2.4, r0]
                }, (t) => {
                    return -30 + (t * 600) % random(40, 80)
                }, (t) => {
                    let scale = 6
                    return [scale, scale]
                }, (t) => {
                    return 1 - t * 0.5
                }, (t) => {
                    return [
                        random(0, 0.3),
                        7,
                        t < 0.3 ? 0 : random(-40, 40)
                    ]
                }
            )
        }
    },
}

export const INDEX_TO_CONFIG = (() => {
    const arr = new Array(32)
    Object.values(KEY_MAP).forEach(config => {
        arr[config.index] = config
    })
    return arr
})()