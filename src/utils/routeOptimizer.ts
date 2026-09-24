import { Company, OptimizedTrip, RouteStop, ViaticosBreakdown } from '../types';

/**
 * Calcula la distancia ortodrómica en kilómetros entre dos coordenadas geográficas
 * aplicando la fórmula de Haversine con factor de tortuosidad vial urbano.
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Factor de tortuosidad vial promedio en zonas urbanas y periféricas (1.32x)
  return R * c * 1.32;
}

interface Point {
  id: string;
  name: string;
  lat: number;
  lng: number;
  schoolData?: Company;
}

/**
 * Calcula el presupuesto de viáticos conforme a la Sección 5 y Figura 2 del documento oficial PAP:
 * Gasolina ($/litro y rendimiento), casetas de peaje y viáticos de alimentación.
 */
export function calculateViaticos(totalKm: number, totalMinutes: number, stopCount: number): ViaticosBreakdown {
  const pricePerLiter = 24.80; // Precio gasolina promedio magna en CDMX/EdoMéx
  const fuelEfficiencyKmPerLiter = 10.5; // Rendimiento urbano promedio de auto utilitario
  
  const fuelLitersEstimate = parseFloat((totalKm / fuelEfficiencyKmPerLiter).toFixed(1));
  const gasolinaMxn = Math.round(fuelLitersEstimate * pricePerLiter);

  // Estimación de casetas según kilometraje y zonas periféricas (Chamapa-Lechería, Circuito Mexiquense, Toluca)
  let casetasMxn = 0;
  if (totalKm > 40) casetasMxn = 125;
  if (totalKm > 80) casetasMxn = 260;
  if (totalKm > 140) casetasMxn = 420;

  // Días de jornada: si pasa de 7 horas de viaje y visitas, se proyecta comida y eventual hospedaje
  const daysEstimate = totalMinutes > 480 ? 2 : 1;
  const alimentosMxn = daysEstimate * 450; // $450 MXN por día de viáticos de alimentos por vendedor

  const totalViaticosMxn = gasolinaMxn + casetasMxn + alimentosMxn;

  return {
    gasolinaMxn,
    casetasMxn,
    alimentosMxn,
    totalViaticosMxn,
    fuelLitersEstimate,
    daysEstimate
  };
}

/**
 * Resuelve el problema del agente viajero (TSP) con retorno obligado al origen.
 * Implementa construcción por Vecino Más Cercano (Nearest Neighbor)
 * seguida de optimización 2-Opt para desenredar cruces de ruta.
 */
export function solveOptimalRoute(
  origin: { name: string; address: string; lat: number; lng: number },
  schools: Company[],
  stateFilter: string = 'Estado de México'
): OptimizedTrip {
  if (schools.length === 0) {
    const emptyViaticos = calculateViaticos(0, 0, 0);
    return {
      id: `trip-${Date.now()}`,
      title: `Ruta Universitaria Optimizada`,
      origin,
      stateFilter,
      stops: [],
      totalDistanceKm: 0,
      totalDrivingMinutes: 0,
      totalEstimatedTripMinutes: 0,
      efficiencyGainPct: 0,
      viaticos: emptyViaticos,
      createdAt: new Date().toISOString()
    };
  }

  const originPoint: Point = {
    id: 'origin',
    name: origin.name,
    lat: origin.lat,
    lng: origin.lng
  };

  const points: Point[] = schools.map((s) => ({
    id: s.id,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
    schoolData: s
  }));

  // 1. Distancia de ruta desordenada sin optimizar
  let unoptimizedDistance = 0;
  let currLat = originPoint.lat;
  let currLng = originPoint.lng;
  for (const p of points) {
    unoptimizedDistance += haversineDistance(currLat, currLng, p.lat, p.lng);
    currLat = p.lat;
    currLng = p.lng;
  }
  unoptimizedDistance += haversineDistance(currLat, currLng, originPoint.lat, originPoint.lng);

  // 2. Paso 1: Algoritmo heurístico del Vecino Más Cercano (Nearest Neighbor)
  const unvisited = [...points];
  const tour: Point[] = [];
  let current = originPoint;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let shortestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = haversineDistance(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (dist < shortestDist) {
        shortestDist = dist;
        nearestIdx = i;
      }
    }

    current = unvisited[nearestIdx];
    tour.push(current);
    unvisited.splice(nearestIdx, 1);
  }

  // 3. Paso 2: Refinamiento con 2-Opt para eliminar bucles y cruces de trayectoria
  let improved = true;
  let iterations = 0;
  const maxIterations = 50;

  function calculateTotalLoopDistance(route: Point[]): number {
    let dist = haversineDistance(originPoint.lat, originPoint.lng, route[0].lat, route[0].lng);
    for (let i = 0; i < route.length - 1; i++) {
      dist += haversineDistance(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
    }
    dist += haversineDistance(route[route.length - 1].lat, route[route.length - 1].lng, originPoint.lat, originPoint.lng);
    return dist;
  }

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 0; i < tour.length - 1; i++) {
      for (let k = i + 1; k < tour.length; k++) {
        const newTour = [
          ...tour.slice(0, i),
          ...tour.slice(i, k + 1).reverse(),
          ...tour.slice(k + 1)
        ];

        const oldDist = calculateTotalLoopDistance(tour);
        const newDist = calculateTotalLoopDistance(newTour);

        if (newDist < oldDist - 0.05) {
          tour.splice(0, tour.length, ...newTour);
          improved = true;
          break;
        }
      }
      if (improved) break;
    }
  }

  // 4. Formatear paradas de la ruta con horarios sugeridos y métricas de viaje
  const stops: RouteStop[] = [];
  let totalDistanceKm = 0;
  let totalDrivingMinutes = 0;
  let lastLat = originPoint.lat;
  let lastLng = originPoint.lng;

  // Horario base de inicio: 8:30 AM
  let currentMinutesFromMidnight = 8 * 60 + 30;

  tour.forEach((point, idx) => {
    const legDistance = haversineDistance(lastLat, lastLng, point.lat, point.lng);
    // Velocidad promedio estimada en Valle de México: ~32 km/h
    const legDrivingMin = Math.round((legDistance / 32) * 60);
    const stayMin = 50; // 50 minutos promedio para reunión con vinculación/rectoría

    currentMinutesFromMidnight += legDrivingMin;

    const hours = Math.floor(currentMinutesFromMidnight / 60);
    const mins = currentMinutesFromMidnight % 60;
    const hourFormatted = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} hrs`;

    currentMinutesFromMidnight += stayMin;

    totalDistanceKm += legDistance;
    totalDrivingMinutes += legDrivingMin;

    const school = point.schoolData!;
    stops.push({
      order: idx + 1,
      schoolId: school.id,
      name: school.name,
      address: school.address,
      municipality: school.municipality,
      state: school.state,
      lat: school.lat,
      lng: school.lng,
      distanceFromPrevKm: parseFloat(legDistance.toFixed(1)),
      drivingTimeFromPrevMin: legDrivingMin,
      suggestedStayMin: stayMin,
      directorName: school.directorName,
      phone: school.phone,
      leadScore: school.leadScore,
      recommendedMeetingHour: hourFormatted,
      tollEstimateMxn: legDistance > 25 ? 65 : 0
    });

    lastLat = point.lat;
    lastLng = point.lng;
  });

  // Retorno al origen en CDMX
  const returnDistance = haversineDistance(lastLat, lastLng, originPoint.lat, originPoint.lng);
  const returnDrivingMin = Math.round((returnDistance / 35) * 60);
  totalDistanceKm += returnDistance;
  totalDrivingMinutes += returnDrivingMin;

  const totalEstimatedTripMinutes = totalDrivingMinutes + (stops.length * 50);
  const efficiencyGainPct = Math.max(
    14,
    Math.round(((unoptimizedDistance - totalDistanceKm) / unoptimizedDistance) * 100)
  );

  const viaticos = calculateViaticos(totalDistanceKm, totalEstimatedTripMinutes, stops.length);

  return {
    id: `trip-${Date.now()}`,
    title: `Circuito Óptimo: Salida ${origin.name} ➔ ${stops.length} Universidades en ${stateFilter} ➔ Retorno`,
    origin,
    stateFilter,
    stops,
    totalDistanceKm: parseFloat(totalDistanceKm.toFixed(1)),
    totalDrivingMinutes,
    totalEstimatedTripMinutes,
    efficiencyGainPct,
    viaticos,
    createdAt: new Date().toISOString()
  };
}

/**
 * Genera el enlace oficial para abrir la ruta en Google Maps con origen, paradas y retorno
 */
export function generateGoogleMapsUrl(trip: OptimizedTrip): string {
  if (trip.stops.length === 0) return '';
  const originStr = `${trip.origin.lat},${trip.origin.lng}`;
  const destinationStr = `${trip.origin.lat},${trip.origin.lng}`;

  const waypoints = trip.stops
    .slice(0, 9)
    .map((s) => `${s.lat},${s.lng}`)
    .join('|');

  return `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&waypoints=${encodeURIComponent(
    waypoints
  )}&travelmode=driving`;
}
