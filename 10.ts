import AocSolution from './aoc/AocSolution';
import './collections'

namespace Problem10 {
    type DataType = string[][]
    type Gate = "("|"["|"{"|"<"|">"|"}"|"]"|")"
    class Solution extends AocSolution<DataType> {
        public day: string = "10"
        protected DEBUG: boolean = false
        protected SHOW_WORK: boolean = false

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
            // Generate a stack per set of gates
            var parsingResults = data.map(line => {
                const acc: { stack: Gate[], expected?: Gate, found?: Gate } = { stack: [] }

                // Reduce each gate pushing/popping as we go
                return line.reduceUntil((acc, x) => {
                    const shouldBreak = this.isClosed(x as Gate) && (
                                            acc.stack.length == 0 || !this.isOpposite(acc.stack[acc.stack.length - 1], x as Gate)
                                        )
                    if (!shouldBreak) return null
                    acc.expected = this.oppositeOf(acc.stack[acc.stack.length - 1])
                    acc.found = x as Gate
                    return acc
                }, acc, (acc, x) => {
                    // Push the gate on the stack if it's open
                    if (this.isOpen(x as Gate)) {
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
            var points = corruptedLines.map(x => this.syntaxScore(x.found!))
            // Sum the score
            var score = points.reduce((acc, c) => c + acc, 0)
            return { message: `Illegal syntax score was ${score}`, context: { parsingResults: parsingResults } }
        }

        public async solvePartTwoAsync(data: DataType, { parsingResults }: { parsingResults: {
            stack: Gate[];
            expected?: Gate | undefined;
            found?: Gate | undefined;
        }[] }): Promise<string> {
            // Grab the incomplete lines
            var incompleteLines = parsingResults.filter(x => x.expected == undefined)

            // Walk backwards from our remaining gate stack generating a list of closing gates
            var endcaps = incompleteLines.map(line =>
                line.stack.reduceRight((acc, c) => acc + this.oppositeOf(c as Gate), "")
                        .split("")
                        // Reduce the string of ending gates immediately converting to a score
                        .reduce((acc, c) => acc * 5 + this.endcapScore(c as Gate), 0))
            // Grab the middle score from the sorted list
            var middleScore = endcaps.sort((a, b) => a - b)[Math.floor(endcaps.length / 2)]
            return `Middle endcapping score is ${middleScore}`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines
            return data.map(line => line.split(""));
        }

        private isOpen(gate: Gate) { return gate == "(" || gate == "[" || gate == "{" || gate == "<" }
        private isClosed(gate: Gate) { return !this.isOpen(gate)}
        private isOpposite(a: Gate, b: Gate) {
            return (a == "(" && b == ")") || (a == ")" && b == "(")
                || (a == "[" && b == "]") || (a == "]" && b == "[")
                || (a == "{" && b == "}") || (a == "}" && b == "{")
                || (a == "<" && b == ">") || (a == ">" && b == "<")}
        private oppositeOf(a: Gate) {
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
        private syntaxScore(a: Gate) {
            switch (a) {
                case ")": return 3
                case "]": return 57
                case "}": return 1197
                case ">": return 25137
                default: throw "Erm..."
            }
        }
        private endcapScore(a: Gate) {
            switch (a) {
                case ")": return 1
                case "]": return 2
                case "}": return 3
                case ">": return 4
                default: throw "Erm..."
            }
        }

        protected SAMPLE_DATA: string = 
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
    }

    (async () => await new Solution().executeAsync())();
}