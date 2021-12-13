import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem13 {
    const DAY = 13;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
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
    const upperCaseRegEx = new RegExp(/^[A-Z]*$/)
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        var elapsed = (performance.now() - startTime).toFixed(2)

        if (DEBUG) console.log("Initial state")
        if (DEBUG) display(data.dots)
        const dots = data.folds.reduce((acc, fold) => {
            if (DEBUG) console.log(`Fold ${fold.type} at ${fold.at}`)
            const dots = performFold(fold.type, fold.at, acc.dots)
            if (DEBUG) display(dots)
            return { dots: dots, dotCounts: [...acc.dotCounts, dots.size] }
        }, { dots: data.dots, dotCounts: [data.dots.size] })

        console.log(`Part 1: Number of dots after fold 1 is ${dots.dotCounts[1]} (${elapsed} ms)`)

        // Part 2
        console.log(`Part 2:`)
        display(dots.dots)
    }

    function display(dots: Map<string, Point>) {
        const values = [...dots.values()]
        const maxX = values.reduce((acc, c) => c.x > acc ? c.x : acc, Number.MIN_VALUE) + 1
        const maxY = values.reduce((acc, c) => c.y > acc ? c.y : acc, Number.MIN_VALUE) + 1

        const grid = Array(maxY).fill(false).map(column => Array(maxX).fill(false))
        values.reduce((acc, c) => {
            acc[c.y][c.x] = true
            return acc
        }, grid)
        grid.forEach(row => console.log(row.reduce((acc, c) => acc + (c ? "#" : " "), "")))
        console.log("\n")
    }

    function performFold(type: FoldType, at: number, dots: Map<string, Point>): Map<string, Point> {
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

    async function getInputDataAsync(): Promise<{ startTime: number, data: { folds: Fold[], dots: Map<string, Point> }}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

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

        return { startTime: startTime, data: { folds: folds, dots: points} }
    }

    (async () => await main())();
}