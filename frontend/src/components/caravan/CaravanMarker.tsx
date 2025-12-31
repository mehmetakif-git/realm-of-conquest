import { useMemo } from 'react';
import type { Caravan } from '../../types/caravan';
import { getStatusColor } from '../../types/caravan';

interface CaravanMarkerProps {
  caravan: Caravan;
  onClick: (caravan: Caravan) => void;
}

// Route path coordinates (simplified for demo)
const ROUTE_PATHS: Record<number, { start: { x: number; y: number }; end: { x: number; y: number } }> = {
  1: { start: { x: 10, y: 85 }, end: { x: 90, y: 85 } }, // Jangan -> Donwhang
  2: { start: { x: 10, y: 85 }, end: { x: 50, y: 15 } }, // Jangan -> Hotan
  3: { start: { x: 90, y: 85 }, end: { x: 50, y: 15 } }, // Donwhang -> Hotan
  4: { start: { x: 10, y: 85 }, end: { x: 95, y: 10 } }, // Jangan -> Constantinople
};

export default function CaravanMarker({ caravan, onClick }: CaravanMarkerProps) {
  const type = caravan.type;
  const route = caravan.route;

  const position = useMemo(() => {
    const path = ROUTE_PATHS[route.id] || { start: { x: 10, y: 50 }, end: { x: 90, y: 50 } };
    const progress = caravan.progressPercent / 100;

    return {
      x: path.start.x + (path.end.x - path.start.x) * progress,
      y: path.start.y + (path.end.y - path.start.y) * progress,
    };
  }, [caravan.progressPercent, route.id]);

  const isUnderAttack = caravan.status === 'under_attack';
  const statusColor = getStatusColor(caravan.status);

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 ${
        isUnderAttack ? 'animate-pulse' : ''
      }`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      onClick={() => onClick(caravan)}
    >
      {/* Caravan Icon */}
      <div
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-transform group-hover:scale-110 ${
          isUnderAttack
            ? 'bg-gradient-to-b from-red-800 to-red-950 border-red-500 animate-bounce'
            : 'bg-gradient-to-b from-yellow-800 to-yellow-950 border-yellow-500'
        }`}
        style={{
          boxShadow: isUnderAttack
            ? '0 0 20px rgba(255,0,0,0.6), 0 0 40px rgba(255,0,0,0.3)'
            : '0 0 15px rgba(255,215,0,0.4)',
        }}
      >
        <span className="text-2xl">{type.icon}</span>

        {/* Guard count badge */}
        {caravan.guards.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border border-blue-300">
            <span className="text-white text-[10px] font-bold">{caravan.guards.filter(g => g.status === 'active').length}</span>
          </div>
        )}

        {/* Attack indicator */}
        {isUnderAttack && (
          <div className="absolute -top-2 -left-2 text-xl animate-bounce">
            ⚔️
          </div>
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
        <div
          className="bg-black/95 rounded-lg border px-3 py-2 whitespace-nowrap"
          style={{ borderColor: statusColor }}
        >
          <div className="text-white font-bold text-sm">{type.name}</div>
          <div className="text-gray-400 text-xs">{caravan.ownerName}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-400 text-xs">💰 {caravan.cargoValue.toLocaleString()}</span>
            <span className="text-blue-400 text-xs">🛡️ {caravan.guards.filter(g => g.status === 'active').length}</span>
          </div>
          <div className="text-xs mt-1" style={{ color: statusColor }}>
            {route.startCity} → {route.endCity}
          </div>
          <div className="text-gray-500 text-xs">
            İlerleme: {Math.round(caravan.progressPercent)}%
          </div>
        </div>
        {/* Arrow */}
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
          style={{ borderTopColor: statusColor }}
        />
      </div>

      {/* Movement trail effect */}
      {caravan.status === 'traveling' && (
        <>
          <div
            className="absolute w-2 h-2 rounded-full bg-yellow-500/50 animate-ping"
            style={{ left: '-10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-yellow-500/30"
            style={{ left: '-20px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <div
            className="absolute w-1 h-1 rounded-full bg-yellow-500/20"
            style={{ left: '-28px', top: '50%', transform: 'translateY(-50%)' }}
          />
        </>
      )}
    </div>
  );
}

// Component to show route lines on the map
export function CaravanRouteLines({ activeRoutes }: { activeRoutes: number[] }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
      {activeRoutes.map(routeId => {
        const path = ROUTE_PATHS[routeId];
        if (!path) return null;

        return (
          <line
            key={routeId}
            x1={`${path.start.x}%`}
            y1={`${path.start.y}%`}
            x2={`${path.end.x}%`}
            y2={`${path.end.y}%`}
            stroke="rgba(255, 215, 0, 0.5)"
            strokeWidth="2"
            strokeDasharray="8,4"
          />
        );
      })}
    </svg>
  );
}
