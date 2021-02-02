// convert unicode fractions to text fractions
// ConvertFraction('½') => '1/2'
function ConvertFraction (frac) {
	const uni = {
		'½': '1/2',
		'⅓': '1/3',
		'¼': '1/4',
		'⅕': '1/5',
		'⅙': '1/6',
		'⅐': '1/7',
		'⅛': '1/8',
		'⅑': '1/9',
		'⅒': '1/10',
		'⅔': '2/3',
		'⅖': '2/5',
		'¾': '3/4',
		'⅗': '3/5',
		'⅜': '3/8',
		'⅘': '4/5',
		'⅚': '5/6',
		'⅝': '5/8',
		'⅞': '7/8'
	}
	return uni[frac] || frac
}
// Convert amounts to reals
// GetAmount("1/2") => 0.5
function GetAmount (amount) {
	amount = ConvertFraction(amount)
	if (amount.indexOf('/') > 0) {
		var fraction = amount.split('/')
		amount = fraction[0] / fraction[1]
	}
	if (amount > 0) { return Number(amount) }
	return false
}

function GetModifier (bit) {
	var sizes = {
		large: ['Large', 'large', 'lg'],
		medium: ['medium', 'med', 'md'],
		small: ['small', 'sm'],
		whole: ['whole'],
		dried: ['dried'],
		boneless: ['boneless'],
		thin: ['thin'],
		torn: ['torn'],
		fresh: ['fresh'],
		grated: ['grateds'],
		toasted: ['toasted'],
		cool: ['cool'],
		cold: ['cold'],
		lukewarm: ['lukewarm'],
		warm: ['warm'],
		hot: ['hot']
	}
	for (var size in sizes) {
		if (sizes[size].indexOf(bit.toLowerCase()) > -1) { return size }
	}
	return false
}

// Convert Units to a standard unit
// GetUnit("pound") => "lb"
function GetUnit (bit) {
	var units = {
		cup: ['cup', 'cups'],
		tsp: ['tsp', 'teaspoon', 'teaspoons'],
		tbsp: ['tbsp', 'tablespoon', 'tablespoons'],
		lb: ['lb', 'lbs', 'pound', 'pounds'],
		oz: ['ounces', 'ounce', 'oz'],
		g: ['gram', 'grams', 'g'],
		kg: ['kilogram', 'kilograms', 'kg'],
		mg: ['miligram', 'miligrams', 'mg'],
		clove: ['clove', 'cloves'],
		pinch: ['pinch'],
		sprig: ['sprig', 'sprigs'],
		qt: ['quart', 'quarts', 'qt', 'qts'],
		slice: ['slice', 'slices'],
		bunch: ['bunch'],
		stalk: ['stalk'],
		head: ['head'],
		stick: ['stick'],
		handful: ['handful'],
		bag: ['bag']
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
	var lower = ['Or ', 'And ', 'Of ', 'To ', 'From ', 'For ']
	for (var l of lower) { out = out.replace(l, l.toLowerCase()) }
	out = out.replace(/^of /, '')
	return out
}

// Extract parts of ingredients
// ParseIngredients("1 cup of flour") => { amount:1, unit: "cup", ingredient:"flour"}
function ParseIngredient (line, hideorginal = false) {
	var foundamount = false
	var out = {
		amount: 0,
		unit: '',
		ingredient: '',
		notes: '',
		orig: ''
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
		if (GetAmount(bit) && !foundamount) {
			out.amount += GetAmount(bit)
		} else if (GetUnit(bit)) {
			out.unit = GetUnit(bit)
			foundamount = true
		} else if (GetModifier(bit)) {
			out.notes = out.notes.length ? GetModifier(bit) + ', ' + out.notes : GetModifier(bit)
		} else { out.ingredient += bit + ' ' }
	}
	out.notes = out.notes.toLowerCase()
	out.ingredient = FormatIngredient(out.ingredient)
	out.amount = out.amount ? out.amount : null
	if (hideorginal) { delete out.orig }
	return out
}

module.exports = ParseIngredient
