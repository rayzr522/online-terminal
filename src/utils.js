/**
 * @param {string} query The query to search for.
 * @return {HTMLElement?} An HTML element that matches your query.
 */
export function $(query) {
  return document.querySelector(query)
}

/**
 * @param {string[]} args
 * @returns {number[]}
 */
export function mapToNumbers(args) {
  return args.map((i) => parseInt(i)).filter((i) => !isNaN(i))
}
