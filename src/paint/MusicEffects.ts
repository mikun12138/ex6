import miku_cong_image from "../assets/1.png"

export type KeyConfig = {
    index: number
    effect?: () => MusicKeyEffect
}
export interface MusicKeyEffect {
    draw(ctx: CanvasRenderingContext2D): boolean;
}

class RandomPosImageEffect implements MusicKeyEffect {
    private image: HTMLImageElement

    constructor(image: HTMLImageElement) {
        this.image = image
    }

    draw(ctx: CanvasRenderingContext2D) {
        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;

        let size = 64;

        let xPercent = Math.random();
        let yPercent = Math.random();

        const drawX = xPercent * (canvasW - size);
        const drawY = yPercent * (canvasH - size);

        ctx.drawImage(this.image, drawX, drawY, size, size);

        return false
    }
}

class SlideImageEffect implements MusicKeyEffect {
    private progress: number = 0;
    private speed: number = 0.03;
    private sizePercent: number = 0.15;
    private yPercent: number;
    private targetXPercent: number;
    private startXPercent: number = -0.2;

    // 添加 isActive 标识
    private isActive: boolean = true;

    constructor(private image: HTMLImageElement) {
        this.yPercent = Math.random();
        this.targetXPercent = Math.random() * 0.8;
    }

    draw(ctx: CanvasRenderingContext2D): boolean {
        this.progress += this.speed;

        if (this.progress >= 1) {
            this.isActive = false;
            return false;
        }

        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;
        const size = canvasW * this.sizePercent;

        const currentXPercent = this.startXPercent + (this.targetXPercent - this.startXPercent) * this.easeOutQuart(this.progress);
        const drawX = currentXPercent * canvasW;
        const drawY = this.yPercent * (canvasH - size);

        ctx.save();
        ctx.globalAlpha = Math.min(this.progress * 2, 1);
        ctx.drawImage(this.image, drawX, drawY, size, size);
        ctx.restore();

        return true;
    }

    private easeOutQuart(x: number): number {
        return 1 - Math.pow(1 - x, 4);
    }
}

class CustomImageMotionEffect implements MusicKeyEffect {
    private frame: number
    private isActive: boolean = true;
    private t2pos?: (time: number) => [x: number, y: number]
    private t2rotate?: (time: number) => number
    private t2scale?: (time: number) => [x: number, y: number]
    private t2rgba?: (time: number) => [r: number, g: number, b: number, a: number]

    private sizePercent: number = 0.15

    private currentFrame = 0

    constructor(
        private image: HTMLImageElement,
        time: number,
        t2pos?: (time: number) => [x: number, y: number],
        t2rotate?: (time: number) => number,
        t2scale?: (time: number) => [x: number, y: number],
        t2rgba?: (time: number) => [r: number, g: number, b: number, a: number]
    ) {
        this.frame = time * 60
        this.t2pos = t2pos
        this.t2rotate = t2rotate
        this.t2scale = t2scale
        this.t2rgba = t2rgba
    }


    draw(ctx: CanvasRenderingContext2D): boolean {
        this.currentFrame++

        let progress = this.currentFrame / this.frame
        progress = progress > 1 ? 1 : progress

        const canvasW = ctx.canvas.width;
        const canvasH = ctx.canvas.height;
        const size = canvasW * this.sizePercent;

        let pos = this.t2pos?.(progress) || [0.5, 0.5]
        const drawX = pos[0] * canvasW
        const drawY = pos[1] * canvasH
        const rotate = this.t2rotate?.(progress) || 0;
        const scale = this.t2scale?.(progress) || [1, 1];
        const rgba = this.t2rgba?.(progress) || [1, 1, 1, 1]

        ctx.save();
        ctx.drawImage(this.image, drawX, drawY, size, size);
        ctx.rotate(rotate)
        ctx.scale(scale[0], scale[1])
        ctx.fillStyle = `rgb(${rgba[0]}, ${rgba[1]}, ${rgba[2]})`
        ctx.globalAlpha = rgba[3]
        ctx.restore();

        if (progress == 1) {
            this.isActive = false;
        }

        return this.isActive
    }
}

const mikuImg = new Image();
mikuImg.src = miku_cong_image;

export const KEY_MAP: Record<string, KeyConfig> = {
    // row 1
    "1": { index: 0, effect: () => new RandomPosImageEffect(mikuImg) },
    "2": { index: 1, effect: () => new SlideImageEffect(mikuImg) },
    "3": {
        index: 2, effect: () => new CustomImageMotionEffect(
            mikuImg, 1, (t) => {
                return [Math.random(), Math.random()]
            }, (t) => {
                return 30
            }
        )
    },
    "4": { index: 3 },
    "7": { index: 4 },
    "8": { index: 5 },
    "9": { index: 6 },
    "0": { index: 7 },

    // row 2
    "q": { index: 8 },
    "w": { index: 9 },
    "e": { index: 10 },
    "r": { index: 11 },
    "u": { index: 12 },
    "i": { index: 13 },
    "o": { index: 14 },
    "p": { index: 15 },

    // row 3
    "a": { index: 16 },
    "s": { index: 17 },
    "d": { index: 18 },
    "f": { index: 19 },
    "j": { index: 20 },
    "k": { index: 21 },
    "l": { index: 22 },
    ";": { index: 23 },

    // row 4
    "z": { index: 24 },
    "x": { index: 25 },
    "c": { index: 26 },
    "v": { index: 27 },
    "m": { index: 28 },
    ",": { index: 29 },
    ".": { index: 30 },
    "/": { index: 31 },
};

export const INDEX_TO_CONFIG = (() => {
    const arr = new Array(32);
    Object.values(KEY_MAP).forEach(config => {
        arr[config.index] = config;
    });
    return arr;
})();