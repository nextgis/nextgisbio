{
    "type": "FeatureCollection",
    "features": [
    % for i, sq in enumerate(squares):
		{
			"type": "Feature", 
			"properties": {"id": ${sq["id"]} }, 
			"geometry": ${sq["geom"] | n}
		}
		% if i < len(squares) - 1:
			,
		% endif
	% endfor
	]
}


