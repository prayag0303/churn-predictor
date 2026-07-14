import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CustomerDetail from './pages/CustomerDetail';
import Predict from './pages/Predict';

const NAV = [
  {
    to: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: '/predict',
    label: 'Predict new customer',
    icon: (
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function Sidebar() {
  const loc = useLocation();
  return (
    <aside className="hidden md:flex flex-col w-60 fixed inset-y-0 left-0 bg-[#0F172A] z-40">
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-white text-xl font-semibold tracking-tight">Churnly</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {NAV.map(({ to, label, icon }) => {
          const active = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                active
                  ? 'border-l-[3px] border-[#6366F1] text-[#818CF8] bg-white/5 pl-2.5'
                  : 'border-l-[3px] border-transparent text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">API · localhost:8000</p>
      </div>
    </aside>
  );
}

function TopNav() {
  const loc = useLocation();
  return (
    <header className="md:hidden fixed top-0 inset-x-0 bg-[#0F172A] z-40 flex items-center justify-between px-4 h-14 border-b border-white/10">
      <span className="text-white font-semibold">Churnly</span>
      <nav className="flex items-center gap-5">
        {NAV.map(({ to, label }) => {
          const active = to === '/' ? loc.pathname === '/' : loc.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                active ? 'text-[#818CF8]' : 'text-white/60 hover:text-white'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <TopNav />
        <main className="md:ml-60 pt-14 md:pt-0 min-h-screen">
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/predict" element={<Predict />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
