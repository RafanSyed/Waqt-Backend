export function compareAyah(transcribed: string, actual: string): {
  match: boolean
  similarity: number
} {
  const clean = (text: string) =>
    text
      .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '') // strip all harakat
      .replace(/[a-zA-Z]/g, '') // remove English letters
      .replace(/[^\u0600-\u06FF\s]/g, '') // keep only Arabic characters
      .replace(/\s+/g, ' ')
      .trim()

  const a = clean(transcribed)
  const b = clean(actual)

  const similarity = stringSimilarity(a, b)

  return {
    match: similarity >= 0.50,
    similarity
  }
}

function stringSimilarity(a: string, b: string): number {
  const longer = a.length > b.length ? a : b
  const shorter = a.length > b.length ? b : a

  if (longer.length === 0) return 1.0

  const editDist = levenshtein(longer, shorter)
  return (longer.length - editDist) / longer.length
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) =>
    Array.from({ length: a.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] =
        b[i - 1] === a[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(matrix[i - 1][j - 1], matrix[i][j - 1], matrix[i - 1][j]) + 1
    }
  }

  return matrix[b.length][a.length]
}