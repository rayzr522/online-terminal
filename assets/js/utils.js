/**
 * @param {string} query The query to search for.
 * @return {HTMLElement?} An HTML element that matches your query.
 */
const $ = query => document.querySelector(query);

module.exports = {
    $
};