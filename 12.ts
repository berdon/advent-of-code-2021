import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem12 {
    const DAY = 12;
    const DEBUG = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
dc-end
HN-start
start-kj
dc-start
dc-HN
LN-dc
HN-end
kj-sa
kj-HN
kj-dc
`;
    const upperCaseRegEx = new RegExp(/^[A-Z]*$/)
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        var elapsed = (performance.now() - startTime).toFixed(2)
        var paths = generatePaths(data, "start", "end", new Map([[VertexType.Large, 0]]))
        console.log(`Part 1: Number of viable paths is ${paths?.length} (${elapsed} ms)`)

        // Part 2
        var startTime = performance.now()
        var paths = generatePaths(data, "start", "end", new Map([[VertexType.Large, 0], [VertexType.Small, 2]]), true)
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: Number of viable paths is ${paths?.length} (${elapsed} ms)`)
    }

    enum VertexType {
        Small,
        Large,
        Door
    }

    /**
     * DFS searches and tracks all viable paths from the `from` vertex to the `to` vertex allowing for
     * strange AoC visit rules.
     * @param graph Graph of vertices
     * @param from The starting vertex name
     * @param to The final vertex name
     * @param revisitAllowance A map of vertex types to times we're allowed to revisit that vertex type.
     *                         Any vertex types not included will only allow single entry.
     * @param smallCaveEntryLimit Whether we control small cave entry to single access after any small
     *                            cave has been accessed twice.
     * @returns The number of viable paths from `from` to `to`
     */
    function generatePaths(graph: Graph, from: string, to: string, revisitAllowance: Map<VertexType, number>, smallCaveEntryLimit = false): String[][]|null {
        const toVisit: {
            vertex: Vertex,
            visited: Map<string, number>,
            path: String[],
        }[] = [{ vertex: graph.vertices.get(from)!, visited: new Map<string, number>()!, path: [] }]
        const paths = []

        while (toVisit.length > 0) {
            const { vertex, visited, path } = toVisit.shift()!

            // Determine if we've reached our destination
            if (vertex.name == to) {
                paths.push([...path, vertex.name])
                continue
            }

            // Mark the current vertex as visited if we can't revisit
            if (!revisitAllowance.has(vertex.type) || revisitAllowance.get(vertex.type)! > 0) {
                const count = visited.get(vertex.name) ?? 0
                visited.set(vertex.name, count + 1)
            }
            path.push(vertex.name)
            
            // Push all neighbors onto the queue
            let queuedNeighbors =
                [...vertex.neighbors.entries()]
                    .filter(neighbor => {
                        const neighborType = graph.vertices.get(neighbor[0])!.type;

                        // Always allow the door type (which just exists to eliminate small conflicts)
                        if (neighborType == VertexType.Door && neighbor[0] != from) return true

                        // Always allow revisting if the allowance count is 0
                        if (revisitAllowance.get(neighborType) == 0) return true

                        const visitCount = visited.get(neighbor[0]) ?? 0

                        if (smallCaveEntryLimit) {
                            // If we're controlling small cave entry, we block entering a cave more than once
                            // if we've already entered any other small cave more than once
                            const hasVisitedOneSmallCaveTwice = [...visited.entries()].find((v, i, o) => v[1] >= 2)
                            if (neighborType == VertexType.Small && visitCount > 0 && hasVisitedOneSmallCaveTwice) return false
                        }

                        // Lastly, queue any neighbor who we haven't visited too many times
                        return visitCount < (revisitAllowance.get(neighborType) ?? 1)
                    })
                    .map(neighbor => ({ vertex: neighbor[1], visited: new Map(visited), path: [...path] }))
            toVisit.unshift(...queuedNeighbors)
        }

        return paths
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: Graph}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        const data = lines.map(line => line.split("-")).reduce((acc, c) => {
            acc.createConnection(c[0], c[1], true)
            return acc
        }, new Graph());

        return { startTime: startTime, data: data }
    }

    class Vertex {
        public readonly name: string
        public readonly type: VertexType
        public readonly neighbors: Map<string, Vertex> = new Map()

        public isLarge = () => this.type == VertexType.Large
        public isSmall = () => this.type == VertexType.Small

        public constructor(name: string) {
            this.name = name
            this.type = VertexType.Small
            if (name == "start" || name == "end")
                this.type = VertexType.Door
            else if (upperCaseRegEx.test(this.name))
                this.type = VertexType.Large
        }

        public connectTo = (vertex: Vertex, twoWay = false) => {
            this.neighbors.set(vertex.name, vertex)
            if (twoWay)
                vertex.connectTo(this)
        }
        public disconnectFrom = (vertex: Vertex, twoWay = false) => {
            this.neighbors.delete(vertex.name)
            if (twoWay)
                this.neighbors.delete(this.name)
        }
        public toString = () => this.name
    }

    class Graph {
        public readonly vertices: Map<string, Vertex> = new Map()

        public createConnection(fromName: string, toName: string, twoWay = false): { from: Vertex, to: Vertex } {
            let from = this.vertices.has(fromName) ? this.vertices.get(fromName)! : new Vertex(fromName)
            let to = this.vertices.has(toName) ? this.vertices.get(toName)! : new Vertex(toName)
            this.vertices.set(fromName, from)
            this.vertices.set(toName, to)
            from.connectTo(to, twoWay)
            return { from: from, to: to }
        }
    }

    (async () => await main())();
}