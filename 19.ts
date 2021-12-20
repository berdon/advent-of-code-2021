import AOC_AUTHN_COOKIES from './authtoken.json';
import * as got from "got"
import "./collections"
import PriorityQueue from 'ts-priority-queue'

namespace Problem19 {
    const DAY = 19;
    const DEBUG = false
    const SHOW_WORK = false
    const URI_INPUT = `https://adventofcode.com/2021/day/${DAY}/input`
    const SAMPLE_DATA = 
`
--- scanner 0 ---
404,-588,-901
528,-643,409
-838,591,734
390,-675,-793
-537,-823,-458
-485,-357,347
-345,-311,381
-661,-816,-575
-876,649,763
-618,-824,-621
553,345,-567
474,580,667
-447,-329,318
-584,868,-557
544,-627,-890
564,392,-477
455,729,728
-892,524,684
-689,845,-530
423,-701,434
7,-33,-71
630,319,-379
443,580,662
-789,900,-551
459,-707,401

--- scanner 1 ---
686,422,578
605,423,415
515,917,-361
-336,658,858
95,138,22
-476,619,847
-340,-569,-846
567,-361,727
-460,603,-452
669,-402,600
729,430,532
-500,-761,534
-322,571,750
-466,-666,-811
-429,-592,574
-355,545,-477
703,-491,-529
-328,-685,520
413,935,-424
-391,539,-444
586,-435,557
-364,-763,-893
807,-499,-711
755,-354,-619
553,889,-390

--- scanner 2 ---
649,640,665
682,-795,504
-784,533,-524
-644,584,-595
-588,-843,648
-30,6,44
-674,560,763
500,723,-460
609,671,-379
-555,-800,653
-675,-892,-343
697,-426,-610
578,704,681
493,664,-388
-671,-858,530
-667,343,800
571,-461,-707
-138,-166,112
-889,563,-600
646,-828,498
640,759,510
-630,509,768
-681,-892,-333
673,-379,-804
-742,-814,-386
577,-820,562

--- scanner 3 ---
-589,542,597
605,-692,669
-500,565,-823
-660,373,557
-458,-679,-417
-488,449,543
-626,468,-788
338,-750,-386
528,-832,-391
562,-778,733
-938,-730,414
543,643,-506
-524,371,-870
407,773,750
-104,29,83
378,-903,-323
-778,-728,485
426,699,580
-438,-605,-362
-469,-447,-387
509,732,623
647,635,-688
-868,-804,481
614,-800,639
595,780,-596

--- scanner 4 ---
727,592,562
-293,-554,779
441,611,-461
-714,465,-776
-743,427,-804
-660,-479,-426
832,-632,460
927,-485,-438
408,393,-506
466,436,-512
110,16,151
-258,-428,682
-393,719,612
-211,-452,876
808,-476,-593
-575,615,604
-485,667,467
-680,325,-822
-627,-443,-432
872,-547,-609
833,512,582
807,604,487
839,-516,451
891,-625,532
-652,-548,-490
30,-46,-14
`;
    async function main() {
        // Part 1
        var { startTime, data } = await getInputDataAsync()
        const fingerprints = generateFingerprint(data)

        const matches = new Map<string, { contributingSensors: Set<string>, intersectingDistances: { beacons: Map<string, Set<string>>, distance: number }[] }>()
        for (var scannerAEntry of fingerprints.entries()) {
            const [ scannerAId, fingerprintsA ] = scannerAEntry
            for (var scannerBEntry of fingerprints.entries()) {
                const [ scannerBId, fingerprintsB ] = scannerBEntry
                if (scannerBId <= scannerAId) continue
                const key = `${scannerAId},${scannerBId}`
                const intersectedDistances = new Set(fingerprintsA.keys()).intersect(new Set(fingerprintsB.keys()))

                // Contruct a mapping from a distance [x,y] to b distance [w, z]
                const beaconMapping = [...intersectedDistances.values()].map(distance => {
                    const beaconsA = fingerprintsA.get(distance)!
                    const beaconsB = fingerprintsB.get(distance)!
                    return { beacons: new Map([[scannerAId, beaconsA], [scannerBId, beaconsB]]), distance: distance }
                })

                // s = n(n-1)/2; if n == 12, s >= 66
                if (intersectedDistances.size >= 66) {
                    matches.set(key, {
                        contributingSensors: new Set([scannerAId, scannerBId]),
                        intersectingDistances: beaconMapping
                    })
                }
            }
        }

        // For each viable match, build a parallel graph of matching beacon connections
        const relationshipMapping = generateRelationshipMapping(matches, fingerprints, data)
        const translations = generateTranslations(relationshipMapping).concat(generateTranslations(relationshipMapping, true))
        
        const mappings = translations.reduce((acc, c) => {
            if (!acc.has(c.fromSensor)) acc.set(c.fromSensor, new Map())
            acc.get(c.fromSensor)!.set(c.toSensor, c.mapping)
            return acc
        }, new Map<string, Map<string, (point: Point) => Point>>())

        const vertices = new Map<string, Node<string>>()
        for (var keys of [...matches.keys()].map(key => key.split(","))) {
            var nodeA = vertices.has(keys[0]) ? vertices.get(keys[0])! : vertices.set(keys[0], new Node<string>(keys[0], new Map())).get(keys[0])!
            var nodeB = vertices.has(keys[1]) ? vertices.get(keys[1])! : vertices.set(keys[1], new Node<string>(keys[1], new Map())).get(keys[1])!
            if (!nodeA.edges.has(keys[1])) nodeA.edges.set(keys[1], nodeB)
            if (!nodeB.edges.has(keys[0])) nodeB.edges.set(keys[0], nodeA)
        }

        const scannerPositions = [...data.keys()].map(scannerId => {
            if (scannerId == "Scanner-0") return { scanner: scannerId, position: new Point(0, 0, 0) }
            const path = determinePath(scannerId, "Scanner-0", vertices)
            var last = path[0]
            var point = new Point(0, 0, 0)
            for (const next of path.slice(1)) {
                point = mappings.get(last)!.get(next)!(point)
                last = next
            }
            return { scanner: scannerId, position: point }
        })

        const beaconPositions = [...data.entries()].map(entry => {
            const [ scannerId, beacons ] = entry
            if (scannerId == "Scanner-0") return { scanner: scannerId, beacons: [...beacons.values()].map(beacon => beacon.position!) }
            const path = determinePath(scannerId, "Scanner-0", vertices)
            const translatedBeacons = [...beacons.values()].map(beacon => {
                var last = path[0]
                var point = beacon.position!
                for (const next of path.slice(1)) {
                    point = mappings.get(last)!.get(next)!(point)
                    last = next
                }
                return point
            })
            return { scanner: scannerId, beacons: translatedBeacons }
        })

        const beaconPositionKeys = beaconPositions.map(beacon => beacon.beacons).flat()
            .sort((a, b) => a.z - b.z)
            .sort((a, b) => a.y - b.y)
            .sort((a, b) => a.x - b.x)
            .map(beacon => beacon.toString())
            .reduce((acc, c) => acc.add(c), new Set())

        var elapsed = (performance.now() - startTime).toFixed(2)
        console.log(`Part 1: Number of beacons within the scanner range is ${beaconPositionKeys.size} (${elapsed} ms)`)

        // Part 2 (brute force because fuck this shit)
        var startTime = performance.now()
        var maxDistance = Number.MIN_VALUE
        var maxBeaconA: string|null = null
        var maxBeaconB: string|null = null
        for(const beaconA of scannerPositions) {
            for(const beaconB of scannerPositions) {
                if (beaconA.scanner == beaconB.scanner) continue
                const distance = manhattanDistance(beaconA.position, beaconB.position)
                if (distance > maxDistance) {
                    maxDistance = distance
                    maxBeaconA = beaconA.scanner
                    maxBeaconB = beaconB.scanner
                }
            }
        }
        console.log(`Part 2: Greatest manhattan distance of ${maxDistance} occurs between ${maxBeaconA} and ${maxBeaconB} (${elapsed} ms)`)
    }

    function manhattanDistance(a: Point, b: Point) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)
    }

    function determinePath(from: string, to: string, vertices: Map<string, Node<string>>) {
        const queued = new Set(vertices.keys())
        const distances = new Map<string, number>()
        const previous = new Map<string, string|null>()
        var toVisit = new PriorityQueue({ comparator: function(a: string, b: string) { return distances.get(a)! - distances.get(b)! } })
        for(const v of vertices.keys()) {
            distances.set(v, Number.MAX_VALUE)
            previous.set(v, null)
        }
        distances.set(from, 0)
        toVisit.queue(from)

        while (toVisit.length > 0) {
            const currentKey = toVisit.dequeue()
            queued.delete(currentKey)

            for(const neighbor of [...vertices.get(currentKey)!.edges.values()].filter(edge => queued.has(edge.value))) {
                const altDistance = distances.get(currentKey)! + 1
                if (altDistance < distances.get(neighbor.value)!) {
                    distances.set(neighbor.value, altDistance)
                    previous.set(neighbor.value, currentKey)
                }
                toVisit.queue(neighbor.value)
            }
        }

        const path: string[] = []
        var walker: string|undefined|null = to
        while (!!walker) {
            path.unshift(walker)
            walker = previous.get(walker)
        }

        return path
    }

    class Node<T> {
        public value: T
        public edges: Map<string, Node<T>>

        constructor(value: T, edges: Map<string, Node<T>>) {
            this.value = value
            this.edges = edges
        }
    }

    type Translation = {
        fromSensor: string;
        toSensor: string;
        position: Point;
        mapping: (beacon: Thing) => Point;
        beacons: null;
    }

    function generateFingerprint(data: Map<string, Map<string, Thing>>) {
        return [...data.entries()].reduce((acc, entry) => {
            const [scannerId, beacons] = entry;
            const distanceSet = new Map<number, Set<string>>();
            for (const [aId, a] of beacons) {
                for (const [bId, b] of beacons) {
                    if (aId == bId)
                        continue;
                    // for (var i = 0; i < beacons.length; i++) {
                    //     for (var j = i + 1; j < beacons.length; j++) {
                    // if (i == j) continue
                    // const a = beacons[i]
                    // const b = beacons[j]
                    distanceSet.set(Math.sqrt(
                        Math.pow(a.position!.x - b.position!.x, 2)
                        + Math.pow(a.position!.y - b.position!.y, 2)
                        + Math.pow(a.position!.z - b.position!.z, 2)
                    ), new Set([a.id, b.id]));
                }
            }
            acc.set(scannerId, distanceSet);
            return acc;
        }, new Map<string, Map<number, Set<string>>>());
    }

    function generateRelationshipMapping(matches: Map<string, { contributingSensors: Set<string>; intersectingDistances: { beacons: Map<string, Set<string>>; distance: number; }[]; }>, fingerprints: Map<string, Map<number, Set<string>>>, data: Map<string, Map<string, Thing>>) {
        return [...matches.entries()].map(entry => {
            const [keyPair, { contributingSensors, intersectingDistances }] = entry;
            const beaconToConnectedBeaconByDistance = intersectingDistances.reduce((acc, entry) => {
                for (const sensorId of [...entry.beacons.values()].map(set => [...set.values()]).flat()) {
                    if (!acc.has(sensorId))
                        acc.set(sensorId, new Map<number, string>());
                }
                const connectedBeacons = [...entry.beacons.values()].map(set => [...set.values()]);
                connectedBeacons.forEach(sensorBeacons => {
                    acc.get(sensorBeacons[0]!)!.set(entry.distance, sensorBeacons[1]);
                    acc.get(sensorBeacons[1]!)!.set(entry.distance, sensorBeacons[0]);
                });
                return acc;
            }, new Map<string, Map<number, string>>());

            const beaconToDistanceByConnectedBeacon = intersectingDistances.reduce((acc, entry) => {
                for (const sensorId of [...entry.beacons.values()].map(set => [...set.values()]).flat()) {
                    if (!acc.has(sensorId))
                        acc.set(sensorId, new Map<string, number>());
                }
                const connectedBeacons = [...entry.beacons.values()].map(set => [...set.values()]);
                connectedBeacons.forEach(sensorBeacons => {
                    acc.get(sensorBeacons[0]!)!.set(sensorBeacons[1], entry.distance);
                    acc.get(sensorBeacons[1]!)!.set(sensorBeacons[0], entry.distance);
                });
                return acc;
            }, new Map<string, Map<string, number>>());


            // Now, pick a sensor add it to an array
            const connectedSensorABeacons = new Set<string>();
            const sensorAGraph: { distance: number; to: string; }[] = [];
            const sensorA = contributingSensors.first();
            const startIntersection = intersectingDistances[0];
            const walkerABeacons = [...startIntersection.beacons.get(sensorA)!.values()];
            const startAFrom = walkerABeacons[0];
            const startATo = beaconToConnectedBeaconByDistance.get(startAFrom)!.get(startIntersection.distance)!;
            sensorAGraph.push({ distance: startIntersection.distance, to: startATo });
            connectedSensorABeacons.add(startAFrom);
            var walkerA = startIntersection.beacons.get(sensorA)!.except(new Set([startAFrom])).first();
            while (!connectedSensorABeacons.has(walkerA)) {
                const connectedBeacon = intersectingDistances.find(x => {
                    const connection = x.beacons.get(sensorA)!.except(connectedSensorABeacons);
                    return connection.has(walkerA) && connection.size == 2;
                });
                if (connectedBeacon == null)
                    break;
                const to = connectedBeacon?.beacons.get(sensorA)?.except(new Set([walkerA])).first()!;
                sensorAGraph.push({ distance: connectedBeacon.distance, to: to });
                connectedSensorABeacons.add(walkerA);
                walkerA = to;
            }

            const lastConnectionDistanceA = beaconToDistanceByConnectedBeacon.get(walkerA)!.get(startAFrom)!;
            sensorAGraph.push({ distance: lastConnectionDistanceA, to: startAFrom });

            // Grab the first distance in the sensorA graph
            const sensorB = contributingSensors.except(new Set([sensorA])).first();
            const connectedSensorBBeacons = new Set<string>();
            const sensorBGraph: { distance: number; to: string; }[] = [];

            const walkerBBeacons = [...startIntersection.beacons.get(sensorB)!.values()];
            const startBFrom = walkerBBeacons[0];
            var startBto = beaconToConnectedBeaconByDistance.get(startBFrom)!.get(startIntersection.distance)!;
            var walkerB = startIntersection.beacons.get(sensorB)!.except(new Set([startBFrom])).first();
            const firstStepDistance = sensorAGraph.slice(1)[0].distance;
            const firstWalkerBOptions = fingerprints.get(sensorB)!.get(firstStepDistance);
            const firstBTo = firstWalkerBOptions?.except(new Set([walkerB])).first()!;
            if (beaconToDistanceByConnectedBeacon.get(startBto)?.get(firstBTo) != firstStepDistance) {
                walkerB = startIntersection.beacons.get(sensorB)!.except(new Set([startBto])).first();
                startBto = beaconToConnectedBeaconByDistance.get(startBto)!.get(startIntersection.distance)!;
            }

            sensorBGraph.push({ distance: startIntersection.distance, to: startBto });
            connectedSensorBBeacons.add(startBFrom);

            const firstDistanceCheck = beaconToDistanceByConnectedBeacon.get(walkerB)?.get(startBto);
            for (var walkerAGraphNode of sensorAGraph.slice(1)) {
                const optionSensors = fingerprints.get(sensorB)!.get(walkerAGraphNode.distance);
                const to = optionSensors?.except(new Set([walkerB])).first()!;
                sensorBGraph.push({ distance: walkerAGraphNode.distance, to: to });
                walkerB = to;
            }

            const beaconRelationshipMapping = sensorAGraph.reduce((acc, a, i, _) => {
                const b = sensorBGraph[i];
                const sensorAThing = data.get(sensorA)!.get(a.to);
                const sensorBThing = data.get(sensorB)!.get(b.to);
                acc.set(a.to, { beaconId: sensorBThing?.id!, beacon: sensorBThing!, other: sensorAThing! });
                acc.set(b.to, { beaconId: sensorAThing?.id!, beacon: sensorAThing!, other: sensorBThing! });
                return acc;
            }, new Map<string, { beaconId: string; beacon: Thing; other: Thing; }>())

            // Create a map of sensor/thing to sensor/thing
            for (const sensor of contributingSensors) {
                const other = contributingSensors.except(new Set([sensor])).first();
                if (SHOW_WORK) console.log(`# ${sensor} => ${other}`)
                var walker: { beaconId: string; beacon: Thing; other: Thing; } | null = null;
                const _ = [...beaconRelationshipMapping.entries()].filter(x => x[0].indexOf(sensor) >= 0).map(x => x[1]).forEach(x => {
                    var distance = ""
                    var altDistance = ""
                    if (walker != null) {
                        distance = beaconToDistanceByConnectedBeacon.get(walker.other.id)!.get(x.other.id)?.toString()!
                        altDistance = beaconToDistanceByConnectedBeacon.get(walker.beacon.id)!.get(x.beacon.id)?.toString()!
                    }
                    if (SHOW_WORK)
                        console.log(`[${x.other.id}] ${x.other.toString()} [${distance}] => [${x.beacon.id}] ${x.beacon.toString()} [${altDistance}]`);
                    walker = x
                })
                if (SHOW_WORK) console.log("");
            }

            return { contributingSensors: contributingSensors, mapping: beaconRelationshipMapping };
        });
    }

    function generateTranslations(relationshipMapping: { contributingSensors: Set<string>; mapping: Map<string, { beaconId: string; beacon: Thing; other: Thing; }>; }[], reverse = false) {
        return relationshipMapping.map(relationship => {
            const { contributingSensors, mapping } = relationship;
            const sensorA = !reverse ? contributingSensors.first() : contributingSensors.except(new Set([contributingSensors.first()])).first()
            const sensorB = contributingSensors.except(new Set([sensorA])).first();
            const sensorAEntries = [...mapping.entries()].filter(x => x[0].indexOf(sensorA) >= 0);

            var getPositionMethods = [
                (point: Point) => point,
                (point: Point) => new Point(point.y, point.z, point.x),
                (point: Point) => new Point(point.z, point.x, point.y),
                (point: Point) => new Point(point.x, point.z, point.y),
                (point: Point) => new Point(point.z, point.y, point.x),
                (point: Point) => new Point(point.y, point.x, point.z)
            ];

            var flipPosition = (point: Point, flipX: boolean, flipY: boolean, flipZ: boolean) => new Point(flipX ? -point.x : point.x, flipY ? -point.y : point.y, flipZ ? -point.z : point.z);
            var getPosition: (point: Point) => Point = getPositionMethods.shift()!;
            var sensorAToSensorBTranslation: Point | null = null;
            while (getPositionMethods.length >= 0) {
                const flipX = !sensorAEntries.map(x => getPosition(x[1].beacon.position!).add(x[1].other.position!)).map(x => x.x).every((v, i, a) => v == a[0]);
                const flipY = !sensorAEntries.map(x => getPosition(x[1].beacon.position!).add(x[1].other.position!)).map(x => x.y).every((v, i, a) => v == a[0]);
                const flipZ = !sensorAEntries.map(x => getPosition(x[1].beacon.position!).add(x[1].other.position!)).map(x => x.z).every((v, i, a) => v == a[0]);
                var attempt = sensorAEntries.map(x => flipPosition(getPosition(x[1].beacon.position!), flipX, flipY, flipZ).add(x[1].other.position!));
                if (attempt.every((p, i, a) => p.x == a[0].x && p.y == a[0].y && p.z == a[0].z)) {
                    const convertedThing = new Thing(1, "", attempt[0]);
                    sensorAToSensorBTranslation = convertedThing.position!;
                    const underlyingGetPosition = getPosition;
                    getPosition = (point: Point) => sensorAToSensorBTranslation!.subtract(flipPosition(underlyingGetPosition(point), flipX, flipY, flipZ));
                    break;
                }
                getPosition = getPositionMethods.shift()!;
            }

            if (sensorAToSensorBTranslation == null)
                throw "";

            return {
                fromSensor: sensorB,
                toSensor: sensorA,
                position: new Point(0, 0, 0),
                mapping: getPosition,
                beacons: null
            };
        });
    }

    function translateTo(thing: Thing, toId: String, translations: Translation[]): Thing|null {
        if (thing.id == toId) return thing
        const matchingTranslations = translations.filter(x => x.toSensor === thing.id)
        const direct = matchingTranslations.findIndex(x => x.fromSensor == toId)
        if (direct >= 0) {
            const translation = matchingTranslations.at(direct)
            return new Thing(thing.type, thing.parentId, translation?.mapping(thing)!, thing.id)
        }
        else {
            const queue = [...matchingTranslations]
            while (queue.length > 0) {
                const transientToId = queue.shift()!
                const translatedThing = translateTo(thing, transientToId.fromSensor, translations)
                if (translatedThing != null) return translatedThing
            }
        }

        return null
    }

    class Point {
        public x: number
        public y: number
        public z: number

        constructor(x: number, y: number, z: number) {
            this.x = x
            this.y = y
            this.z = z
        }

        public toString = () => {
            return `${this.x},${this.y},${this.z}`
        }

        public add(b: Point) {
            return new Point(this.x + b.x, this.y + b.y, this.z + b.z)
        }

        public subtract(b: Point) {
            return new Point(this.x - b.x, this.y - b.y, this.z - b.z)
        }

        public negate() {
            return new Point(-this.x, -this.y, -this.z)
        }
    }

    enum ThingType {
        Scanner,
        Beacon
    }

    class Thing {
        public readonly id: string
        public type: ThingType
        public position: Point|null
        public readonly parentId: string

        constructor(type: ThingType, parentId: string, position: Point|null = null, id: string|null = null) {
            this.id = id || `${parentId != null ? `${parentId}/` : ""}${type}-${Thing._id++}`
            this.parentId = parentId
            this.type = type
            this.position = position
        }

        static _id = 0

        public toString = () => {
            return this.position?.toString()
        }
    }

    async function getInputDataAsync(): Promise<{ startTime: number, data: Map<string, Map<string, Thing>>}> {
        var lines: string[]
        if (DEBUG) {
            lines = SAMPLE_DATA.split('\n').filter(line => line != "").map(line => line.trim())
        }
        else {
            const response = await got.default(URI_INPUT, { headers: { Cookie: AOC_AUTHN_COOKIES } })
            lines = response.body.split('\n').filter(line => line != "").map(line => line.trim())
        }

        var startTime = performance.now()

        var currentScanner = -1
        const scanners = new Map<string, Map<string, Thing>>()
        lines.forEach(line => {
            if (line.indexOf("scanner") >= 0) {
                currentScanner++
                return
            }

            const scannerId = `Scanner-${currentScanner}`
            if (!scanners.has(scannerId)) scanners.set(scannerId, new Map())
            const [x, y, z] = line.split(",").map(x => parseInt(x))
            const thing = new Thing(ThingType.Beacon, scannerId, new Point(x, y, z))
            scanners.get(scannerId)?.set(thing.id, thing)
        });

        return { startTime: startTime, data: scanners }
    }

    (async () => await main())();
}