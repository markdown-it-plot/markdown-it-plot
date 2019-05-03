
class LineStyle {
    constructor(init?: LineStyle) {
        init && Object.assign(this, init)
    }
    color: string
}

export class LineStyles {

    static styles: LineStyle[] = [
        new LineStyle({ color: 'dark-violet' }),
        new LineStyle({ color: '#009e73' }),
        new LineStyle({ color: '#56b4e9' }),
        new LineStyle({ color: '#e69f00' }),
        new LineStyle({ color: '#f0e442' }),
        new LineStyle({ color: '#0072b2' }),
        new LineStyle({ color: '#e51e10' }),
        new LineStyle({ color: 'black' }),
    ]

    static current: number = -1;

    static next() {
        return this.styles[(++this.current) % this.styles.length]
    }

    static reset() {
        this.current = -1;
    }
}