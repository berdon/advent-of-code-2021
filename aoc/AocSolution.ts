import * as got from 'got'
import AOC_AUTHN_COOKIES from '../authtoken.json';
import * as fs from 'fs'
import * as fsAsync from 'fs/promises'

const URI_INPUT = (day: string) => `https://adventofcode.com/2021/day/${day.replace(/^0*/, "")}/input`

export default abstract class AocSolution<T> {
    protected readonly AOC_AUTHN_COOKIES = AOC_AUTHN_COOKIES
    protected abstract DEBUG: boolean
    protected abstract SHOW_WORK: boolean
    protected get inputFilename(): string { return `input/input-${this.day}.txt` }
    protected get outputFilename(): string { return `output/output-${this.day}.md` }

    protected abstract readonly day: string
    protected abstract readonly SAMPLE_DATA: string

    protected abstract solvePartOneAsync(data: T): Promise<{ message: string, context?: any }>
    protected abstract solvePartTwoAsync(data: T, context?: any): Promise<string>

    public async executeAsync(): Promise<void> {
        this.setupProcessStdoutRedirect();

        const data = await this.getInputDataAsync()

        console.log(`# Problem ${this.day}\n`)

        console.log(`## Part 1`)
        var startTime = performance.now()
        const { message: partOneMessage, context } = await this.solvePartOneAsync(data)
        var elapsed = (performance.now() - startTime).toFixed(2)
        if (partOneMessage != null && partOneMessage != "")
            console.log(`${partOneMessage} (${elapsed} ms)`)

        console.log(`\n## Part 2`)
        var startTime = performance.now()
        var partTwoMessage = await this.solvePartTwoAsync(data, context)
        var elapsed = (performance.now() - startTime).toFixed(2)
        if (partTwoMessage != null && partTwoMessage != "")
            console.log(`${partTwoMessage} (${elapsed} ms)`)
    }

    private setupProcessStdoutRedirect() {
        if (!this.DEBUG) {
            const writeStream = fs.createWriteStream(this.outputFilename, { encoding: 'utf8', flags: 'w' });

            var fn = process.stdout.write;

            function write() {
                fn.apply(process.stdout, arguments as any);
                writeStream.write.apply(writeStream, arguments as any);
            }
            process.stdout.write = write as any;
        }
    }

    protected abstract parseData(lines: string[]): T

    protected async getInputDataAsync(): Promise<T> {
        var raw: string
        if (this.DEBUG) {
            raw = this.SAMPLE_DATA
        }
        else if (fs.existsSync(this.inputFilename)) {
            raw = await (await fsAsync.readFile(this.inputFilename)).toString()
        }
        else {
            const response = await got.default(URI_INPUT(this.day), { headers: { Cookie: this.AOC_AUTHN_COOKIES } })
            raw = response.body
            await fsAsync.writeFile(this.inputFilename, raw)
        }
        const lines = raw.split('\n').filter(line => line != "").map(line => line.trim())

        const data = this.parseData(lines)

        return data
    }
}