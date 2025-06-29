// patch utils

const DEFAULT_DIFF_TYPE = 'unified'
const DEFAULT_THRESHOLD = 0.2

function parseLine(line) {
    const match = line.match(/^([\+\- ])(.*)$/)
    if (!match) return [' ', line]
    const [_, type, content] = match
    return [type, content]
}

// turn diff into array of chunks
// chunks are arrays of lines
function parseUnifiedDiff(diff) {
    // accumulate chunks
    const lines = diff.split('\n')
    const chunks = []

    // current chunk state
    let current = { orig: [], diff: []}
    let nempty = 0

    // is empty chunk
    function isEmptyChunk() {
        return current.orig.length == 0 && current.diff.length == 0
    }

    // storing a chunk
    function storeChunk() {
        if (isEmptyChunk()) return
        if (nempty > 0) {
            current.orig = current.orig.slice(0, -nempty)
            current.diff = current.diff.slice(0, -nempty)
            nempty = 0
        }
        chunks.push(current)
        current = { orig: [], diff: [] }
    }

    // collect all chunks
    for (const line of lines) {
        // skip header lines
        if (
            line.startsWith('---') ||
            line.startsWith('+++') ||
            line.match(/^ *```/)
        ) {
            continue
        }

        // handle chunk start/body
        if (line.startsWith('@@') && line.endsWith('@@')) {
            storeChunk()
        } else {
            // handle empty line trimming
            const length = line.trim().length
            if (length == 0) {
                if (isEmptyChunk()) continue
                nempty++
            } else {
                nempty = 0
            }

            // store line
            current.diff.push(line)
            const [type, content] = parseLine(line)
            if (type == ' ' || type == '-') current.orig.push(content)
        }
    }

    // store last chunk and return
    storeChunk()
    return chunks
}

// trim whitespace-only lines from start and end
function trimNewlines(lines) {
    if (lines.length == 0) return lines

    // trim leading newlines
    let start = 0
    while (start < lines.length && lines[start].trim().length == 0) {
        start++
    }

    // trim trailing newlines 
    let end = lines.length
    while (end > start && lines[end - 1].trim().length == 0) {
        end--
    }

    return lines.slice(start, end)
}

function parseBlockDiff(diff) {
    const lines = diff.split('\n')
    const chunks = []

    // current chunk state
    let current = null

    // storing a chunk
    function storeChunk() {
        if (current == null) return
        if (current.diff == null) current.diff = []
        current.orig = trimNewlines(current.orig)
        current.diff = trimNewlines(current.diff)
        chunks.push(current)
        current = null
    }

    // collect all chunks
    for (const line of lines) {
        if (line.startsWith('<<<<<<<')) {
            current = { orig: [] }
        } else if (line.startsWith('=======')) {
            current.diff = []
        } else if (line.startsWith('>>>>>>>')) {
            storeChunk()
        } else {
            if (current == null) continue
            if (current.diff == null) {
                current.orig.push(line)
            } else {
                current.diff.push(line)
            }
        }
    }

    // return chunks
    return chunks
}

function parseDiff(diff, { diff_type = DEFAULT_DIFF_TYPE }) {
    if (diff_type == 'unified') {
        return parseUnifiedDiff(diff)
    } else if (diff_type == 'block') {
        return parseBlockDiff(diff)
    } else {
        throw new Error(`Unknown diff type: ${diff_type}`)
    }
}

class CountMap extends Map {
    constructor(items = []) {
        super(items)
    }

    inc(key, num = 1) {
        const count = this.get(key) ?? 0
        const newCount = count + num
        this.set(key, newCount)
        return newCount
    }

    dec(key, num = 1) {
        const count = this.get(key) ?? 0
        const newCount = count - num
        this.set(key, newCount)
        return newCount
    }

    get(key) {
        return super.get(key) ?? 0
    }
}

function charHist(text) {
    const hist = new CountMap()
    for (const char of text) {
        hist.inc(char)
    }
    return hist
}

function histDiff(text1, text2) {
    // knock out joker cases
    if (text1 == text2) return 0
    if (text1.length == 0) return text2.length
    if (text2.length == 0) return text1.length

    // compute character histograms
    const hist1 = charHist(text1)
    const hist2 = charHist(text2)
    const chars = new Set([...hist1.keys(), ...hist2.keys()])

    // compute character histogram difference
    let diff = 0
    for (const char of chars) {
        const num1 = hist1.get(char)
        const num2 = hist2.get(char)
        diff += Math.abs(num1 - num2)
    }

    // return total difference
    return diff
}

// `chunk` and `lines` are arrays of strings
// this ignore whitespace when matching
function matchChunk(chunk, lines, { threshold = DEFAULT_THRESHOLD }) {
    const nchunk = chunk.length
    const nlines = lines.length

    // init potential match points
    let deltas = new CountMap()
    for (let i = 0; i < nlines; i++) {
        deltas.set(i, 0)
    }

    // iteratively reject match points
    let total = 0
    for (const line of chunk) {
        // if no match points, break
        if (deltas.size == 0) break
        total += line.length

        // check current line match
        const marked = new Set()
        for (const [num, count] of deltas) {
            const pos = lines[num] ?? ''
            const ldiff = histDiff(pos, line)
            const tdiff = deltas.inc(num, ldiff)

            // if tdiff is too high, mark the point
            if (tdiff > threshold * total) {
                marked.add(num)
            }
        }

        // terminate with extreme prejudice
        for (const num of marked) {
            deltas.delete(num)
        }

        // increment match points
        deltas = new CountMap([...deltas].map(([k, v]) => [k + 1, v]))
    }

    // get matches sorted by total difference (descending)
    const matches = [...deltas]
        .map(([k, v]) => [k - nchunk, v])
        .sort((a, b) => b[1] - a[1])

    // handle multiple matches
    if (matches.length > 1) {
        console.log('Patch Warning: multiple matches found for chunk: ', chunk)
    } else if (matches.length == 0) {
        console.log('Patch Error: no matches found for chunk: ', chunk)
        return null
    }

    // return best match (total difference)
    return matches[0][0]
}

function applyUnifiedChunk(chunk, lines, { threshold = DEFAULT_THRESHOLD }) {
    const { orig, diff } = chunk

    // find best matching section
    let pos = matchChunk(orig, lines, { threshold })
    if (pos == null) return lines

    // apply diff
    for (const line of diff) {
        const [type, content] = parseLine(line)
        if (type == '+') {
            lines.splice(pos, 0, content)
            pos++
        } else if (type == '-') {
            lines.splice(pos, 1)
        } else if (type == ' ') {
            lines[pos] = content
            pos++
        }
    }

    // return updated lines
    return lines
}

function applyBlockChunk(chunk, lines, { threshold = DEFAULT_THRESHOLD }) {
    const { orig, diff } = chunk

    // find best matching section
    const pos = matchChunk(orig, lines, { threshold })
    if (pos == null) return lines

    // substitute new lines
    return [
        ...lines.slice(0, pos),
        ...diff,
        ...lines.slice(pos + orig.length)
    ]
}

function applyChunk(chunk, lines, { diff_type = DEFAULT_DIFF_TYPE, threshold = DEFAULT_THRESHOLD }) {
    if (diff_type == 'unified') {
        return applyUnifiedChunk(chunk, lines, { threshold })
    } else if (diff_type == 'block') {
        return applyBlockChunk(chunk, lines, { threshold })
    } else {
        throw new Error(`Unknown diff type: ${diff_type}`)
    }
}

function applyDiff(diff, text, { threshold = DEFAULT_THRESHOLD, diff_type = DEFAULT_DIFF_TYPE }) {
    let lines = text.split('\n')
    const chunks = parseDiff(diff, { diff_type })
    for (const chunk of chunks) {
        lines = applyChunk(chunk, lines, { threshold, diff_type })
    }
    return lines.join('\n')
}

export { applyDiff }
