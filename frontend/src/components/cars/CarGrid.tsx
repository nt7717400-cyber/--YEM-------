import { Car } from '@/types';
import { CarCard } from './CarCard';

interface CarGridProps {
  cars: Car[];
  emptyMessage?: string;
}

export function CarGrid({ cars, emptyMessage = 'لا توجد سيارات' }: CarGridProps) {
  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      data-testid="car-grid"
    >
      {cars.map((car) => (
        <CarCard key={car.id} car={car} />
      ))}
    </div>
  );
}
