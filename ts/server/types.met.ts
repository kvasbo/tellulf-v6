export interface TimeSeries {
    time: string;
    data: {
        instant: instant;
        next_1_hours: next_1_hours;
        next_6_hours: next_6_hours;
        next_12_hours: next_12_hours;
    };
}

export interface next_6_hours {
    summary: {
        symbol_code: string;
    };
    details: {
        air_temperature_max: number;
        air_temperature_min: number;
        precipitation_amount: number;
        precipitation_amount_max: number;
        precipitation_amount_min: number;
        probability_of_precipitation: number;
    };
}

export interface next_12_hours {
    summary: {
        symbol_code: string;
        symbol_confidence: string;
    };
    details: {
        probability_of_precipitation: number;
    };
}

export interface instant {
    details: {
        air_pressure_at_sea_level: number;
        air_temperature: number;
        air_temperature_percentile_10: number;
        air_temperature_percentile_90: number;
        cloud_area_fraction: number;
        cloud_area_fraction_high: number;
        cloud_area_fraction_low: number;
        cloud_area_fraction_medium: number;
        dew_point_temperature: number;
        fog_area_fraction: number;
        relative_humidity: number;
        ultraviolet_index_clear_sky: number;
        wind_from_direction: number;
        wind_speed: number;
        wind_speed_of_gust: number;
        wind_speed_percentile_10: number;
        wind_speed_percentile_90: number;
    };
}

export interface next_1_hours {
    summary: {
        symbol_code: string;
    };
    details: {
        precipitation_amount: number;
        precipitation_amount_max: number;
        precipitation_amount_min: number;
        probability_of_precipitation: number;
        probability_of_thunder: number;
    };
}
