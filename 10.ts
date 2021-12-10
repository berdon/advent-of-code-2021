import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"
import './collections'

namespace Problem10 {
    const DAY = 10;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
[({(<(())[]>[[{[]{<()<>>
[(()[<>])]({[<{<<[]>>(
{([(<{}[<>[]}>{[]{[(<()>
(((({<>}<{<{<>}{[]{[]{}
[[<[([]))<([[{}[[()]]]
[{[{({}]{}}([{[{{{}}([]
{<[[]]>}<{[{[{[]{()[[[]
[<(<(<(<{}))><([]([]()
<{([([[(<>()){}]>(<<{{
<{([{{}}[<[[[<>{}]]]>[]]
`;
    type Gate = "("|"["|"{"|"<"|">"|"}"|"]"|")"
    function isOpen(gate: Gate) { return gate == "(" || gate == "[" || gate == "{" || gate == "<" }
    function isClosed(gate: Gate) { return !isOpen(gate)}
    function isOpposite(a: Gate, b: Gate) {
        return (a == "(" && b == ")") || (a == ")" && b == "(")
            || (a == "[" && b == "]") || (a == "]" && b == "[")
            || (a == "{" && b == "}") || (a == "}" && b == "{")
            || (a == "<" && b == ">") || (a == ">" && b == "<")}
    function oppositeOf(a: Gate) {
        switch (a) {
            case "(": return ")"
            case ")": return "("
            case "[": return "]"
            case "]": return "["
            case "{": return "}"
            case "}": return "{"
            case "<": return ">"
            case ">": return "<"
            default: throw "Huh?"
        }
    }
    function syntaxScore(a: Gate) {
        switch (a) {
            case ")": return 3
            case "]": return 57
            case "}": return 1197
            case ">": return 25137
            default: throw "Erm..."
        }
    }
    function endcapScore(a: Gate) {
        switch (a) {
            case ")": return 1
            case "]": return 2
            case "}": return 3
            case ">": return 4
            default: throw "Erm..."
        }
    }

    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        var elapsed = (performance.now() - startTime).toFixed(2)

        // Generate a stack per set of gates
        var parsingResults = data.map(line => {
            const acc: { stack: Gate[], expected?: Gate, found?: Gate } = { stack: [] }

            // Reduce each gate pushing/popping as we go
            return line.reduceUntil((acc, x) => {
                const shouldBreak = isClosed(x as Gate) && (
                                        acc.stack.length == 0 || !isOpposite(acc.stack[acc.stack.length - 1], x as Gate)
                                    )
                if (!shouldBreak) return null
                acc.expected = oppositeOf(acc.stack[acc.stack.length - 1])
                acc.found = x as Gate
                return acc
            }, acc, (acc, x) => {
                // Push the gate on the stack if it's open
                if (isOpen(x as Gate)) {
                    acc.stack.push(x as Gate)
                }
                else {
                    // Pop the gate if it's closed - we know it's the right gate to pop
                    // as we didn't bail out from our reducer predicate above
                    acc.stack.pop()
                }
                return acc
            })
        })
        // Grab the corrupted lines
        var corruptedLines = parsingResults.filter(x => x.expected != undefined)
        // Map the lines to points
        var points = corruptedLines.map(x => syntaxScore(x.found!))
        // Sum the score
        var score = points.reduce((acc, c) => c + acc, 0)
        console.log(`Part 1: Illegal syntax score was ${score} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()

        // Grab the incomplete lines
        var incompleteLines = parsingResults.filter(x => x.expected == undefined)

        // Walk backwards from our remaining gate stack generating a list of closing gates
        var endcaps = incompleteLines.map(line =>
            line.stack.reduceRight((acc, c) => acc + oppositeOf(c as Gate), "")
                      .split("")
                      // Reduce the string of ending gates immediately converting to a score
                      .reduce((acc, c) => acc * 5 + endcapScore(c as Gate), 0))
        // Grab the middle score from the sorted list
        var middleScore = endcaps.sort((a, b) => a - b)[Math.floor(endcaps.length / 2)]

        console.log(`Part 2: Middle endcapping score is ${middleScore} (${elapsed} ms)`)
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: string[][]}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = lines.map(line => line.split(""));

        return { startTime: startTime, data: data }
    }

    (async () => await main())();
}