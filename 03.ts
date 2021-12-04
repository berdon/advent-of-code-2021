import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem03 {
    const DEBUG = false
    const URI_INPUT = "https://adventofcode.com/2021/day/3/input"
    const URI_SUBMIT = "https://adventofcode.com/2021/day/3/answer"
    const SAMPLE_DATA = [
        "00100",
        "11110",
        "10110",
        "10111",
        "10101",
        "01111",
        "00111",
        "11100",
        "10000",
        "11001",
        "00010",
        "01010",
    ];

    const bitValue = (value: number) => value >= 0 ? 1 : 0;
    const invBitValue = (value: number) => value >= 0 ? 0 : 1;
    const incValue = (value: string, index: number) => value[index] == "0" ? -1 : 1;
    function bitStringToDecimal(value: string): number {
        var number = 0;
        for(var i = 0; i < value.length; i++) {
            number |= parseInt(value[i]) << (value.length - 1 - i)
        }
        return number
    }

    (async() => {
        // ### Part 1
        const data = await getInputDataAsync()
        var startTime = performance.now()
        const empty: number[] = Array(data[0].length).fill(0)
        // Map each bit on to a number and increment the number or decrement the number if the bit is 1 or 0
        // Then update this number for each value in the input data
        // This gives us an array of something like [14, -2, 1, -3, 14]
        // We then convert this array back into a number value by comparing each value, if the value
        // is greater than or equal to 0 it's a 1 (1 was more common) or if it's less than 0 it's a 0
        // (0 was more common)
        const gammaBits = data.reduce((previous, current) => {
            const bitValues = []
            for (var i = 0; i < current.length; i++) {
                bitValues[i] = previous[i] + incValue(current, i)
            }
            return bitValues
        }, empty)

        var gamma = 0;
        var epsilon = 0;

        // Here is where we remap the array above back into a number value
        for (var position = gammaBits.length - 1; position >= 0; position--) {
            // bitValue does the actual comparison, |= does a logical or (really addition in this case)
            // and << shifts the bit left `position` times to build the numerical value
            gamma |= bitValue(gammaBits[gammaBits.length - 1 - position]) << position
            // invBitValue simply does the inverse comparson (~ should invert bits but it didn't seem to work)
            epsilon |= invBitValue(gammaBits[gammaBits.length - 1 - position]) << position
        }

        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Product of gamma and epsilon is ${gamma * epsilon}; (${gamma} x ${epsilon}) (${elapsed} ms)`);

        // ### Part 2
        startTime = performance.now()
        var oxygenDataSet = data;
        var co2DataSet = data;
        for (var bitIndex = 0; bitIndex < data[0].length; bitIndex++) {
            if (oxygenDataSet.length > 1) {
                // Find the most common bit in this position
                var mostCommonBit = oxygenDataSet
                                                 // Grab and parse the bit we care about to an int
                                                 .map(value => parseInt(value[bitIndex]))
                                                 // Do the same most common crap we did above
                                                 .reduce((previous, current) => previous + (current > 0 ? 1 : -1), 0)
                                                 // Convert it back to a 0 or 1 based on commonality
                                                  >= 0 ? 1 : 0
                oxygenDataSet = oxygenDataSet.filter(value => parseInt(value[bitIndex]) == mostCommonBit)
            }
            if (co2DataSet.length > 1) {
                // Was lazy and just found the most common then inverted it
                // (Really it was because I had originally assumed we were working across the entire data set and
                // not individually per "type". So there was a lot of code shuffling and I didn't refactor
                // aftwards ¯\_(ツ)_/¯)
                var mostCommonBit = co2DataSet.map(value => parseInt(value[bitIndex]))
                                              .reduce((previous, current) => previous + (current > 0 ? 1 : -1), 0)
                                              >= 0 ? 1 : 0
                var leastCommonBit = mostCommonBit == 1 ? 0 : 1;
                co2DataSet = co2DataSet.filter(value => parseInt(value[bitIndex]) == leastCommonBit)
            }
        }

        var oxygenGeneratorRating = bitStringToDecimal(oxygenDataSet[0])
        var co2ScrubberRating = bitStringToDecimal(co2DataSet[0])
        elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Oxygen Generator Rating = ${oxygenGeneratorRating}, CO2 Scrubber Rating = ${co2ScrubberRating}`)
        console.log(`        Life Support Rating is ${oxygenGeneratorRating * co2ScrubberRating} (${elapsed} ms)`)
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

    async function getInputDataAsync(): Promise<string[]> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(value => value != "")
        }

        return lines
    }
}