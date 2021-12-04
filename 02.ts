import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem02 {
    const DEBUG = false
    const URI_INPUT = "https://adventofcode.com/2021/day/2/input"
    const URI_SUBMIT = "https://adventofcode.com/2021/day/2/answer"
    const SAMPLE_DATA = [
        "forward 5",
        "down 5",
        "forward 8",
        "up 3",
        "down 8",
        "forward 2",
    ];

    (async() => {
        // ### Part 1
        const data = await getInputDataAsync()
        var startTime = performance.now()
        var horizontalPosition = 0
        var depth = 0
        data.forEach(command => {
            switch (command.direction) {
                case "forward": horizontalPosition += command.amount; break
                case "down": depth += command.amount; break
                case "up": depth -= command.amount; break
            }
        })
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Product of position and depth is ${horizontalPosition * depth} (${elapsed} ms)`)

        // ### Part 2
        startTime = performance.now()
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
        elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Product of position and depth is ${horizontalPosition * depth} (${horizontalPosition} x ${depth}) (${elapsed} ms)`)
    })();

    async function submitAnswerAsync(value: string, part: string) {
        try {
            const response = await got.post(URI_SUBMIT, {
                json: { level: part, answer: value } as any,
                headers: { Cookie: AOC_AUTHN_COOKIES }
            })
            console.log(response.statusCode);
        } catch (error) {
            console.log(error)
        }
    }

    async function getInputDataAsync(): Promise<{ direction: "forward"|"down"|"up", amount: number }[]> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n')
        }

        
        const data = lines.map(line => {
            const tokens = line.split(" ")
            return { direction: tokens[0] as "forward"|"down"|"up", amount: parseInt(tokens[1]) }
        })

        return data
    }
}