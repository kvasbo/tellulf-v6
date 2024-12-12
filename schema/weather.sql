create table public.weather
(
    id          serial,
    time        timestamp with time zone default CURRENT_TIMESTAMP,
    temperature integer,
    humidity    integer,
    pressure    integer
);

