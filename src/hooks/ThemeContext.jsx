import { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext({ theme: 'light', toggle: () => {} });
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('portfolio-theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } });
  useEffect(() => { document.documentElement.dataset.theme = theme; try { localStorage.setItem('portfolio-theme', theme); } catch {} }, [theme]);
  return <ThemeContext.Provider value={{ theme, toggle: () => setTheme(current => current === 'light' ? 'dark' : 'light') }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
