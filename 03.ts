import AocSolution from './aoc/AocSolution';

namespace Problem03 {
    type DataType = string[]
    class Solution extends AocSolution<DataType> {
        public day: string = "03"

        public async solvePartOneAsync(data: DataType): Promise<{ message: string, context?: any }> {
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
                    bitValues[i] = previous[i] + this.incValue(current, i)
                }
                return bitValues
            }, empty)

            var gamma = 0;
            var epsilon = 0;

            // Here is where we remap the array above back into a number value
            for (var position = gammaBits.length - 1; position >= 0; position--) {
                // bitValue does the actual comparison, |= does a logical or (really addition in this case)
                // and << shifts the bit left `position` times to build the numerical value
                gamma |= this.bitValue(gammaBits[gammaBits.length - 1 - position]) << position
                // invBitValue simply does the inverse comparson (~ should invert bits but it didn't seem to work)
                epsilon |= this.invBitValue(gammaBits[gammaBits.length - 1 - position]) << position
            }

            return { message: `Product of gamma and epsilon is ${gamma * epsilon}; (${gamma} x ${epsilon})` }
        }

        public async solvePartTwoAsync(data: DataType): Promise<string> {
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

            var oxygenGeneratorRating = this.bitStringToDecimal(oxygenDataSet[0])
            var co2ScrubberRating = this.bitStringToDecimal(co2DataSet[0])

            return `Oxygen Generator Rating = ${oxygenGeneratorRating}, CO2 Scrubber Rating = ${co2ScrubberRating}\n`
                 + `        Life Support Rating is ${oxygenGeneratorRating * co2ScrubberRating}`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines
            return data
        }

        private bitValue = (value: number) => value >= 0 ? 1 : 0;
        private invBitValue = (value: number) => value >= 0 ? 0 : 1;
        private incValue = (value: string, index: number) => value[index] == "0" ? -1 : 1;
        private bitStringToDecimal(value: string): number {
            var number = 0;
            for(var i = 0; i < value.length; i++) {
                number |= parseInt(value[i]) << (value.length - 1 - i)
            }
            return number
        }

        protected SAMPLE_DATA: string = "00100\n11110\n10110\n10111\n10101\n01111\n00111\n11100\n10000\n11001\n00010\n01010\n"
    }

    (async () => await new Solution().executeAsync())();
}