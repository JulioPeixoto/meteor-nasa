'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Asteroid {
  id: string
  name: string
}

interface Props {
  startDate: string
  endDate: string
}

export default function AsteroidList({ startDate, endDate }: Props) {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!startDate || !endDate) return

    async function fetchAsteroids() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/neo?type=neows&start_date=${startDate}&end_date=${endDate}`)
        const data = await res.json()

        if (data.status === 'success' && data.objects) {
          const list: Asteroid[] = []
          for (const day of Object.keys(data.objects)) {
            data.objects[day].forEach((obj: any) => {
              list.push({ id: obj.id, name: obj.name })
            })
          }
          setAsteroids(list)
        } else {
          setError('Nenhum asteroide encontrado nesse período.')
        }
      } catch {
        setError('Erro ao buscar asteroides.')
      } finally {
        setLoading(false)
      }
    }

    fetchAsteroids()
  }, [startDate, endDate])

  return (
    <Card className="mt-4 bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-gray-800">🌠 Asteroides próximos à Terra</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-2">
            {asteroids.map((ast) => (
              <li
                key={ast.id}
                className="flex items-center gap-3 bg-gray-50 rounded-md p-2 transition-all hover:bg-gray-200 hover:cursor-pointer"
              >
                🌠
                <span className="text-gray-800 font-medium">{ast.name}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
