const curseWords = ['kerfuffle', 'sharbert', 'fornax'];
export function scrubProfanityFromJSON(data) {
    let body = data.body;
    const cleaned = scrubProfanity(body);
    return { cleanedBody: cleaned };
}
export function scrubProfanity(body) {
    const replacement = '****';
    const words = body.split(' ');
    const cleaned = [];
    for (let index in words) {
        const word = words[index];
        let lower = word.toLowerCase();
        if (curseWords.includes(lower)) {
            cleaned.push(replacement);
        }
        else {
            cleaned.push(word);
        }
    }
    return cleaned.join(' ');
}
