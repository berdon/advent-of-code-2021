declare global {
    export interface Set<T> {
        first(): T
        except(...values: T[]): Set<T>
        except(...set: Set<T>[]): Set<T>
        contains(...set: Set<T>[]): boolean
    }
}

Set.prototype.first = function<T>(): T { return this.values().next().value as T }

Set.prototype.except = function<T>(...values: T[]): Set<T> {
    var newSet = new Set(this.values())
    values.forEach(value => newSet.delete(value))
    return newSet
}

Set.prototype.except = function<T>(...sets: Set<T>[]): Set<T> {
    var newSet = new Set(this.values())
    for (var set of sets) {
        for (var value of set) {
            newSet.delete(value)
        }
    }
    return newSet
}

Set.prototype.contains = function<T>(...sets: Set<T>[]): boolean {
    for (var set of sets) {
        for (var value of set) {
            if (!this.has(value)) return false
        }
    }
    return true
}

export { }