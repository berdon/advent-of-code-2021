import AocSolution from './aoc/AocSolution';

namespace Problem13 {
    type DataType = { folds: Fold[]; dots: Map<string, Point>; }
    class Solution extends AocSolution<DataType> {
        public day: string = "13"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            if (this.SHOW_WORK) console.log("Initial state")
            if (this.SHOW_WORK) this.display(data.dots)
            const dots = data.folds.reduce((acc, fold) => {
                if (this.SHOW_WORK) console.log(`Fold ${fold.type} at ${fold.at}`)
                const dots = this.performFold(fold.type, fold.at, acc.dots)
                if (this.SHOW_WORK) this.display(dots)
                return { dots: dots, dotCounts: [...acc.dotCounts, dots.size] }
            }, { dots: data.dots, dotCounts: [data.dots.size] })
            return { message: `Number of dots after fold 1 is ${dots.dotCounts[1]}`, context: dots }
        }

        public async solvePartTwoAsync(data: DataType, { dots }: { dots: Map<string, Point>; dotCounts: number[]; }): Promise<string> {
            console.log('```bash')
            this.display(dots)
            console.log('```')
            return ``
        }

        private display(dots: Map<string, Point>) {
            const values = [...dots.values()]
            const maxX = values.reduce((acc, c) => c.x > acc ? c.x : acc, Number.MIN_VALUE) + 1
            const maxY = values.reduce((acc, c) => c.y > acc ? c.y : acc, Number.MIN_VALUE) + 1
    
            const grid = Array(maxY).fill(false).map(column => Array(maxX).fill(false))
            values.reduce((acc, c) => {
                acc[c.y][c.x] = true
                return acc
            }, grid)
            grid.forEach(row => console.log(row.reduce((acc, c) => acc + (c ? String.fromCharCode(0x2588) : " "), "")))
        }
    
        private performFold(type: FoldType, at: number, dots: Map<string, Point>): Map<string, Point> {
            if (type == FoldType.Left) {
                // Subtract (x - at) from each dot where x > at
                return [...dots.values()]
                    .filter(dot => dot.x > at)
                    .reduce((acc, dot) => {
                        acc.delete(dot.key)
                        const newDot = new Point(2 * at - dot.x, dot.y)
                        acc.set(newDot.key, newDot)
                        return acc
                }, new Map<string, Point>(dots))
            }
            else if (type == FoldType.Up) {
                // Subtract (y - at) from each dot where y > at
                return [...dots.values()]
                    .filter(dot => dot.y > at)
                    .reduce((acc, dot) => {
                        acc.delete(dot.key)
                        const newDot = new Point(dot.x, 2 * at - dot.y)
                        acc.set(newDot.key, newDot)
                        return acc
                    }, new Map<string, Point>(dots))
            }
    
            throw "Invalid fold type"
        }

        protected parseData(lines: string[]): DataType {
            const points = lines.filter(line =>
                line.indexOf(",") > 0)
                    .map(line => line.split(",").map(token => parseInt(token)))
                    .map(tokens => new Point(tokens[0], tokens[1]))
                    .reduce((acc, c) => acc.set(c.key, c), new Map<string, Point>())
            const folds = lines
                .filter(line => line.startsWith("fold"))
                .map(line =>
                    line.slice(11).split("="))
                        .map(tokens => tokens[0] == "y"
                            ? new Fold(FoldType.Up, parseInt(tokens[1]))
                            : new Fold(FoldType.Left, parseInt(tokens[1])))
            return { folds: folds, dots: points}
        }

        protected SAMPLE_DATA: string = 
`
6,10
0,14
9,10
0,3
10,4
4,11
6,0
6,12
4,1
0,13
10,12
3,4
3,0
8,4
1,10
2,14
8,10
9,0

fold along y=7
fold along x=5
`;
    }

    enum FoldType {
        Up,
        Right,
        Down,
        Left
    }

    class Point {
        public x: number
        public y: number
        public readonly key: string

        public constructor(x: number, y: number) {
            this.x = x
            this.y = y
            this.key = `${this.x},${this.y}`
        }
    }

    class Fold {
        public type: FoldType
        public at: number

        public constructor(type: FoldType, at: number) {
            this.type = type
            this.at = at
        }
    }

    (async () => await new Solution().executeAsync())();
}