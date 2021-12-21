import AocSolution from './aoc/AocSolution';

namespace Problem02 {
    type DataType = { direction: "forward" | "down" | "up"; amount: number; }[]
    class Solution extends AocSolution<DataType> {
        public day: string = "02"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            var horizontalPosition = 0
            var depth = 0
            data.forEach(command => {
                switch (command.direction) {
                    case "forward": horizontalPosition += command.amount; break
                    case "down": depth += command.amount; break
                    case "up": depth -= command.amount; break
                }
            })
            return { message: `Product of position and depth is ${horizontalPosition * depth}` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
            var horizontalPosition = 0
            var depth = 0
            var aim = 0
            data.forEach(command => {
                switch (command.direction) {
                    case "forward":
                        horizontalPosition += command.amount
                        depth += aim * command.amount
                        break
                    case "down": aim += command.amount; break
                    case "up": aim -= command.amount; break
                }
            })
            return `Product of position and depth is ${horizontalPosition * depth} (${horizontalPosition} x ${depth})`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(line => {
                const tokens = line.split(" ")
                return { direction: tokens[0] as "forward"|"down"|"up", amount: parseInt(tokens[1]) }
            })
            return data
        }

        protected SAMPLE_DATA: string = "forward 5\ndown 5\nforward 8\nup 3\ndown 8\nforward 2\n"
    }

    (async () => await new Solution().executeAsync())();
}