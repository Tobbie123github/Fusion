import { useNavigate } from 'react-router-dom'
import { Button, FadeUp } from '../components/UI'
import { ArrowRight } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="pt-20 min-h-screen flex items-center justify-center px-6">
      <FadeUp>
        <div className="text-center">
          <p className="font-serif text-8xl font-bold mb-4 opacity-10" style={{ color: 'var(--text)' }}>404</p>
          <h1 className="font-serif text-3xl font-bold mb-4" style={{ color: 'var(--text)' }}>Page not found</h1>
          <p className="text-sm mb-10" style={{ color: 'var(--text-sub)' }}>The page you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back Home <ArrowRight size={14} /></Button>
        </div>
      </FadeUp>
    </div>
  )
}
