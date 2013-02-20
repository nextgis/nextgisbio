lat	lon	name	description
% for p in points:
	${p['lat']}	${p['lon']}	${p['name']}	<a href="#" onClick="new formWindow({form: new tableRowForm({baseURL: application_root + '/cards/', recordID: ${p['card_id']}, fields: cardFieldlistByTaxonId(${p['spec_id']})}), title: 'Карточка № ${p['card_id']}'}).show();">(${p['card_id']}) ${p['name']}</a>
% endfor
