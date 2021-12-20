import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem20 {
    const DAY = 20;
    const DEBUG = false
    const SHOW_WORK = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..###..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#..#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#......#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#.....####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.......##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###
`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()

        const enhancedOne = enhance(data.lookup, data.input, ".")
        const enhancedTwo = enhance(data.lookup, enhancedOne, enhancedOne[0][0])

        const litPixels = litPixelCount(enhancedTwo)

        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Lit pixels after two enhancements is ${litPixels} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()

        var image = enhancedTwo
        for (var i = 2; i < 50; i++) {
            image = enhance(data.lookup, image, image[0][0])
        }

        // display(image, "Final Image")

        const secondLitPixels = litPixelCount(image)
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Lit pixels after two enhancements is ${secondLitPixels} (${elapsed} ms)`)
    }

    function litPixelCount(input: string[][]) {
        return input.reduce((acc, c) => acc + c.reduce((acc, c) => acc + (c == "#" ? 1 : 0), 0), 0)
    }

    function display(input: string[][], title?: string) {
        if (title != undefined) console.log(`${title}:`)
        input.forEach(line => console.log(line.reduce((acc, c) => acc+c, "")))
    }

    function enhance(lookup: string[], input: string[][], background: string) {
        const output: string[][] = []
        for (var i = -1; i <= input.length + 2; i++) {
            output.push(enhanceRow(lookup, i, input, background))
        }

        return output
    }

    function enhanceRow(lookup: string[], row: number, input: string[][], background: string): string[] {
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
            const sum = calculateBlockHash(i, inputRows)
            outputLine.push(lookup[sum])
        }

        return outputLine
    }

    function calculateBlockHash(column: number, input: string[][]) {
        var value = ""
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                value += input[y][column + x] == "." ? "0" : "1"
            }
        }
        const decimalValue = parseInt(value, 2)
        return decimalValue
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: { lookup: string[], input: string[][]}}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const lookup = lines[0].split("")
        const data = lines.slice(1).map(line => line.split(""));

        return { startTime: startTime, data: { lookup: lookup, input: data } }
    }

    (async () => await main())();
}