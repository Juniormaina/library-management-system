const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const TOKEN_KEY = 'library_access_token';

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
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} access_token
 * @property {AuthUser} user
 */

/**
 * @typedef {Object} RegisterResponse
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string} createdAt
 */

/**
 * Persist a JWT access token in localStorage.
 * @param {string} token
 */
function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieve the persisted JWT access token, or null when absent.
 * @returns {string | null}
 */
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remove the persisted JWT access token.
 */
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Build request headers, injecting the Authorization bearer token when present.
 * @param {Record<string, string> | undefined} [extra]
 * @returns {Record<string, string>}
 */
function authHeaders(extra) {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra ?? {}),
  };
}

/**
 * @param {string} path
 * @param {RequestInit} [init]
 * @returns {Promise<any>}
 */
async function request(path, init) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: authHeaders(init?.headers),
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
  // ----- Token management (exposed for AuthContext) -----
  setToken,
  getToken,
  clearToken,

  // ----- Books -----

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

  // ----- Genres -----

  /**
   * @returns {Promise<Genre[]>}
   */
  getGenres() {
    return request(`/genres`);
  },

  // ----- Auth -----

  /**
   * @param {{ name: string, email: string, password: string, role?: string }} data
   * @returns {Promise<RegisterResponse>}
   */
  register(data) {
    return request(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * @param {{ email: string, password: string }} data
   * @returns {Promise<LoginResponse>}
   */
  login(data) {
    return request(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // ----- Users -----

  /**
   * Requires a valid JWT.
   * @returns {Promise<UserProfile>}
   */
  getProfile() {
    return request(`/users/profile`);
  },
};