
// Convert amounts to reals
// GetAmount("1/2") => 0.5
function GetAmount (amount) {
	console.log(amount)
	if (amount.indexOf('/') > 0) {
		var fraction = amount.split('/')
		amount = fraction[0] / fraction[1]
	}
	if (amount > 0) { console.log('!!'); return Number(amount) } else { console.log('??', amount) }
	return false
}

// Convert Units to a standard unit
// GetUnit("pound") => "lb"
function GetUnit (bit) {
	var units = {
		cup: ['cup', 'cups'],
		tsp: ['tsp', 'teaspoon'],
		tbsp: ['tbsp', 'tablespoon', 'tablespoons'],
		lb: ['lb', 'lbs', 'pound', 'pounds'],
		oz: ['ounces', 'ounce', 'oz'],
		g: ['gram', 'grams', 'g'],
		kg: ['kilogram', 'kilograms', 'kg'],
		mg: ['miligram', 'miligrams', 'mg']
	}
	for (var unit in units) {
		if (units[unit].indexOf(bit.toLowerCase()) > -1) { return unit }
	}
	return false
}

// Foirmalize ingredient name
// FormatIngredient("cream of tartar") => "Cream of Tartar"
function FormatIngredient (bit) {
	var out = bit.trim().replace(/\b\w/g, l => l.toUpperCase())
	out = out.replace('Or', 'or').replace('And', 'and')
	return out
}

// Extract parts of ingredients
// ParseIngredients("1 cup of flour") => { amount:1, unit: "cup", ingredient:"flour"}
function ParseIngredient (line) {
	var out = {
		orig: '',
		amount: 0,
		unit: '',
		ingredient: '',
		notes: ''
	}
	line = line.trim()
	out.orig = line
	// remove parenthases
	line = line.replace(/\([^)]*\)/g, '')

	var parts = line.split(',')
	var part = parts.shift()
	if (parts.length > 0) { out.notes = parts.join(' ').trim() }

	var bits = part.split(' ')
	for (var bit of bits) {
		if (GetAmount(bit)) {
			out.amount += GetAmount(bit)
		} else if (GetUnit(bit)) {
			out.unit = GetUnit(bit)
		} else { out.ingredient += bit + ' ' }
	}
	out.ingredient = FormatIngredient(out.ingredient)
	return out
}

module.exports = ParseIngredient
