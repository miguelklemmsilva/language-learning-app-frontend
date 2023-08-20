const isJapanese = (text) => {
    const regex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g;
    return regex.test(text);
};

const tokenize = (text) => {
    if (isJapanese(text)) {
        // Consider each character as a word for Japanese
        return [...text];
    }
    return text.split(' ');
};

const lcsLength = (a, b) => {
    const m = a.length;
    const n = b.length;
    const dp = Array.from(Array(m + 1), () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (a[i - 1] === b[j - 1])
                dp[i][j] = dp[i - 1][j - 1] + 1;
            else
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp;
};

const printLcsDiff = (dp, a, b, i, j) => {
    if (i === 0 && j === 0)
        return [];
    else if (i === 0)
        return printLcsDiff(dp, a, b, i, j - 1).concat([`[${b[j - 1]}]`]);
    else if (j === 0)
        return printLcsDiff(dp, a, b, i - 1, j);
    else if (a[i - 1] === b[j - 1])
        return printLcsDiff(dp, a, b, i - 1, j - 1).concat([a[i - 1]]);
    else {
        if (dp[i - 1][j] > dp[i][j - 1])
            return printLcsDiff(dp, a, b, i - 1, j);
        else
            return printLcsDiff(dp, a, b, i, j - 1).concat([`[${b[j - 1]}]`]);
    }
};


const surroundDifferencesWithBrackets = (string1, string2) => {
    const words1 = tokenize(string1);
    const words2 = tokenize(string2);

    const dp = lcsLength(words1, words2);
    const result = printLcsDiff(dp, words1, words2, words1.length, words2.length);

    // Determine how to join the result based on the input strings
    if (isJapanese(string1) || isJapanese(string2))
        return result.join(''); // Join without spaces for Japanese
    else
        return result.join(' ');
};

const isPunctuation = (char) => {
    const latinPunctuation = ".,:;?!-'\"()[]{}<>/";
    const japanesePunctuation = "。、・「」『』！？";
    const unicodePunctuation = /[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/;

    return latinPunctuation.includes(char) || unicodePunctuation.test(char) || japanesePunctuation.includes(char);
};

const matchCapitalizationAndPunctuation = (string1, string2) => {
    let result = "";
    let i1 = 0;
    let i2 = 0;

    while (i2 < string2.length) {
        if (isPunctuation(string2[i2])) {
            result += string2[i2];
            if (i1 < string1.length && string1[i1] === string2[i2])
                i1++;
            i2++;
        } else {
            while (i1 < string1.length && string1[i1].toLowerCase() !== string2[i2].toLowerCase()) {
                if (isPunctuation(string1[i1]))
                    result += string1[i1];
                i1++;
            }

            if (i1 < string1.length) {
                result += string1[i1];
                i1++;
            } else
                result += string2[i2];
            i2++;
        }
    }

    while (i1 < string1.length) {
        if (isPunctuation(string1[i1]))
            result += string1[i1];
        i1++;
    }

    return result;
};


const wrapMistakes = (result) => {
    const mistakeRegex = /\[(.*?)]/g;
    const parts = result.split(mistakeRegex);
    return parts.map((part, index) => {
        if (index % 2 === 1)
            return `<div class="mistake">${part}</div>`;
        else
            return part;
    }).join('');
};

const prepareString = (cleanAnswer, cleanComparisonString, comparisonString) => {
    let result = surroundDifferencesWithBrackets(cleanAnswer, cleanComparisonString);
    result = matchCapitalizationAndPunctuation(comparisonString, result);
    result = wrapMistakes(result);
    return result;
}

export default prepareString;