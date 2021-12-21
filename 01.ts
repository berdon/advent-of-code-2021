import AocSolution from './aoc/AocSolution';

namespace Problem01 {
    type DataType = number[]
    class Solution extends AocSolution<DataType> {
        public day: string = "01"

        public async solvePartOneAsync(depthReadings: DataType): Promise<{ message: string, context?: any }> {
            const increasedReadings = depthReadings
                .map((value, index, values) => { return {
                    previous: index > 0 ? values[index - 1] : null,
                    current: value
                }})
                .map(pair => pair.previous != null && pair.previous < pair.current ? { value: pair.current, increased: true } : { value: pair.current, increased: false })
            const increases = increasedReadings.reduce((previous, current) => previous + (current.increased ? 1 : 0), 0)
            return { message: `${increases} increases observed of ${depthReadings.length} depth values` }
        }

        public async solvePartTwoAsync(depthReadings: DataType): Promise<string> {
            const windowedDepths = depthReadings
                .map((value, index, values) => {return {
                    current: value,
                    window: this.getSumWindow(index, 3, values)
                }})
                .filter(pair => pair.window != null)
                .map((value, index, values) => { return {
                    previous: index > 0 ? values[index - 1].window : null,
                    current: value.window!
                }})
            const windowedReadings = windowedDepths
                .map(pair => pair.previous != null
                             && pair.previous < pair.current
                                ? { value: pair.current, increased: true }
                                : { value: pair.current, increased: false })
            const windowedIncreases = windowedReadings.reduce((previous, current) => previous + (current.increased ? 1 : 0), 0)
            return `${windowedIncreases} increases observed of ${depthReadings.length} depth values`
        }

        protected parseData(lines: string[]): DataType {
            const data = lines.map(value => parseInt(value))
            return data
        }

        protected SAMPLE_DATA: string = "199\n200\n208\n210\n200\n207\n240\n269\n260\n263";

        private getSumWindow(index: number, size: number, values: number[]): number|null {
            if (index < (size - 1)) return null;
            var sum = 0
            for (var i = Math.max(0, index - (size - 1)); i <= index; i++) {
                sum += values[i]
            }
            return sum
        }
    }

    (async () => await new Solution().executeAsync())();
}