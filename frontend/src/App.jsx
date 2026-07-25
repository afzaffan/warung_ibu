import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import ItemList from './pages/ItemList'
import ItemDetail from './pages/ItemDetail'
import ItemForm from './pages/ItemForm'
import OutOfStock from './pages/OutOfStock'
import Login from './pages/Login'
import { useSession } from './hooks/useSession'

export default function App() {
  const session = useSession()

  if (session === undefined) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-ink-soft">Memuat...</div>
  }

  if (!session) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/barang" element={<ItemList />} />
          <Route path="/barang/:id" element={<ItemDetail />} />
          <Route path="/tambah" element={<ItemForm />} />
          <Route path="/edit/:id" element={<ItemForm />} />
          <Route path="/habis" element={<OutOfStock />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
