const LETTERS =
    /[^a-zA-Z\u00C0-\u024F\u3040-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF\s]/g;

export function collapseSpace(value: string) {
    return value.replace(/\s+/g, ' ').trim();
}

export function cleanAnswer(value: string) {
    return collapseSpace(value.replace(LETTERS, ''));
}

export function normalizeAnswer(value: string) {
    return cleanAnswer(value).toLocaleLowerCase();
}

export function answersMatch(left: string, right: string) {
    return normalizeAnswer(left) === normalizeAnswer(right);
}

function escapeUnicode(value: string) {
    return value.replace(/[^\u0000-\u007F]/g, (char) => {
        return '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0');
    });
}

export function encodeWord(word: string) {
    const cleaned = cleanAnswer(word.toLocaleLowerCase());
    if (!cleaned) return '';
    return escapeUnicode(cleaned);
}

export function formatMinutes(minutes: number) {
    if (minutes <= 0) return 'Due now';
    if (minutes < 60) {
        const rounded = Math.max(1, Math.round(minutes));
        return `Due in ${rounded} min`;
    }
    if (minutes < 60 * 24) {
        const hours = Math.round(minutes / 60);
        return `Due in ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    if (minutes < 60 * 24 * 7) {
        const days = Math.round(minutes / 1440);
        return `Due in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
    const weeks = Math.max(1, Math.round(minutes / 10080));
    return `Due in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
}

export type AlignmentRange = {
    original: { start: number; end: number };
    translated: { start: number; end: number };
};

export function parseAlignment(alignment?: string | null): AlignmentRange[] {
    if (!alignment) return [];

    return alignment.split(' ').flatMap((item) => {
        const [original, translated] = item.split('-');
        if (!original || !translated) return [];
        const [originalStart, originalEnd] = original.split(':');
        const [translatedStart, translatedEnd] = translated.split(':');
        if (
            originalStart === undefined ||
            originalEnd === undefined ||
            translatedStart === undefined ||
            translatedEnd === undefined
        ) {
            return [];
        }

        return [{
            original: { start: Number(originalStart), end: Number(originalEnd) },
            translated: { start: Number(translatedStart), end: Number(translatedEnd) },
        }];
    });
}

function overlapLength(start: number, end: number, otherStart: number, otherEnd: number) {
    const from = Math.max(start, otherStart);
    const to = Math.min(end, otherEnd);
    return to >= from ? to - from + 1 : 0;
}

type WordSpan = {
    text: string;
    start: number;
    end: number;
};

const ENGLISH_FUNCTION_WORDS = new Set(
    'the a an of to in on at for and or but as by from with was were is are be been it its his her their this that not no into onto over than then if so'
        .split(' '),
);

const FUNCTION_WORDS = new Set(
    [
        'a al del de el la los las lo un una unos unas y o u e en con por para que se le les su sus mi tu me te nos os',
        'le la les un une des de du au aux à et ou en dans pour que se ne ce',
        'der die das den dem des ein eine einer einem einen und oder zu zum zur in im am an auf mit von vom für',
        'o a os as um uma de do da dos das e ou em no na nos nas para que se',
        'il lo la i gli le un una di del della dei delle e o in nel nella a al alla da per che si',
    ].join(' ').split(' '),
);

function wordSpans(text: string, offset: number) {
    return [...text.matchAll(/\S+/g)].map((match) => {
        const value = match[0];
        const index = match.index ?? 0;
        return {
            text: value,
            start: offset + index,
            end: offset + index + value.length - 1,
        };
    });
}

function trimHint(value: string) {
    const trimmed = value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').trim();
    return trimmed || undefined;
}

function wordKey(value: string) {
    return value.toLocaleLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

function covers(spanStart: number, spanEnd: number, rangeStart: number, rangeEnd: number) {
    const overlap = overlapLength(spanStart, spanEnd, rangeStart, rangeEnd);
    const spanLength = spanEnd - spanStart + 1;
    const rangeLength = rangeEnd - rangeStart + 1;
    if (overlap <= 0 || rangeLength <= 0) return false;
    if (spanLength > 2 && overlap <= 1) return false;
    return overlap / spanLength >= 0.5 || overlap / rangeLength >= 0.5;
}

function wordsInside(words: WordSpan[], rangeStart: number, rangeEnd: number) {
    return words.filter((word) => covers(word.start, word.end, rangeStart, rangeEnd));
}

function usableRange(range: AlignmentRange) {
    return [range.original.start, range.original.end, range.translated.start, range.translated.end]
        .every((value) => Number.isFinite(value))
        && range.original.end >= range.original.start
        && range.translated.end >= range.translated.start;
}

function ownerAt(words: WordSpan[], projected: number) {
    return words.find((word) => projected >= word.start && projected <= word.end)
        ?? words.find((word) => word.start > projected)
        ?? words[words.length - 1];
}

function addLink(
    english: WordSpan,
    spanish: WordSpan,
    links: Map<number, WordSpan[]>,
    owners: Map<number, WordSpan[]>,
) {
    if (!trimHint(spanish.text)) return;
    const bucket = links.get(english.start);
    if (bucket) bucket.push(spanish);
    else links.set(english.start, [spanish]);

    const owner = owners.get(spanish.start);
    if (owner) {
        if (!owner.some((word) => word.start === english.start)) owner.push(english);
    } else {
        owners.set(spanish.start, [english]);
    }
}

function linkedWords(originalWords: WordSpan[], translatedWords: WordSpan[], ranges: AlignmentRange[]) {
    const links = new Map<number, WordSpan[]>();
    const owners = new Map<number, WordSpan[]>();

    for (const range of ranges) {
        if (!usableRange(range)) continue;
        const spanish = wordsInside(originalWords, range.original.start, range.original.end);
        const english = wordsInside(translatedWords, range.translated.start, range.translated.end);
        if (spanish.length === 0 || english.length === 0) continue;

        if (english.length === 1) {
            spanish.forEach((word) => addLink(english[0], word, links, owners));
            continue;
        }

        const sourceLength = range.original.end - range.original.start + 1;
        const targetLength = range.translated.end - range.translated.start + 1;
        for (const word of spanish) {
            const center = (word.start + word.end) / 2;
            const projected = range.translated.start + ((center - range.original.start) / sourceLength) * targetLength;
            const owner = ownerAt(english, projected);
            if (owner) addLink(owner, word, links, owners);
        }
    }

    return { links, owners };
}

function isEnglishFunction(word: WordSpan) {
    return ENGLISH_FUNCTION_WORDS.has(wordKey(word.text));
}

function isFunction(word: WordSpan) {
    return FUNCTION_WORDS.has(wordKey(word.text));
}

function expandFunctionPhrase(
    clicked: WordSpan,
    selected: WordSpan[],
    originalWords: WordSpan[],
    owners: Map<number, WordSpan[]>,
) {
    if (selected.length === 0 || isEnglishFunction(clicked) || selected.some((word) => !isFunction(word))) {
        return selected;
    }

    const last = selected.reduce((later, word) => word.start > later.start ? word : later);
    const startIndex = originalWords.findIndex((word) => word.start === last.start) + 1;
    const extra: WordSpan[] = [];

    for (let index = startIndex; index < originalWords.length && extra.length < 3; index += 1) {
        const word = originalWords[index];
        if (!trimHint(word.text)) break;
        const claimed = (owners.get(word.start) ?? []).some((owner) =>
            owner.start !== clicked.start && !isEnglishFunction(owner));
        if (claimed) break;
        extra.push(word);
        if (!isFunction(word)) return [...selected, ...extra];
    }

    return selected;
}

function betterRun(next: WordSpan[], current: WordSpan[]) {
    const nextContent = next.some((word) => !isFunction(word));
    const currentContent = current.some((word) => !isFunction(word));
    if (nextContent !== currentContent) return nextContent;
    return next.length > current.length;
}

function hintPhrase(original: string, selected: WordSpan[], words: WordSpan[]) {
    if (selected.length === 0) return undefined;
    const sorted = [...selected].sort((left, right) => left.start - right.start);
    const unique = sorted.filter((word, index) => index === 0 || word.start !== sorted[index - 1].start);
    const runs: WordSpan[][] = [];
    let current: WordSpan[] = [];
    let previousIndex = -1;

    for (const word of unique) {
        const index = words.findIndex((item) => item.start === word.start);
        const gap = words.slice(previousIndex + 1, index).some((item) => trimHint(item.text));
        if (current.length > 0 && gap) {
            runs.push(current);
            current = [];
        }
        current.push(word);
        previousIndex = index;
    }
    if (current.length > 0) runs.push(current);

    const run = runs.reduce((chosen, next) => betterRun(next, chosen) ? next : chosen);
    return trimHint(original.slice(run[0].start, run[run.length - 1].end + 1));
}

export function alignedHint(
    original: string,
    translated: string,
    ranges: AlignmentRange[],
    start: number,
    end: number,
) {
    const originalWords = wordSpans(original, 0);
    const translatedWords = wordSpans(translated, 0);
    const clicked = translatedWords.find((word) => word.start === start && word.end === end)
        ?? translatedWords.find((word) => overlapLength(start, end, word.start, word.end) > 0);
    if (!clicked) return undefined;

    const { links, owners } = linkedWords(originalWords, translatedWords, ranges);
    const selected = expandFunctionPhrase(clicked, links.get(clicked.start) ?? [], originalWords, owners);
    return hintPhrase(original, selected, originalWords);
}
