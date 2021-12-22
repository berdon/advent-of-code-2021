export * from './SetExtensions'
export * from './ArrayExtensions'

export class Range<T> {
    public min: T
    public max: T

    constructor(min: T, max: T) {
        this.min = min
        this.max = max
    }

    public static from<T>(...values: T[]) {
        if (values.length == 2)
            return new Range<T>(values[0], values[1])
        throw "Invalid input array length"
    }

    public equals = (obj: Range<T>): boolean => this.min == obj.min && this.max == obj.max
}

export class XY {
    public x: number
    public y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    public get key() { return `${this.x},${this.y}` }
    public toString = (): string => this.key
    public equals = (obj: XYZ): boolean => this.x == obj.x && this.y == obj.y
}

export class XYZ {
    public x: number
    public y: number
    public z: number

    constructor(x: number, y: number, z: number) {
        this.x = x
        this.y = y
        this.z = z
    }

    public get key() { return `${this.x},${this.y},${this.z}` }
    public toString = (): string => this.key
    public equals = (obj: XYZ): boolean => this.x == obj.x && this.y == obj.y && this.z == obj.z
}