const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const oldImports = `import { Link } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';

export default function Dashboard() {`;

const newImports = `import { Link } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';

export default function Dashboard() {
  const [showAdmin, setShowAdmin] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8' && profile?.email === 'miguelrafaelmontana@gmail.com') {
        setShowAdmin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profile]);`;

code = code.replace(oldImports, newImports);

const oldAdminRender = `<div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <AdminPanel />`;

const newAdminRender = `<div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      {showAdmin && <AdminPanel />}`;

code = code.replace(oldAdminRender, newAdminRender);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
