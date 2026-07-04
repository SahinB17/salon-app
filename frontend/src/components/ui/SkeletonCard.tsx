import { Card } from './Card';

export function SkeletonCard() {
  return (
    <Card className="min-w-[260px] lg:min-w-0 snap-center rounded-2xl overflow-hidden border-0 shadow-sm">
      {/* Image placeholder */}
      <div className="h-32 bg-zinc-200 animate-pulse w-full relative" />
      
      {/* Content placeholder */}
      <div className="p-4 bg-white space-y-4">
        {/* Title */}
        <div className="h-5 bg-zinc-200 animate-pulse rounded-md w-3/4" />
        
        {/* Address */}
        <div className="flex items-center space-x-2">
          <div className="w-3.5 h-3.5 bg-zinc-200 animate-pulse rounded-full" />
          <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-1/2" />
        </div>
        
        {/* Rating and Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-12" />
          <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-16" />
        </div>
      </div>
    </Card>
  );
}
