import AocSolution from './aoc/AocSolution';
import './collections'
import Console from './console'

namespace Problem11 {
    type DataType = Grid
    class Solution extends AocSolution<DataType> {
        public day: string = "11"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false
        private TICKS = 100

        public async solvePartOneAsync(grid: DataType): Promise<{ message: string, context?: any }> {
            var totalFlashes = 0
            var flashingSet = new Set<string>()
            for (var step = 0; step < this.TICKS; step++) {
                if (this.SHOW_WORK) console.log(`Step ${step}`)
                if (this.SHOW_WORK) grid.display(flashingSet)
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

                if (this.SHOW_WORK) console.log()
                totalFlashes += hasFlashedSet.size
            }
            return { message: `Total flashed octopi count is ${totalFlashes}`, context: { flashingSet, totalFlashes } }
        }

        public async solvePartTwoAsync(grid: DataType, { flashingSet, totalFlashes }: { flashingSet: Set<string>, totalFlashes: number }): Promise<string> {
            var step = this.TICKS
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
            return `Step at total synchronization is ${step}`
        }

        protected parseData(lines: string[]): DataType {
            const data = new Grid(lines.map(line => line.split("").map(x => parseInt(x))))
            return data
        }

        protected SAMPLE_DATA: string = 
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

    (async () => await new Solution().executeAsync())();
}