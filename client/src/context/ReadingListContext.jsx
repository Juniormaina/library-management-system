import { createContext, useCallback, useContext, useEffect, useReducer, useState } from 'react';

const STORAGE_KEY = 'library_reading_list';

/**
 * @typedef {Object} Book
 * @property {string} id
 * @property {string} title
 * @property {string} author
 * @property {string} isbn
 * @property {boolean} available
 * @property {number} totalCopies
 * @property {string} genreId
 * @property {{ name: string }} genre
 */

/**
 * Reducer for reading-list state.
 * Actions:
 *  - { type: 'ADD_BOOK', payload: Book }
 *  - { type: 'REMOVE_BOOK', payload: { id: string } }
 *  - { type: 'CLEAR_LIST }
 *  - { type: 'HYDRATE', payload: Book[] }
 * @param {{ books: Book[] }} state
 * @param {{ type: string, payload?: any }} action
 * @returns {{ books: Book[] }}
 */
function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK': {
      const book = /** @type {Book} */ (action.payload);
      if (state.books.some((b) => b.id === book.id)) {
        return state;
      }
      return { books: [book, ...state.books] };
    }
    case 'REMOVE_BOOK': {
      const { id } = /** @type {{ id: string }} */ (action.payload);
      return { books: state.books.filter((b) => b.id !== id) };
    }
    case 'CLEAR_LIST':
      return { books: [] };
    case 'HYDRATE': {
      const books = Array.isArray(action.payload) ? action.payload : [];
      return { books };
    }
    default:
      return state;
  }
}

/**
 * Safely parse stored JSON, returning `fallback` on any error.
 * @template T
 * @param {string} raw
 * @param {T} fallback
 * @returns {T}
 */
function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const ReadingListContext = createContext(/** @type {any} */ (undefined));

/**
 * @typedef {Object} ReadingListValue
 * @property {Book[]} books
 * @property {(book: Book) => void} addBook
 * @property {(id: string) => void} removeBook
 * @property {() => void} clearList
 * @property {number} count
 */

/**
 * @param {{ children: import('react').ReactNode }} props
 */
export function ReadingListProvider({ children }) {
  const [state, dispatch] = useReducer(readingListReducer, { books: [] });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount; tolerate corrupt/invalid data.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const books = raw ? safeParse(raw, []) : [];
      dispatch({ type: 'HYDRATE', payload: books });
    } catch {
      // localStorage may be unavailable (private mode, quota exceeded).
      dispatch({ type: 'HYDRATE', payload: [] });
    } finally {
      setHydrated(true);
    }
  }, []);

  // Persist to localStorage whenever the list changes after hydration.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.books));
    } catch {
      // Storage failure is non-fatal; the in-memory state remains authoritative.
    }
  }, [state.books, hydrated]);

  const addBook = useCallback((book) => {
    dispatch({ type: 'ADD_BOOK', payload: book });
  }, []);

  const removeBook = useCallback((id) => {
    dispatch({ type: 'REMOVE_BOOK', payload: { id } });
  }, []);

  const clearList = useCallback(() => {
    dispatch({ type: 'CLEAR_LIST' });
  }, []);

  /** @type {ReadingListValue} */
  const value = {
    books: state.books,
    addBook,
    removeBook,
    clearList,
    count: state.books.length,
  };

  return (
    <ReadingListContext.Provider value={value}>
      {children}
    </ReadingListContext.Provider>
  );
}

/**
 * @returns {ReadingListValue}
 */
export function useReadingList() {
  const context = useContext(ReadingListContext);
  if (context === undefined) {
    throw new Error('useReadingList must be used within a ReadingListProvider');
  }
  return context;
}