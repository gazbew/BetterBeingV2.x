import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { devLog } from './utils/logger'

// Debug: log when entrypoint runs (removed in production)
devLog('main.tsx: createRoot render starting');
createRoot(document.getElementById("root")!).render(
	<BrowserRouter>
		<App />
	</BrowserRouter>
);
devLog('main.tsx: createRoot render called');
