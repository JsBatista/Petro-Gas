from alembic_utils.pg_function import PGFunction


avg_last_24 = PGFunction(
    schema="public",
    signature="avg_last_24(_current_date timestamp, _ids text[] default '{}')",
    definition="""
		    RETURNS TABLE (equipment varchar(255)
               , date_trunc   timestamp
               , avg float8)
				LANGUAGE plpgsql AS
				$func$
				BEGIN
					IF _ids <> '{}'::text[] THEN
						RETURN QUERY
						select 
							equipment_id as equipment, 
							date_trunc('hour', "timestamp"), 
							avg(value) 
						from 
							sensor_data sd 
						where 
							"timestamp" < _current_date and
							"timestamp" > (_current_date - '1 day'::INTERVAL) and 
							equipment_id = ANY(_ids)
						group by  
							equipment_id, 
							date_trunc('hour', "timestamp") 
						order by 
							equipment_id, 
							date_trunc('hour', "timestamp");
						
					ELSE
						RETURN QUERY
						select 
							equipment_id as equipment, 
							date_trunc('hour', "timestamp"), 
							avg(value) 
						from 
							sensor_data sd 
						where 
							"timestamp" < _current_date and
							"timestamp" > (_current_date - '1 day'::INTERVAL)
						group by  
							equipment_id, 
							date_trunc('hour', "timestamp") 
						order by 
							equipment_id, 
							date_trunc('hour', "timestamp");
					END IF;
				END
				$func$;
		""")
