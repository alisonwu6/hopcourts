-- Bounding-box queries in findNearbyVenues filter on both lat and lng.
-- Without this index every call is a full table scan.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_venues_lat_lng ON public.venues(lat, lng);
