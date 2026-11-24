import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../hooks/ThemeContext';
import { PlayfulButton } from './MotionPrimitives';
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return <PlayfulButton type="button" className="theme-toggle" onClick={toggle} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} aria-pressed={theme === 'dark'}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</PlayfulButton>;
}
