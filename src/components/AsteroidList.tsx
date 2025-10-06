'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Asteroid {
  id: string;
  name: string;
  diameter?: number;
  velocity?: number;
  isPotentiallyHazardous?: boolean;
}

interface Props {
  startDate: string;
  endDate: string;
  minVelocity?: number;
  minDiameter?: number;
  maxVelocity?: number;
  maxDiameter?: number;
  isPotentiallyHazardous?: boolean;
  onSelectAsteroid?: (data: any) => void;
}

export default function AsteroidList({
  startDate,
  endDate,
  minVelocity,
  minDiameter,
  maxVelocity,
  maxDiameter,
  isPotentiallyHazardous,
  onSelectAsteroid,
}: Props) {
  const t = useTranslations('asteroidList');
  const [allAsteroids, setAllAsteroids] = useState<Asteroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (!startDate || !endDate) return;

    async function fetchAsteroids() {
      setLoading(true);
      setError(null);
      setCurrentPage(1);

      try {
        // ✅ Usa o proxy seguro (não chama diretamente /api/neo)
        const res = await fetch(
          `/api/proxy/neo?start_date=${startDate}&end_date=${endDate}` +
            (minDiameter ? `&min_diameter=${minDiameter}` : '') +
            (minVelocity ? `&min_velocity=${minVelocity}` : '')
        );

        const data = await res.json();

        if (res.ok && data.near_earth_objects) {
          const list: Asteroid[] = [];

          for (const day of Object.keys(data.near_earth_objects)) {
            data.near_earth_objects[day].forEach((obj: any) => {
              list.push({
                id: obj.id,
                name: obj.name,
                diameter:
                  obj.estimated_diameter?.meters?.estimated_diameter_min ??
                  obj.estimated_diameter?.meters?.estimated_diameter_max,
                velocity: parseFloat(
                  obj.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second ?? '0'
                ),
                isPotentiallyHazardous: obj.is_potentially_hazardous_asteroid,
              });
            });
          }

          setAllAsteroids(list);
        } else {
          setError(t('noResults'));
        }
      } catch (err) {
        console.error(t('errorDetails'), err);
        setError(t('error'));
      } finally {
        setLoading(false);
      }
    }

    fetchAsteroids();
  }, [startDate, endDate, minDiameter, minVelocity, t]);

  const filteredAsteroids = useMemo(() => {
    return allAsteroids.filter((ast) => {
      if (minDiameter && ast.diameter && ast.diameter < minDiameter) return false;
      if (maxDiameter && ast.diameter && ast.diameter > maxDiameter) return false;
      if (minVelocity && ast.velocity && ast.velocity < minVelocity) return false;
      if (maxVelocity && ast.velocity && ast.velocity > maxVelocity) return false;
      if (isPotentiallyHazardous && !ast.isPotentiallyHazardous) return false;
      return true;
    });
  }, [allAsteroids, minDiameter, maxDiameter, minVelocity, maxVelocity, isPotentiallyHazardous]);

  const totalPages = Math.ceil(filteredAsteroids.length / itemsPerPage);
  const paginated = useMemo(
    () =>
      filteredAsteroids.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredAsteroids, currentPage]
  );

  async function handleAsteroidClick(id: string) {
    try {
      const res = await fetch(`/api/proxy/neo/lookup/${id}`);
      const data = await res.json();
      if (onSelectAsteroid) onSelectAsteroid(data);
    } catch (err) {
      console.error(t('errorDetails'), err);
    }
  }

  return (
    <Card className="mt-4 bg-white shadow-md rounded-xl">
      <CardContent>
        {loading && <p className="text-gray-500">{t('loading')}</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && filteredAsteroids.length > 0 && (
          <>
            <ul className="space-y-2">
              {paginated.map((ast) => (
                <li
                  key={ast.id}
                  onClick={() => handleAsteroidClick(ast.id)}
                  className="flex items-center justify-between bg-gray-50 rounded-md p-3 transition-all hover:bg-gray-200 hover:cursor-pointer"
                >
                  <div>
                    <span className="text-gray-800 font-medium block">{ast.name}</span>
                    <div className="text-xs text-gray-500 mt-1 space-x-3">
                      {ast.diameter && <span>{ast.diameter.toFixed(2)} {t('meters')}</span>}
                      {ast.velocity && (
                        <span>
                          {ast.velocity.toLocaleString('pt-BR', {
                            maximumFractionDigits: 0,
                          })}{' '}
                          {t('kmPerSecond')}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Paginação */}
            <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-200">
              {filteredAsteroids.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredAsteroids.length} {filteredAsteroids.length !== 1 ? t('foundPlural') : t('found')})
                </span>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t('previous')}
              </button>

              <span className="text-sm text-gray-600">
                {t('page')} <strong>{currentPage}</strong> {t('of')} {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t('next')}
              </button>
            </div>
          </>
        )}

        {!loading && !error && filteredAsteroids.length === 0 && (
          <p className="text-gray-500">
            {t('noResultsFiltered')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
