const INCREMENT = new RegExp(/\s\((\d+)\)$/)
const INCREMENT_INT = new RegExp(/\d+(?=\)$)/)

export function getName(name: string, others: string[]) {
  const set = new Set(others)
  let result = name
  while (set.has(result)) {
    result = INCREMENT.exec(result)?.[1]
      ? result.replace(INCREMENT_INT, (m) => (+m + 1).toString())
      : `${result} (1)`
  }
  return result
}
