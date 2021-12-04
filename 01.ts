namespace Problem01 {
    const got = require('got');

    const DEBUG = false;
    const URI_INPUT = "https://adventofcode.com/2021/day/1/input";
    const AOC_AUTHN_COOKIES = require('./authtoken.json');
    const SAMPLE_DATA = [199, 200, 208, 210, 200, 207, 240, 269, 260, 263];

    (async() => {
        // ### Part 1
        const depthReadings = await getInputDataAsync()
        var startTime = performance.now()
        const increasedReadings = depthReadings
            .map((value, index, values) => { return {
                previous: index > 0 ? values[index - 1] : null,
                current: value
            }})
            .map(pair => pair.previous != null && pair.previous < pair.current ? { value: pair.current, increased: true } : { value: pair.current, increased: false })
        const increases = increasedReadings.reduce((previous, current) => previous + (current.increased ? 1 : 0), 0)
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: ${increases} increases observed of ${depthReadings.length} depth values (${elapsed} ms)`)

        // ### Part 2
        startTime = performance.now()
        const windowedDepths = depthReadings
            .map((value, index, values) => {return {
                current: value,
                window: getSumWindow(index, 3, values)
            }})
            .filter(pair => pair.window != null)
            .map((value, index, values) => { return {
                previous: index > 0 ? values[index - 1].window : null,
                current: value.window!
            }})
        const windowedReadings = windowedDepths
            .map(pair => pair.previous != null && pair.previous < pair.current ? { value: pair.current, increased: true } : { value: pair.current, increased: false })
        const windowedIncreases = windowedReadings.reduce((previous, current) => previous + (current.increased ? 1 : 0), 0)
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: ${windowedIncreases} increases observed of ${depthReadings.length} depth values (${elapsed} ms)`)
    })();

    async function getInputDataAsync(): Promise<number[]> {
        if (DEBUG) return SAMPLE_DATA;
        const response = await got(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
        const depthReadings: string[] = response.body.split('\n')
        return depthReadings.map(value => parseInt(value))
    }

    function getSumWindow(index: number, size: number, values: number[]): number|null {
        if (index < (size - 1)) return null;
        var sum = 0
        for (var i = Math.max(0, index - (size - 1)); i <= index; i++) {
            sum += values[i]
        }
        return sum
    }
}