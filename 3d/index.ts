import { Range, XYZ } from '../collections'

export function *walk(xInclusiveRange: Range<number>, yInclusiveRange: Range<number>, zInclusiveRange: Range<number>): IterableIterator<XYZ> {
    for (var x = xInclusiveRange.min; x <= xInclusiveRange.max; x++)
    for (var y = yInclusiveRange.min; y <= yInclusiveRange.max; y++)
    for (var z = zInclusiveRange.min; z <= zInclusiveRange.max; z++)
        yield new XYZ(x, y, z)
}

export class Cuboid {
    public x: Range<number>
    public y: Range<number>
    public z: Range<number>

    public get ranges() { return [this.x, this.y, this.z] }
    public get volume() { return (Math.abs(this.x.max - this.x.min) + 1)
                                 * (Math.abs(this.y.max - this.y.min) + 1)
                                 * (Math.abs(this.z.max - this.z.min) + 1) }

    constructor(x: Range<number>, y: Range<number>, z: Range<number>) {
        this.x = x
        this.y = y
        this.z = z
    }

    public intersects(point: XYZ) {
        return (point.x >= this.x.min && point.x <= this.x.max)
            && (point.y >= this.y.min && point.y <= this.y.max)
            && (point.z >= this.z.min && point.z <= this.z.max)
    }

    public intersect(cuboid: Cuboid): Cuboid|null {
        if (this.x.max < cuboid.x.min || this.x.min > cuboid.x.max) return null
        if (this.y.max < cuboid.y.min || this.y.min > cuboid.y.max) return null
        if (this.z.max < cuboid.z.min || this.z.min > cuboid.z.max) return null

        const xMin = this.x.min <= cuboid.x.min ? cuboid.x.min : this.x.min
        const xMax = this.x.max <= cuboid.x.max ? this.x.max : cuboid.x.max

        const yMin = this.y.min <= cuboid.y.min ? cuboid.y.min : this.y.min
        const yMax = this.y.max <= cuboid.y.max ? this.y.max : cuboid.y.max

        const zMin = this.z.min <= cuboid.z.min ? cuboid.z.min : this.z.min
        const zMax = this.z.max <= cuboid.z.max ? this.z.max : cuboid.z.max

        return new Cuboid(new Range(xMin, xMax), new Range(yMin, yMax), new Range(zMin, zMax))
    }

    public *subtract(cuboid: Cuboid): IterableIterator<Cuboid> {
        const intersection = this.intersect(cuboid)
        if (intersection == null) {
            yield new Cuboid(this.x, this.y, this.z)
            return
        }

        const points = [
            new XYZ(intersection.x.min, intersection.y.min, intersection.z.min),
            new XYZ(intersection.x.max, intersection.y.min, intersection.z.min),
            new XYZ(intersection.x.min, intersection.y.max, intersection.z.min),
            new XYZ(intersection.x.max, intersection.y.max, intersection.z.min),
            new XYZ(intersection.x.min, intersection.y.min, intersection.z.max),
            new XYZ(intersection.x.max, intersection.y.min, intersection.z.max),
            new XYZ(intersection.x.min, intersection.y.max, intersection.z.max),
            new XYZ(intersection.x.max, intersection.y.max, intersection.z.max)
        ]

        const pieces = points.reduce((acc, point) => {
            const pieces = acc.map(piece => [...piece.split(point)]).flat()
            return pieces
        }, [new Cuboid(this.x, this.y, this.z)])

        yield* pieces.filter(piece => !piece.equals(cuboid))
    }

    public *union(cuboid: Cuboid): IterableIterator<Cuboid> {
        const intersection = this.intersect(cuboid)
        if (intersection == null) {
            yield new Cuboid(this.x, this.y, this.z)
            yield new Cuboid(cuboid.x, cuboid.y, cuboid.z)
            return
        }
        yield new Cuboid(this.x, this.y, this.z)
        yield* cuboid.subtract(intersection)
    }

    public *split(point: XYZ): IterableIterator<Cuboid> {
        if (!this.intersects(point)) {
            yield new Cuboid(this.x, this.y, this.z)
            return
        }
        if (this.x.min != point.x && this.y.min != point.y && this.z.min != point.z)
            yield new Cuboid(Range.from(...[this.x.min, point.x].sort()), Range.from(...[this.y.min, point.y].sort()), Range.from(...[this.z.min, point.z].sort()))
        if (this.x.max != point.x && this.y.min != point.y && this.z.min != point.z)
            yield new Cuboid(Range.from(...[this.x.max, point.x].sort()), Range.from(...[this.y.min, point.y].sort()), Range.from(...[this.z.min, point.z].sort()))
        if (this.x.min != point.x && this.y.max != point.y && this.z.min != point.z)
            yield new Cuboid(Range.from(...[this.x.min, point.x].sort()), Range.from(...[this.y.max, point.y].sort()), Range.from(...[this.z.min, point.z].sort()))
        if (this.x.max != point.x && this.y.max != point.y && this.z.min != point.z)
            yield new Cuboid(Range.from(...[this.x.max, point.x].sort()), Range.from(...[this.y.max, point.y].sort()), Range.from(...[this.z.min, point.z].sort()))
        if (this.x.min != point.x && this.y.min != point.y && this.z.max != point.z)
            yield new Cuboid(Range.from(...[this.x.min, point.x].sort()), Range.from(...[this.y.min, point.y].sort()), Range.from(...[this.z.max, point.z].sort()))
        if (this.x.max != point.x && this.y.min != point.y && this.z.max != point.z)
            yield new Cuboid(Range.from(...[this.x.max, point.x].sort()), Range.from(...[this.y.min, point.y].sort()), Range.from(...[this.z.max, point.z].sort()))
        if (this.x.min != point.x && this.y.max != point.y && this.z.max != point.z)
            yield new Cuboid(Range.from(...[this.x.min, point.x].sort()), Range.from(...[this.y.max, point.y].sort()), Range.from(...[this.z.max, point.z].sort()))
        if (this.x.max != point.x && this.y.max != point.y && this.z.max != point.z)
            yield new Cuboid(Range.from(...[this.x.max, point.x].sort()), Range.from(...[this.y.max, point.y].sort()), Range.from(...[this.z.max, point.z].sort()))
    }

    public equals = (obj: Cuboid): boolean => this.x.equals(obj.x) && this.y.equals(obj.y) && this.z.equals(obj.z)
}