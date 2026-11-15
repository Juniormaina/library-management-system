const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * @typedef {Object} Genre
 * @property {string} id
 * @property {string} name
 * @property {string | null} description
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} isbn
 * @property {string | null} description
 * @property {string | null} publishedAt
 * @property {boolean} available
 * @property {number} totalCopies
 * @property {string} genreId
 * @property {Genre} genre
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} PaginatedBooks
 * @property {Book[]} data
 * @property {{ total: number, page: number, limit: number, totalPages: number }} meta
 */

/**
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<any>}
 */
async function request(path, init) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) {
        message = Array.isArray(body.message) ? body.message.join(', ') : body.message;
      }
    } catch {
      // Ignore JSON parse errors; use the default message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}

export const api = {
  /**
   * @param {{ genreId?: string, search?: string, page?: number, limit?: number }} [params]
   * @returns {Promise<PaginatedBooks>}
   */
  getBooks(params) {
    const query = new URLSearchParams();
    if (params?.genreId) query.set('genreId', params.genreId);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/books${suffix}`);
  },

  /**
   * @param {string} id
   * @returns {Promise<Book>}
   */
  getBook(id) {
    return request(`/books/${id}`);
  },

  /**
   * @returns {Promise<Genre[]>}
   */
  getGenres() {
    return request(`/genres`);
  },
};