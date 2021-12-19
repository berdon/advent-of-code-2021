import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"

namespace Problem18 {
    const DAY = 18;
    const DEBUG = false
    const SHOW_WORK = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]
`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        const reduced = data.reduce<Node<number>|null>((acc, c) => {
            if (acc == null) return sumNodes(acc!, c.clone())

            if (SHOW_WORK) {
                process.stdout.write("  ")
                displayNode(acc!)
                process.stdout.write("+ ")
                displayNode(c)
            }

            const sum = sumNodes(acc!, c.clone())!

            if (SHOW_WORK) {
                process.stdout.write("= ")
                displayNode(sum)
                console.log("")
            }

            return sum
        }, null)!

        if (SHOW_WORK) displayNode(reduced!)

        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Magnitude is ${magnitude(reduced)} (${elapsed} ms)`)

        // Part 2
        var max = Number.MIN_VALUE
        var [nodeA, nodeB]: [Node<number>|null, Node<number>|null] = [null, null]
        var startTime = performance.now()

        // :try-not-to-cry:
        for(var i = 0; i < data.length; i++) {
            for(var j = 0; j < data.length; j++) {
                if (i == j) continue;
                const calculatedMagnitude = magnitude(sumNodes(data[i].clone(), data[j].clone()))
                if (calculatedMagnitude > max) {
                    nodeA = data[i]
                    nodeB = data[j]
                    max = calculatedMagnitude
                }
            }
        }
        if (SHOW_WORK) {
            displayNode(nodeA!)
            displayNode(nodeB!)
        }
        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 2: For magnitude of ${max} (${elapsed} ms)`)
    }

    class Node<T> {
        public id: number
        public root: Node<T>|null
        public left: Node<T>|null
        public right: Node<T>|null
        public value: T|null

        public constructor(root: Node<T>|null = null, left: Node<T>|null = null, right: Node<T>|null = null, value: T|null = null) {
            this.id = Node._id++
            this.root = root
            this.left = left
            if (left != null) left.root = this
            this.right = right
            if (right != null) right.root = this
            this.value = value
        }

        static _id: number = 0

        public clone(): Node<T> {
            return new Node(this.root, this.left?.clone(), this.right?.clone(), this.value)
        }
    }

    function magnitude(node: Node<number>): number {
        if (node.value != null) return node.value
        return (3 * magnitude(node.left!)) + (2 * magnitude(node.right!))
    }

    function sumNodes(a: Node<number>|null, b: Node<number>|null): Node<number> {
        if (a == null || b == null) return (a ?? b)!
        const sumNode = new Node(null, a, b)
        if (SHOW_WORK) {
            process.stdout.write("after addition: ")
            displayNode(sumNode)
        }
        return reduceNode(sumNode)
    }

    function reduceNode(node: Node<number>): Node<number> {
        while(true) {
            if (explodeFirstNode(node)) {
                if (SHOW_WORK) {
                    process.stdout.write("after explode:  ")
                    displayNode(node)
                }
                continue
            }
            if (splitFirstNode(node)) {
                if (SHOW_WORK) {
                    process.stdout.write("after split:    ")
                    displayNode(node)
                }
                continue
            }
            break
        }

        return node
    }

    function setFirstRightCousin(node: Node<number>, setter: (node: Node<number>) => number) {
        var previous = node
        var walker = previous.root!
        while (walker != null && walker.right!.id == previous.id) {
            previous = walker
            walker = walker.root!
        }
        if (walker == null) return
        walker = walker.right!
        while (walker.value == null) walker = walker.left!
        walker.value = setter(walker)
    }

    function setFirstLeftCousin(node: Node<number>, setter: (node: Node<number>) => number) {
        var previous = node
        var walker = previous.root!
        while (walker != null && walker.left!.id == previous.id) {
            previous = walker
            walker = walker.root!
        }
        if (walker == null) return
        walker = walker.left!
        while (walker.value == null) walker = walker.right!
        walker.value = setter(walker)
    }

    function explodeFirstNode(walker: Node<number>, depth = 0): boolean {
        if (walker.left != null && walker.left.value == null && explodeFirstNode(walker.left, depth + 1)) return true
        if (depth >= 4 && walker.left?.value != null && walker.right?.value != null) {
            setFirstLeftCousin(walker, (node) => node.value! += walker.left?.value!)
            setFirstRightCousin(walker, (node) => node.value! += walker.right?.value!)
            walker.value = 0
            walker.left = null
            walker.right = null
            return true
        }
        if (walker.right != null && walker.right.value == null && explodeFirstNode(walker.right, depth + 1)) return true
        return false
    }

    function splitFirstNode(walker: Node<number>, depth = 0): boolean {
        if (walker.left != null && splitFirstNode(walker.left, depth + 1)) return true
        if (walker.value != null && walker.value >= 10) {
            walker.left = new Node(walker, null, null, Math.floor(walker.value / 2))
            walker.right = new Node(walker, null, null, Math.ceil(walker.value / 2))
            walker.value = null
            return true
        }
        if (walker.right != null && splitFirstNode(walker.right, depth + 1)) return true
        return false
    }

    function displayNode(node: Node<number>, newline = true) {
        process.stdout.write("[")
        if (node.left?.value != null)
            process.stdout.write(`${node.left!.value}`)
        else
            displayNode(node.left!, false)
        process.stdout.write(",")
        if (node.right?.value != null)
            process.stdout.write(`${node.right!.value}`)
        else
            displayNode(node.right!, false)
        process.stdout.write(`]${newline ? "\n" : ""}`)
    }

    var cachedInput: string[]|null = null
    async function getInputDataAsync(): Promise<{ startTime: number, data: Node<number>[]}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else if (cachedInput != null) {
            lines = cachedInput
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
            cachedInput = lines
        }

        var startTime = performance.now()

        const data = lines.map(line => parsePair(line))

        return { startTime: startTime, data: data.map(d => d.node) }
    }

    function parsePair(line: string, root: Node<number>|null = null): { node: Node<number>, line: string } {
        const { node: left, line: rightLine } = parseNumber(line.slice(1), null)
        const { node: right, line: nextLine } = parseNumber(rightLine.slice(1), null)
        return { node: new Node(root, left, right), line: nextLine.slice(1) }
    }

    const regex = /[0-9]+/
    function parseNumber(line: string, root: Node<number>|null): { node: Node<number>, line: string } {
        if (line[0] == "[") return parsePair(line, root)
        
        const value = regex.exec(line)!.at(0)!
        return { node: new Node(root, null, null, parseInt(value)), line: line.slice(value.length) }
    }

    (async () => await main())();
}