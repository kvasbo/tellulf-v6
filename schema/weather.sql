create table public.temperature
(
    id          integer                  default nextval('weather_id_seq'::regclass) not null,
    time        timestamp with time zone default CURRENT_TIMESTAMP,
    temperature integer
);