import { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Asteroid {
  id: string
  name: string
  diameter?: number
  velocity?: number
  isPotentiallyHazardous?: boolean
}

interface Props {
  startDate: string
  endDate: string
  minVelocity?: number
  minDiameter?: number
  maxVelocity?: number
  maxDiameter?: number
  isPotentiallyHazardous?: boolean
}

export default function AsteroidList({ 
  startDate, 
  endDate,
  minVelocity,
  minDiameter,
  maxVelocity,
  maxDiameter,
  isPotentiallyHazardous
}: Props) {
  const [allAsteroids, setAllAsteroids] = useState<Asteroid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!startDate || !endDate) return

    async function fetchAsteroids() {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          type: 'neows',
          start_date: startDate,
          end_date: endDate
        })

        if (isPotentiallyHazardous !== undefined) {
          params.append('isPotentiallyHazardous', isPotentiallyHazardous.toString())
        }

        const res = await fetch(`/api/neo?${params.toString()}`)
        const data = await res.json()

        if (data.status === 'success' && data.objects) {
          const list: Asteroid[] = []
          
          for (const day of Object.keys(data.objects)) {
            data.objects[day].forEach((obj: any) => {
              list.push({ 
                id: obj.id, 
                name: obj.name,
                diameter: obj.estimated_diameter?.meters?.estimated_diameter_min,
                velocity: parseFloat(obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second),
              })
            })
          }
          
          setAllAsteroids(list)
        } else {
          setError('Nenhum asteroide encontrado nesse período.')
        }
      } catch (err) {
        setError('Erro ao buscar asteroides.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAsteroids()
  }, [startDate, endDate, isPotentiallyHazardous])

  const asteroids = useMemo(() => {
    return allAsteroids.filter((ast) => {
      if (minDiameter !== undefined && ast.diameter !== undefined) {
        if (ast.diameter < minDiameter) return false
      }
      if (maxDiameter !== undefined && ast.diameter !== undefined) {
        if (ast.diameter > maxDiameter) return false
      }

      if (minVelocity !== undefined && ast.velocity !== undefined) {
        if (ast.velocity < minVelocity) return false
      }
      if (maxVelocity !== undefined && ast.velocity !== undefined) {
        if (ast.velocity > maxVelocity) return false
      }

      return true
    })
  }, [allAsteroids, minDiameter, maxDiameter, minVelocity, maxVelocity])

  return (
    <Card className="mt-4 bg-white shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-gray-800">
        Asteroides próximos à Terra
          {asteroids.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({asteroids.length} encontrado{asteroids.length !== 1 ? 's' : ''})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-gray-500">Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && asteroids.length === 0 && (
          <p className="text-gray-500">Nenhum asteroide encontrado com os filtros aplicados.</p>
        )}

        {!loading && !error && asteroids.length > 0 && (
          <ul className="space-y-2">
            {asteroids.map((ast) => (
              <li
                key={ast.id}
                className="flex items-center justify-between gap-3 bg-gray-50 rounded-md p-3 transition-all hover:bg-gray-200 hover:cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-gray-800 font-medium block">
                      {ast.name}
                    </span>
                    <div className="text-xs text-gray-500 mt-1 space-x-3">
                      {ast.diameter && (
                        <span>{ast.diameter.toFixed(2)} m</span>
                      )}
                      {ast.velocity && (
                        <span>{ast.velocity.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} km/s</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}