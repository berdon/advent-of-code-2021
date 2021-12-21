import AocSolution from './aoc/AocSolution';

namespace Problem05 {
    type DataType = Line[]
    class Solution extends AocSolution<DataType> {
        public day: string = "05"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var existingPoints: { [Key: string]: number } = {}
            const hvLines = data.filter(line => line.category != "mixed")
            for (var i = 0; i < hvLines.length; i++) {
                var basePoint = hvLines[i]
                for(var point of basePoint.points()) {
                    const key = point.toString()
                    existingPoints[key] = key in existingPoints ? existingPoints[key] + 1 : 1
                }
            }

            var crossedPoints = Object.keys(existingPoints).filter(key => existingPoints[key] >= 2)
            return { message: `${crossedPoints.length} points overlap` }
        }

        public async solvePartTwoAsync(data: DataType, context: any): Promise<string> {
            var existingPoints: { [Key: string]: number } = {}
            const allLines = data
            for (var i = 0; i < allLines.length; i++) {
                var basePoint = allLines[i]
                for(var point of basePoint.points()) {
                    const key = point.toString()
                    existingPoints[key] = key in existingPoints ? existingPoints[key] + 1 : 1
                }
            }

            var crossedPoints = Object.keys(existingPoints).filter(key => existingPoints[key] >= 2)
            return `${crossedPoints.length} points overlap`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => line.split(" -> ").map(point => new Point(point.split(",").map(n => parseInt(n))))).map(points => new Line(points[0], points[1]))
            return data
        }

        protected SAMPLE_DATA: string = 
`
0,9 -> 5,9
8,0 -> 0,8
9,4 -> 3,4
2,2 -> 2,1
7,0 -> 7,4
6,4 -> 2,0
0,9 -> 2,9
3,4 -> 1,4
0,0 -> 8,8
5,5 -> 8,2
`;
    }

    class Point {
        public readonly x: number
        public readonly y: number

        constructor(points: number[]) {
            this.x = points[0]
            this.y = points[1]
        }

        public toString = () : string => {
            return `[${this.x},${this.y}]`;
        }
    }

    class Line {
        public readonly start: Point
        public readonly end: Point
        public readonly length: number
        public readonly direction: "horizontal"|"vertical"|"SwNe"|"NwSe"
        public readonly category: "horizontal"|"vertical"|"mixed"

        constructor(start: Point, end: Point) {
            this.start = start
            this.end = end
            if (this.start.x == this.end.x) {
                this.direction = "vertical"
                this.category = "vertical"
                if (this.start.y > this.end.y) {
                    var swap = this.start
                    this.start = this.end
                    this.end = swap
                }
                this.length = this.end.y - this.start.y
            }
            else if (this.start.y == this.end.y) {
                this.direction = "horizontal"
                this.category = "horizontal"
                if (this.start.x > this.end.x) {
                    var swap = this.start
                    this.start = this.end
                    this.end = swap
                }
                this.length = this.end.x - this.start.x
            }
            else {
                if (this.start.y <= this.end.y && this.start.x <= this.end.x
                    || this.end.y < this.start.y && this.end.x < this.start.x) {
                    this.direction = "NwSe"
                    if (this.end.y < this.start.y && this.end.x < this.start.x) {
                        var swap = this.start
                        this.start = this.end
                        this.end = swap
                    }
                }
                else {
                    this.direction = "SwNe"
                    if (this.start.y < this.end.y && this.end.x < this.start.x) {
                        var swap = this.start
                        this.start = this.end
                        this.end = swap
                    }
                }
                this.category = "mixed"
                this.length = 0
            }
        }

        nextPoint(point: Point): Point {
            switch (this.direction) {
                case "horizontal": return new Point([point.x + 1, point.y])
                case "vertical": return new Point([point.x, point.y + 1])
                case "NwSe": return new Point([point.x + 1, point.y + 1])
                case "SwNe": return new Point([point.x + 1, point.y - 1])
            }
        }

        *points(): IterableIterator<Point> {
            var walker = this.start
            do {
                yield walker
                walker = this.nextPoint(walker)
            } while (walker.x != this.end.x || walker.y != this.end.y)
            yield this.end
        }
    }

    (async () => await new Solution().executeAsync())();
}