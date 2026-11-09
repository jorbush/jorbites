/**
 * Self-contained ISO/IEC 18004 QR Code matrix generator (Byte mode, ECC Level L).
 * Supports versions 1 through 10 (up to 271 bytes) so 2FA otpauth:// URLs can be
 * rendered as inline <svg> without external network calls or third-party dependencies.
 */

interface VersionSpec {
    version: number;
    totalDataCodewords: number;
    ecCodewordsPerBlock: number;
    numBlocksGroup1: number;
    dataCodewordsGroup1: number;
    numBlocksGroup2: number;
    dataCodewordsGroup2: number;
    alignmentPatterns: number[];
}

// ECC Level L specifications for Versions 1..10
const VERSION_SPECS_L: VersionSpec[] = [
    {
        version: 1,
        totalDataCodewords: 19,
        ecCodewordsPerBlock: 7,
        numBlocksGroup1: 1,
        dataCodewordsGroup1: 19,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [],
    },
    {
        version: 2,
        totalDataCodewords: 34,
        ecCodewordsPerBlock: 10,
        numBlocksGroup1: 1,
        dataCodewordsGroup1: 34,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 18],
    },
    {
        version: 3,
        totalDataCodewords: 55,
        ecCodewordsPerBlock: 15,
        numBlocksGroup1: 1,
        dataCodewordsGroup1: 55,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 22],
    },
    {
        version: 4,
        totalDataCodewords: 80,
        ecCodewordsPerBlock: 20,
        numBlocksGroup1: 1,
        dataCodewordsGroup1: 80,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 26],
    },
    {
        version: 5,
        totalDataCodewords: 108,
        ecCodewordsPerBlock: 26,
        numBlocksGroup1: 1,
        dataCodewordsGroup1: 108,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 30],
    },
    {
        version: 6,
        totalDataCodewords: 136,
        ecCodewordsPerBlock: 18,
        numBlocksGroup1: 2,
        dataCodewordsGroup1: 68,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 34],
    },
    {
        version: 7,
        totalDataCodewords: 156,
        ecCodewordsPerBlock: 20,
        numBlocksGroup1: 2,
        dataCodewordsGroup1: 78,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 22, 38],
    },
    {
        version: 8,
        totalDataCodewords: 194,
        ecCodewordsPerBlock: 24,
        numBlocksGroup1: 2,
        dataCodewordsGroup1: 97,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 24, 42],
    },
    {
        version: 9,
        totalDataCodewords: 232,
        ecCodewordsPerBlock: 30,
        numBlocksGroup1: 2,
        dataCodewordsGroup1: 116,
        numBlocksGroup2: 0,
        dataCodewordsGroup2: 0,
        alignmentPatterns: [6, 26, 46],
    },
    {
        version: 10,
        totalDataCodewords: 274,
        ecCodewordsPerBlock: 18,
        numBlocksGroup1: 2,
        dataCodewordsGroup1: 68,
        numBlocksGroup2: 2,
        dataCodewordsGroup2: 69,
        alignmentPatterns: [6, 28, 50],
    },
];

// GF(256) log/exp tables with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
    let x = 1;
    for (let i = 0; i < 255; i++) {
        GF_EXP[i] = x;
        GF_LOG[x] = i;
        x <<= 1;
        if (x & 0x100) {
            x ^= 0x11d;
        }
    }
    for (let i = 255; i < 512; i++) {
        GF_EXP[i] = GF_EXP[i - 255];
    }
})();

function gfMul(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function getReedSolomonGeneratorPoly(degree: number): Uint8Array {
    let poly = new Uint8Array([1]);
    for (let i = 0; i < degree; i++) {
        const next = new Uint8Array(poly.length + 1);
        const factor = GF_EXP[i];
        for (let j = 0; j < poly.length; j++) {
            next[j] ^= poly[j];
            next[j + 1] ^= gfMul(poly[j], factor);
        }
        poly = next;
    }
    return poly;
}

function computeReedSolomonRemainder(
    data: Uint8Array,
    ecLength: number
): Uint8Array {
    const generator = getReedSolomonGeneratorPoly(ecLength);
    const remainder = new Uint8Array(ecLength);

    for (let i = 0; i < data.length; i++) {
        const factor = data[i] ^ remainder[0];
        remainder.copyWithin(0, 1);
        remainder[ecLength - 1] = 0;
        for (let j = 0; j < ecLength; j++) {
            remainder[j] ^= gfMul(generator[j + 1], factor);
        }
    }
    return remainder;
}

function selectVersionSpec(byteLength: number): VersionSpec {
    for (const spec of VERSION_SPECS_L) {
        const charCountBits = spec.version <= 9 ? 8 : 16;
        const maxBytes = Math.floor(
            (spec.totalDataCodewords * 8 - 4 - charCountBits) / 8
        );
        if (byteLength <= maxBytes) {
            return spec;
        }
    }
    throw new Error('QR payload exceeds maximum supported length');
}

function encodeDataCodewords(bytes: Uint8Array, spec: VersionSpec): Uint8Array {
    const bits: number[] = [];
    const pushBits = (val: number, len: number) => {
        for (let i = len - 1; i >= 0; i--) {
            bits.push((val >>> i) & 1);
        }
    };

    // Byte mode indicator (0100)
    pushBits(0b0100, 4);
    // Character count indicator
    const charCountBits = spec.version <= 9 ? 8 : 16;
    pushBits(bytes.length, charCountBits);

    for (let i = 0; i < bytes.length; i++) {
        pushBits(bytes[i], 8);
    }

    const maxDataBits = spec.totalDataCodewords * 8;
    const terminatorLen = Math.min(4, maxDataBits - bits.length);
    pushBits(0, terminatorLen);

    while (bits.length % 8 !== 0) {
        bits.push(0);
    }

    const codewords = new Uint8Array(spec.totalDataCodewords);
    const byteCount = bits.length / 8;
    for (let i = 0; i < byteCount; i++) {
        let b = 0;
        for (let j = 0; j < 8; j++) {
            b = (b << 1) | bits[i * 8 + j];
        }
        codewords[i] = b;
    }

    const padBytes = [0xec, 0x11];
    for (let i = byteCount; i < spec.totalDataCodewords; i++) {
        codewords[i] = padBytes[(i - byteCount) % 2];
    }

    return codewords;
}

function interleaveCodewords(
    dataCodewords: Uint8Array,
    spec: VersionSpec
): Uint8Array {
    const dataBlocks: Uint8Array[] = [];
    const ecBlocks: Uint8Array[] = [];
    let offset = 0;

    for (let i = 0; i < spec.numBlocksGroup1; i++) {
        const block = dataCodewords.slice(
            offset,
            offset + spec.dataCodewordsGroup1
        );
        offset += spec.dataCodewordsGroup1;
        dataBlocks.push(block);
        ecBlocks.push(
            computeReedSolomonRemainder(block, spec.ecCodewordsPerBlock)
        );
    }

    for (let i = 0; i < spec.numBlocksGroup2; i++) {
        const block = dataCodewords.slice(
            offset,
            offset + spec.dataCodewordsGroup2
        );
        offset += spec.dataCodewordsGroup2;
        dataBlocks.push(block);
        ecBlocks.push(
            computeReedSolomonRemainder(block, spec.ecCodewordsPerBlock)
        );
    }

    const totalBlocks = spec.numBlocksGroup1 + spec.numBlocksGroup2;
    const totalLength =
        spec.totalDataCodewords + totalBlocks * spec.ecCodewordsPerBlock;
    const result = new Uint8Array(totalLength);
    let idx = 0;

    const maxDataBlockLen = Math.max(
        spec.dataCodewordsGroup1,
        spec.dataCodewordsGroup2
    );
    for (let col = 0; col < maxDataBlockLen; col++) {
        for (let b = 0; b < totalBlocks; b++) {
            if (col < dataBlocks[b].length) {
                result[idx++] = dataBlocks[b][col];
            }
        }
    }

    for (let col = 0; col < spec.ecCodewordsPerBlock; col++) {
        for (let b = 0; b < totalBlocks; b++) {
            result[idx++] = ecBlocks[b][col];
        }
    }

    return result;
}

export function generateQrMatrix(text: string): boolean[][] {
    const bytes = new TextEncoder().encode(text);
    const spec = selectVersionSpec(bytes.length);
    const size = spec.version * 4 + 17;

    const modules: boolean[][] = Array.from({ length: size }, () =>
        Array(size).fill(false)
    );
    const isFunction: boolean[][] = Array.from({ length: size }, () =>
        Array(size).fill(false)
    );

    const setFunctionModule = (r: number, c: number, isDark: boolean) => {
        if (r >= 0 && r < size && c >= 0 && c < size) {
            modules[r][c] = isDark;
            isFunction[r][c] = true;
        }
    };

    // Finder patterns + separators
    const drawFinderPattern = (topRow: number, leftCol: number) => {
        for (let dr = -1; dr <= 7; dr++) {
            for (let dc = -1; dc <= 7; dc++) {
                const r = topRow + dr;
                const c = leftCol + dc;
                const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
                const onBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
                const inCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
                setFunctionModule(r, c, inOuter && (onBorder || inCenter));
            }
        }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, size - 7);
    drawFinderPattern(size - 7, 0);

    // Timing patterns
    for (let i = 8; i < size - 8; i++) {
        setFunctionModule(6, i, i % 2 === 0);
        setFunctionModule(i, 6, i % 2 === 0);
    }

    // Alignment patterns
    const alignCoords = spec.alignmentPatterns;
    for (let i = 0; i < alignCoords.length; i++) {
        for (let j = 0; j < alignCoords.length; j++) {
            // Skip finder pattern corners
            if (
                (i === 0 && j === 0) ||
                (i === 0 && j === alignCoords.length - 1) ||
                (i === alignCoords.length - 1 && j === 0)
            ) {
                continue;
            }
            const centerR = alignCoords[i];
            const centerC = alignCoords[j];
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    const isDark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
                    setFunctionModule(centerR + dr, centerC + dc, isDark);
                }
            }
        }
    }

    // Reserve format information areas & dark module
    for (let i = 0; i <= 8; i++) {
        if (i !== 6) {
            setFunctionModule(8, i, false);
            setFunctionModule(i, 8, false);
        }
    }
    for (let i = 0; i < 8; i++) {
        setFunctionModule(8, size - 1 - i, false);
        setFunctionModule(size - 1 - i, 8, false);
    }
    setFunctionModule(size - 8, 8, true);

    // Encode and place data bits
    const dataCodewords = encodeDataCodewords(bytes, spec);
    const allCodewords = interleaveCodewords(dataCodewords, spec);

    let bitIndex = 0;
    const totalBits = allCodewords.length * 8;

    for (let right = size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < size; vert++) {
            const upward = ((right + 1) & 2) === 0;
            const r = upward ? size - 1 - vert : vert;
            for (let j = 0; j < 2; j++) {
                const c = right - j;
                if (!isFunction[r][c]) {
                    let dark = false;
                    if (bitIndex < totalBits) {
                        const byteVal = allCodewords[bitIndex >>> 3];
                        dark = ((byteVal >>> (7 - (bitIndex & 7))) & 1) === 1;
                        bitIndex++;
                    }
                    // Apply mask pattern 0: (r + c) % 2 === 0
                    if ((r + c) % 2 === 0) {
                        dark = !dark;
                    }
                    modules[r][c] = dark;
                }
            }
        }
    }

    // Write Format Information for ECC Level L (01) and Mask 0 (000)
    // Precomputed BCH(15, 5) masked with 0x5412 for L (01) + Mask 0 (000) -> 0x77c4
    const formatBits = 0x77c4;
    const getFormatBit = (idx: number) => ((formatBits >>> idx) & 1) === 1;

    // Around top-left finder
    for (let i = 0; i <= 5; i++) setFunctionModule(8, i, getFormatBit(i));
    setFunctionModule(8, 7, getFormatBit(6));
    setFunctionModule(8, 8, getFormatBit(7));
    setFunctionModule(7, 8, getFormatBit(8));
    for (let i = 9; i < 15; i++) setFunctionModule(14 - i, 8, getFormatBit(i));

    // Around top-right and bottom-left finders
    for (let i = 0; i < 8; i++)
        setFunctionModule(8, size - 1 - i, getFormatBit(i));
    for (let i = 8; i < 15; i++)
        setFunctionModule(size - 15 + i, 8, getFormatBit(i));
    setFunctionModule(size - 8, 8, true);

    return modules;
}
