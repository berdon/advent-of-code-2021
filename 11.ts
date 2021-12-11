import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"
import './collections'
import Console from './console'

namespace Problem11 {
    const DAY = 11;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const TICKS = 100
    const OUTPUT = false
    const SAMPLE_DATA = 
`
5483143223
2745854711
5264556173
6141336146
6357385478
4167524645
2176841721
6882881134
4846848554
5283751526
`;
    async function main() {
        // Part 1
        var { startTime, data: grid } = await getInputDataAsync()
        var elapsed = (performance.now() - startTime).toFixed(2)

        var totalFlashes = 0
        var flashingSet = new Set<string>()
        for (var step = 0; step < TICKS; step++) {
            if (OUTPUT) console.log(`Step ${step}`)
            if (OUTPUT) grid.display(flashingSet)
            var flashingQueue = [...grid.tick()]
            flashingSet = new Set<string>(flashingQueue.map(x => x.toString()))
            var hasFlashedSet = new Set<string>()

            while(flashingQueue.length > 0) {
                var flasher = flashingQueue.shift()!
                // Mark the flasher has having flashed
                hasFlashedSet.add(flasher.toString());
                // Upgrade neighbors and grab any that need to flash
                var neighborsFlashing = [...grid.neighbors(flasher)].map(xy => ({ xy: xy, level: grid.upgrade(xy) })).filter(x => x.level > 9).map(x => x.xy)
                // Only queue neighbors who aren't queued and haven't flashed
                neighborsFlashing.filter(x => !flashingSet.has(x.toString()))
                                 .filter(x => !hasFlashedSet.has(x.toString()))
                                 .forEach(x => {
                                    flashingQueue.push(x)
                                    flashingSet.add(x.toString())
                                 })
            }
            // Update all who flashed to 0
            [...hasFlashedSet.values()].map(x => x.split(",").map(y => parseInt(y)))
                                       .map(pair => new XY(pair[0], pair[1]))
                                       .forEach(xy => grid.zero(xy))

            if (OUTPUT) console.log()
            totalFlashes += hasFlashedSet.size
        }
        console.log(`Part 1: Total flashed octopi count is ${totalFlashes} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        var step = TICKS
        while (flashingSet.size != grid.elephants.length * grid.elephants[0].length) {
            step += 1
            var flashingQueue = [...grid.tick()]
            flashingSet = new Set<string>(flashingQueue.map(x => x.toString()))
            var hasFlashedSet = new Set<string>()

            while(flashingQueue.length > 0) {
                var flasher = flashingQueue.shift()!
                // Mark the flasher has having flashed
                hasFlashedSet.add(flasher.toString());
                // Upgrade neighbors and grab any that need to flash
                var neighborsFlashing = [...grid.neighbors(flasher)].map(xy => ({ xy: xy, level: grid.upgrade(xy) })).filter(x => x.level > 9).map(x => x.xy)
                // Only queue neighbors who aren't queued and haven't flashed
                neighborsFlashing.filter(x => !flashingSet.has(x.toString()))
                                 .filter(x => !hasFlashedSet.has(x.toString()))
                                 .forEach(x => {
                                    flashingQueue.push(x)
                                    flashingSet.add(x.toString())
                                 })
            }
            // Update all who flashed to 0
            [...hasFlashedSet.values()].map(x => x.split(",").map(y => parseInt(y)))
                                       .map(pair => new XY(pair[0], pair[1]))
                                       .forEach(xy => grid.zero(xy))
            totalFlashes += hasFlashedSet.size
        }
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Step at total synchronization is ${step} (${elapsed} ms)`)
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: Grid}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = new Grid(lines.map(line => line.split("").map(x => parseInt(x))))

        return { startTime: startTime, data: data }
    }

    class XY {
        public x: number
        public y: number

        constructor(x: number, y: number) {
            this.x = x
            this.y = y
        }

        public toString = () : string => {
            return `${this.x},${this.y}`;
        }
    }

    class Grid {
        elephants: number[][]

        constructor(elephants: number[][]) {
            this.elephants = elephants
        }

        elephant(xy: XY): number { return this.elephants[xy.y][xy.x] }
        upgrade(xy: XY): number { return this.elephants[xy.y][xy.x] += 1}
        zero(xy: XY): number { return this.elephants[xy.y][xy.x] = 0}
        *neighbors(xy: XY): IterableIterator<XY> {
            if (xy.x > 0 && xy.y > 0) yield new XY(xy.x - 1, xy.y - 1)
            if (xy.y > 0) yield new XY(xy.x, xy.y - 1)
            if (xy.x < this.elephants.length - 1 && xy.y > 0) yield new XY(xy.x + 1, xy.y - 1)

            if (xy.x > 0) yield new XY(xy.x - 1, xy.y)
            if (xy.x < this.elephants.length - 1) yield new XY(xy.x + 1, xy.y)

            if (xy.x > 0 && xy.y < this.elephants[0].length - 1) yield new XY(xy.x - 1, xy.y + 1)
            if (xy.y < this.elephants[0].length - 1) yield new XY(xy.x, xy.y + 1)
            if (xy.x < this.elephants.length - 1 && xy.y < this.elephants[0].length - 1) yield new XY(xy.x + 1, xy.y + 1)
        }

        *tick(): IterableIterator<XY> {
            for (var y = 0; y < this.elephants.length; y++) {
                for (var x = 0; x < this.elephants[y].length; x++) {
                    this.elephants[y][x] += 1
                    if (this.elephants[y][x] > 9) yield new XY(x, y)
                }
            }
        }

        display(flashed: Set<string>) {
            for (var y = 0; y < this.elephants.length; y++) {
                for (var x = 0; x < this.elephants[y].length; x++) {
                    if (flashed.has(new XY(x, y).toString())) {
                        process.stdout.write(`${Console.Bright}${Console.FgCyan}`);
                    }
                    process.stdout.write(`${this.elephants[y][x]}${Console.Reset}`);
                }
                console.log()
            }
        }
    }

    (async () => await main())();
}