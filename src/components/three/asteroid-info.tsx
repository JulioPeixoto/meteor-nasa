'use client';

import { AsteroidData } from './rotating-asteroid';

interface AsteroidInfoProps {
  asteroidData: AsteroidData;
}

export function AsteroidInfo({ asteroidData }: AsteroidInfoProps) {
  if (!asteroidData.name) return null;

  return (
    <div className="p-4 rounded-lg border border-white/10">
      <h3 className="text-white text-lg font-bold mb-2">{asteroidData.name}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {asteroidData.diameter && (
          <div className="text-gray-300">
            <span className="font-semibold text-gray-400">Diâmetro:</span> {asteroidData.diameter.toFixed(2)} km
          </div>
        )}
        {asteroidData.composition && (
          <div className="text-gray-300">
            <span className="font-semibold text-gray-400">Tipo:</span> {asteroidData.composition}
          </div>
        )}
        {asteroidData.absoluteMagnitude && (
          <div className="text-gray-300">
             <span className="font-semibold text-gray-400">Magnitude:</span> {asteroidData.absoluteMagnitude.toFixed(1)}
          </div>
        )}
        {asteroidData.isPotentiallyHazardous !== undefined && (
          <div className={asteroidData.isPotentiallyHazardous ? 'text-red-400' : 'text-green-400'}>
            <span className="font-semibold text-gray-400">Status:</span> {asteroidData.isPotentiallyHazardous ? 'Potencialmente Perigoso' : 'Seguro'}
          </div>
        )}
      </div>
    </div>
  );
}
