import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"
import './collections/SetExtensions'

namespace Problem08 {
    const DAY = 8;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const URI_SUBMIT = `https://adventofcode.com/2021/day/${DAY}/answer`
    const SAMPLE_DATA = 
`
be cfbegad cbdgef fgaecd cgeb fdcge agebfd fecdb fabcd edb | fdgacbe cefdb cefbgd gcbe
edbfga begcd cbg gc gcadebf fbgde acbgfd abcde gfcbed gfec | fcgedb cgb dgebacf gc
fgaebd cg bdaec gdafb agbcfd gdcbef bgcad gfac gcb cdgabef | cg cg fdcagb cbg
fbegcd cbd adcefb dageb afcb bc aefdc ecdab fgdeca fcdbega | efabcd cedba gadfec cb
aecbfdg fbg gf bafeg dbefa fcge gcbea fcaegb dgceab fcbdga | gecf egdcabf bgf bfgea
fgeab ca afcebg bdacfeg cfaedg gcfdb baec bfadeg bafgc acf | gebdcfa ecba ca fadegcb
dbcfg fgd bdegcaf fgec aegbdf ecdfab fbedc dacgb gdcebf gf | cefg dcbef fcge gbcadfe
bdfegc cbegaf gecbf dfcage bdacg ed bedf ced adcbefg gebcd | ed bcgafe cdgba cbgef
egadfb cdbfeg cegd fecab cgb gbdefca cg fgcdab egfdb bfceg | gbdfcae bgc cg cgb
gcafb gcf dcaebfg ecagb gf abcdeg gaef cafbge fdbac fegbdc | fgae cfgab fg bagce
`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        var elapsed = (performance.now() - startTime).toFixed(2)
        var uniqueOutputCount = data.reduce((p, c) => p + c.output.filter(o => o.length == 2 || o.length == 3 || o.length == 4 || o.length == 7).length, 0)
        console.log(`Part 1: Number of unique (1, 4, 7, 8) digits in the output is ${uniqueOutputCount} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        var result = data.map(entry => evaluateEntry(entry)).reduce((p, c) => p + c, 0)
        console.log(`Part 2: Sum of translated outputs is ${result} (${elapsed} ms)`)
    }

    /**
     * Generate a Set<Segment> from a digits string (abcfg)
     * @param digits A digit string
     * @returns Set<Segment> of individual wire segments
     */
    function digitsToSegmentSet(digits: string): Set<Segment> { return new Set(digits.split("").map(c => c as Segment)) }

    /**
     * Returns the expected digit based on the length
     * @param length The length of the segment wire encoding
     * @returns A valid length given a unique segment wire encoding or throws
     */
    function lengthToDigit(length: number): number {
        if (length == 2) return 1
        if (length == 3) return 7
        if (length == 4) return 4
        if (length == 7) return 8
        throw "Non-unique digit length"
    }

    /**
     * Evaluates a given input/output entry by working from unique segment encodings to determine
     * the full wire segment mapping.
     * @param entry input/output wire segment encoding
     * @returns The numerical value of the output value decoded from the 7-segment displays
     */
    function evaluateEntry({ input, output }: { input: string[], output: string[] }): number {
        var allDigits = input.concat(output)
        var uniqueDigits = input.concat(output).filter(o => o.length == 2 || o.length == 3 || o.length == 4 || o.length == 7)
        var numberWires: { [Key: number]: Set<Segment>|null } = { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null }

        // Iterate through each unique digit and add the known wires
        for (var digit of uniqueDigits)
            numberWires[lengthToDigit(digit.length)] = digitsToSegmentSet(digit)
        
        // We build a list of known sets of wires that correspond to known wire mappings
        // CF is the easiest
        var cf = numberWires[1]!
        // We can discern the A mapping by subtracting the CF wire set from the 7 wire set
        var a = new Set([numberWires[7]!.except(cf).first()])
        // BD from 4 less CF
        var bd = numberWires[4]!.except(cf)
        // EG from 8 less CF, BD and A
        var eg = numberWires[8]!.except(cf, bd, a)

        // Find a 9 encoding by looking for a 6 wire digit with CF, A and BD that has only
        // one wire left if we subtract those same wires
        var isNine = (digit: string) => 
            digit.length == 6
            && digitsToSegmentSet(digit).contains(cf, a, bd)
            && digitsToSegmentSet(digit).except(cf, a, bd).size == 1
        var nine = digitsToSegmentSet(allDigits.find(digit => isNine(digit))!)

        // We can now discern G and E by using the 9 encoding
        var g = new Set([new Set(nine).except(cf, a, bd).first()])
        var e = new Set([eg.except(g).first()])
        
        // Same as above, find a 3
        var isThree = (digit: string) =>
            digit.length == 5
            && digitsToSegmentSet(digit).contains(cf, g, a)
            && digitsToSegmentSet(digit).except(cf, g, a).size == 1
        var three = digitsToSegmentSet(allDigits.find(digit => isThree(digit))!)

        // Determine D and B from 3
        var d = new Set([new Set(three).except(cf, g, a).first()])
        var b = new Set([numberWires[4]!.except(cf, d).first()])

        // Find a two encoding
        var isTwo = (digits: string) =>
            digits.length == 5
            && digitsToSegmentSet(digits).contains(a, d, g, e)
            && digitsToSegmentSet(digits).except(a, d, g, e).size == 1
        var two = digitsToSegmentSet(allDigits.find(digit => isTwo(digit))!)

        // Finish up by determining C and F
        var c = new Set([new Set(two).except(a, d, g, e).first()])
        var f = new Set([cf.except(c).first()])

        // Build a mapping of expected wire locations to the faulty locations
        var map: { [Key: string]: string } = {
            a: a.first(),
            b: b.first(),
            c: c.first(),
            d: d.first(),
            e: e.first(),
            f: f.first(),
            g: g.first()
        }

        // Reverse it so we have a lookup to go from bad to good to translate segments
        var reverseMap: { [Key: string]: string } = { }
        Object.keys(map).forEach(key => reverseMap[map[key]] = key)

        return output
            .map(digit => digit.split("").map(char => reverseMap[char]).reduce((p, c) => p + c, ""))
            .map(digit => digitToNumber(digit))
            .reduce((p, c) => (10 * p) + c)
    }

    function digitToNumber(digit: string): number {
        var digit = digit.split("").sort().reduce((p, c) => p + c, "")
        if (digit == "abcefg") return 0
        if (digit == "cf") return 1
        if (digit == "acdeg") return 2
        if (digit == "acdfg") return 3
        if (digit == "bcdf") return 4
        if (digit == "abdfg") return 5
        if (digit == "abdefg") return 6
        if (digit == "acf") return 7
        if (digit == "abcdefg") return 8
        return 9
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: { input: string[], output: string[] }[]}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = lines.map(line => {
            var io = line.split(' | ').map(io => io.split(" "))
            return { input: io[0], output: io[1] }
        });

        return { startTime: startTime, data: data }
    }

    type Segment = "a"|"b"|"c"|"d"|"e"|"f"|"g"

    (async () => await main())();
}