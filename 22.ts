import AocSolution from './aoc/AocSolution';
import { Cuboid, walk } from './3d'
import { Range, XY, XYZ } from './collections'

namespace Problem22 {
    type DataType = { action: "on"|"off", cuboid: Cuboid }[]
    class Solution extends AocSolution<DataType> {
        public day: string = "22"
        protected DEBUG: boolean = true
        protected SHOW_WORK: boolean = true

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            const core = data.reduce((acc, cmd) => {
                const { action, cuboid } = cmd
                const ignore = cuboid.ranges.map(range => range.min < -50 || range.max > 50).reduce((acc, c) => acc || c, false)
                if (ignore) return acc
                for (const xyz of walk(cuboid.x, cuboid.y, cuboid.z)) {
                    if (action == "on") acc.set(xyz.key, true)
                    else acc.delete(xyz.key)
                }
                return acc
            }, new Map<string, boolean>())
            var cubesOn = [...core.values()].filter(state => state)
            return { message: `Number of reactor core cubes that are in the on state is ${cubesOn.length}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            const core = data.reverse().reduce((acc, cmd) => {
                const { action, cuboid } = cmd
                if (action == "on") acc.cuboidsOn += cuboid.volume - this.overlappingVolume(cuboid, ...acc.cuboids)
                acc.cuboids.push(cuboid)
                return acc
            }, { cuboidsOn: 0, cuboids: [] as Cuboid[] })
            return `Number of reactor core cubes that are in the on state is ${core.cuboidsOn}`
        }

        private overlappingVolume(cuboid: Cuboid, ...other: Cuboid[]): number {
            return other.map((c, i, _) => {
                const intersection = cuboid.intersect(c)
                if (intersection == null) return 0
                return intersection.volume - this.overlappingVolume(intersection, ...other.slice(1 + i))
            }).reduce((acc, c) => acc + c, 0)
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => {
                const [action, coordinates] = line.split(" ")
                const [xRange, yRange, zRange] = coordinates
                    .split(",")
                    .map(token => token.split("=")[1].split("..").map(number => parseInt(number)))
                    .map(range => Range.from(...range))
                return { action: action as "on"|"off", cuboid: new Cuboid(xRange, yRange, zRange) }
            })
            return data
        }

        protected SAMPLE_DATA: string = 
`
on x=10..12,y=10..12,z=10..12
on x=11..13,y=11..13,z=11..13
off x=9..11,y=9..11,z=9..11
on x=10..10,y=10..10,z=10..10
`;
    }

    (async () => await new Solution().executeAsync())();
}