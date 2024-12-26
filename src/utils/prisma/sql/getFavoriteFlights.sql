WITH
    distinct_cheapest_flight AS (
        SELECT DISTINCT
            ON (f.departure_airport_id, f.destination_airport_id) f.id,
            f.type,
            f.price,
            f.discount,
            f.arrival_timestamp,
            f.departure_timestamp,
            f.departure_airport_id,
            f.destination_airport_id
        FROM
            flight AS f
        ORDER BY
            f.departure_airport_id,
            f.destination_airport_id,
            f.price ASC
    )
SELECT
    dcf.id AS "id",
    dcf.type AS "type",
    dcf.price AS "price",
    dcf.discount AS "discount",
    dcf.arrival_timestamp AS "arrivalTimestamp",
    dcf.departure_timestamp As "departureTimestamp",
    json_build_object(
        'id',
        departure_a.id,
        'type',
        departure_a.type,
        'name',
        departure_a.name,
        'code',
        departure_a.code,
        'city',
        departure_a.city,
        'image',
        departure_a.image,
        'continent',
        departure_a.continent
    ) AS "departureAirport",
    json_build_object(
        'id',
        destination_a.id,
        'type',
        destination_a.type,
        'name',
        destination_a.name,
        'code',
        destination_a.code,
        'city',
        destination_a.city,
        'image',
        destination_a.image,
        'continent',
        destination_a.continent
    ) AS "destinationAirport"
FROM
    distinct_cheapest_flight AS dcf
    JOIN airport AS departure_a ON dcf.departure_airport_id = departure_a.id
    JOIN airport AS destination_a ON dcf.destination_airport_id = destination_a.id
WHERE
    dcf.departure_timestamp >= CURRENT_TIMESTAMP
    AND (dcf.price, dcf.id) > ($3, $2::UUID)
    AND (
        (
            $4::"Continent" IS NULL
            OR destination_a.continent = $4::"Continent"
        )
    )
ORDER BY
    dcf.price ASC,
    dcf.id ASC
LIMIT
    $1;
