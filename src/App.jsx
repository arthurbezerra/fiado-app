import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 600,
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Customers />} />
          <Route path="/clientes/:id" element={<CustomerDetail />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
