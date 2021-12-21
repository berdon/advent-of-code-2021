import AocSolution from './aoc/AocSolution';

namespace Problem20 {
    type DataType = { lookup: string[], input: string[][]}
    class Solution extends AocSolution<DataType> {
        public day: string = "20"

        public async solvePartOneAsync(data: { lookup: string[]; input: string[][]; }): Promise<{ message: string, context: any }> {
            const enhancedOne = this.enhance(data.lookup, data.input, ".")
            const enhancedTwo = this.enhance(data.lookup, enhancedOne, enhancedOne[0][0])
            const litPixels = this.litPixelCount(enhancedTwo)
            return { message: `Lit pixels after two enhancements is ${litPixels}`, context: enhancedTwo }
        }

        public async solvePartTwoAsync(data: { lookup: string[]; input: string[][]; }, enhancedTwo: string[][]): Promise<string> {
            var image = enhancedTwo
            for (var i = 2; i < 50; i++) {
                image = this.enhance(data.lookup, image, image[0][0])
            }
            const secondLitPixels = this.litPixelCount(image)
            return `Lit pixels after two enhancements is ${secondLitPixels}`
        }

        protected parseData(lines: string[]): DataType {
            const lookup = lines[0].split("")
            const data = lines.slice(1).map(line => line.split(""));
            return { lookup: lookup, input: data }
        }

        private litPixelCount(input: string[][]) {
            return input.reduce((acc, c) => acc + c.reduce((acc, c) => acc + (c == "#" ? 1 : 0), 0), 0)
        }

        private display(input: string[][], title?: string) {
            if (title != undefined) console.log(`${title}:`)
            input.forEach(line => console.log(line.reduce((acc, c) => acc+c, "")))
        }

        private enhance(lookup: string[], input: string[][], background: string) {
            const output: string[][] = []
            for (var i = -1; i <= input.length + 2; i++) {
                output.push(this.enhanceRow(lookup, i, input, background))
            }

            return output
        }

        private enhanceRow(lookup: string[], row: number, input: string[][], background: string): string[] {
            // Build the lookup row
            const backgroundPad = [background[0], background[0], background[0]]
            const inputRows: string[][] = new Array(3)
            if (row == -1 || row == input.length + 2) {
                inputRows[0] = new Array(input[0].length + 6).fill(background)
                inputRows[1] = new Array(input[0].length + 6).fill(background)
                inputRows[2] = new Array(input[0].length + 6).fill(background)
            }
            else if (row == 0) {
                inputRows[0] = new Array(input[0].length + 6).fill(background)
                inputRows[1] = new Array(input[0].length + 6).fill(background)
                inputRows[2] = new Array(input[0].length + 6);
                [backgroundPad, input[0], backgroundPad].flat().forEach((c, i, _) => inputRows[2][i] = c)
            }
            else if (row == 1) {
                inputRows[0] = new Array(input[0].length + 6).fill(background)
                inputRows[1] = new Array(input[0].length + 6);
                [backgroundPad, input[0], backgroundPad].flat().forEach((c, i, _) => inputRows[1][i] = c)
                inputRows[2] = new Array(input[0].length + 6);
                [backgroundPad, input[1], backgroundPad].flat().forEach((c, i, _) => inputRows[2][i] = c)
            }
            else if (row == input.length - 2 + 2) {
                inputRows[0] = new Array(input[0].length + 6);
                [backgroundPad, input[input.length - 2], backgroundPad].flat().forEach((c, i, _) => inputRows[0][i] = c)
                inputRows[1] = new Array(input[0].length + 6);
                [backgroundPad, input[input.length - 1], backgroundPad].flat().forEach((c, i, _) => inputRows[1][i] = c)
                inputRows[2] = new Array(input[0].length + 6).fill(background)
            }
            else if (row == input.length - 1 + 2) {
                inputRows[0] = new Array(input[0].length + 6);
                [backgroundPad, input[input.length - 1], backgroundPad].flat().forEach((c, i, _) => inputRows[0][i] = c)
                inputRows[1] = new Array(input[0].length + 6).fill(background)
                inputRows[2] = new Array(input[0].length + 6).fill(background)
            }
            else {
                inputRows[0] = new Array(input[0].length + 6);
                [backgroundPad, input[row - 2 + 0], backgroundPad].flat().forEach((c, i, _) => inputRows[0][i] = c)
                inputRows[1] = new Array(input[0].length + 6);
                [backgroundPad, input[row - 2 + 1], backgroundPad].flat().forEach((c, i, _) => inputRows[1][i] = c)
                inputRows[2] = new Array(input[0].length + 6);
                [backgroundPad, input[row - 2 + 2], backgroundPad].flat().forEach((c, i, _) => inputRows[2][i] = c)
            }

            const outputLine = []
            for(var i = 0; i < inputRows[0].length - 2; i++) {
                const sum = this.calculateBlockHash(i, inputRows)
                outputLine.push(lookup[sum])
            }

            return outputLine
        }

        private calculateBlockHash(column: number, input: string[][]) {
            var value = ""
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    value += input[y][column + x] == "." ? "0" : "1"
                }
            }
            const decimalValue = parseInt(value, 2)
            return decimalValue
        }

        protected SAMPLE_DATA: string = 
`
..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###
`;
    }

    (async () => await new Solution().executeAsync())();
}