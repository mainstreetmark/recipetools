const COMPOUND_SYMBOL = '!&!'

let GROUP = '' // a global group tracker


// Convert decimal values to fractions
// ValToFrac(0.33) => '⅓'
// ValToFrac(0.33, true) => '1/3'
function ValToFrac (val, plain = false) {
	let rem = val % 1
	let whole = Number(val - rem)
	rem = (rem * 100) | 0
	if (!whole) { whole = '' }
	const vals = {
		75: '¾',
		67: '⅔',
		50: '½',
		25: '¼',
		33: '⅓',
		12: '⅛' // yes, .125 is reporesented as decimal .13, but truncate to .12
	}
	var frac = (vals[rem] || rem / 100)
	if (frac && plain) { frac = ' ' + ConvertFraction(frac) }
	return whole + frac
}

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
		amount = +((fraction[0] / fraction[1]).toFixed(2))
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
		fresh: ['fresh', 'freshly'],
		ground: ['ground'],
		grated: ['grated'],
		minced: ['minced'],
		toasted: ['toasted'],
		cool: ['cool'],
		cold: ['cold'],
		lukewarm: ['lukewarm'],
		warm: ['warm'],
		hot: ['hot'],
		uncooked: ['uncooked'],
		raw: ['raw'],
		rinsed: ['rinsed'],
		ripe: ['ripe'],
		cooked: ['cooked'],
		chopped: ['chopped'],
		finely: ['fine', 'finely'],
		homemade: ['homemade'],
		'store-bought': ['store-bought'],
		picked: ['picked'],
		peeled: ['peeled'],
		cubed: ['cubed'],
		shredded: ['shredded']
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
		bag: ['bag', 'bags'],
		bunch: ['bunch'],
		can: ['can', 'cans'],
		clove: ['clove', 'cloves'],
		cup: ['cup', 'cups'],
		feet: ['feet', 'foot'], // like sausage casings
		g: ['gram', 'grams', 'g'],
		handful: ['handful'],
		head: ['head'],
		kg: ['kilogram', 'kilograms', 'kg'],
		lb: ['lb', 'lbs', 'pound', 'pounds'],
		leaf: ['leaf', 'leaves'],
		mg: ['miligram', 'miligrams', 'mg'],
		oz: ['ounces', 'ounce', 'oz'],
		packet: ['packet', 'packets'],
		pkg: ['package', 'pkg', 'packages'],
		pinch: ['pinch'],
		qt: ['quart', 'quarts', 'qt', 'qts'],
		slice: ['slice', 'slices'],
		sprig: ['sprig', 'sprigs'],
		stalk: ['stalk'],
		stick: ['stick'],
		tsp: ['tsp', 'teaspoon', 'teaspoons'],
		tbsp: ['tbsp', 'tablespoon', 'tablespoons'],
		sheet: ['sheet', 'sheets']
	}
	for (var unit in units) {
		if (units[unit].indexOf(bit.toLowerCase()) > -1) { return unit }
	}
	return false
}

// Adds an S where appropriate.  Most things don't pluralize.
// PluralUnit('cup') => 'cups'
// PluralUnit('kg') => 'kg'
function PluralUnit (unit, amount = 1) {
	var units = {
		cup: 'cups',
		lb: 'lbs',
		slice: 'slices',
		leaf: 'leaves',
		sprig: 'sprigs',
		clove: 'cloves'
	}
	return amount > 1 ? (units[unit] || unit) : unit
}

// Formalize ingredient name
// FormatIngredient("cream of tartar") => "Cream of Tartar"
function FormatIngredient (bit) {
	var out = bit.trim().replace(/\b\w/g, l => l.toUpperCase())
	var lower = ['Or ', 'And ', 'Of ', 'To ', 'From ', 'For ']
	for (var l of lower) { out = out.replace(l, l.toLowerCase()) }
	out = out.replace(/^of /, '').replace(/^or /, '').replace(/^and /, '')
	return out
}

// Combines compound ingredient names, so they don't get split up.  ONLY if some of their parts would get replaced by other bits,
// such as 'ground', which is a modifier or 'leaf' which is a unit.
// FindCompounds("ground beef") => "ground%%beef" (which can later be replaced back with a space character)
function FindCompounds (line) {
	var compounds = ['ground beef', 'bay leaf', 'bay leaves', 'loosely packed', 'hot sauce']
	// TODO - maybe use map() for this work
	for (var c of compounds) {
		line = line.replace(new RegExp(c, 'gi'), c.replace(' ', COMPOUND_SYMBOL))
	}
	return line
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
	out.optional = line.indexOf('(optional') > 0

	// promote "(optional)"" to something that sticks around
	line = line.replace('(optional)', '')
	// change weird chars into commas
	line = line.replace(/[;]/, ',')
	// remove parenthases and contents with alternate weights ex: (5grams), (.25 ounce)
	line = line.replace(/\(([\d.][^)]*)\)/g, '')
	// remove the "(about a pound)" weight alternates
	line = line.replace(/\(about.*\)/, '')
	// remove parenthases, keeping whats inside  ex: "(as needed)" -> ",as needed"
	line = line.replace(/\(([^)]*)\)/g, ',$1,')
	// replace "A loaf" with "1 loaf", so it can parse
	line = line.replace(/^A /i, '1 ')
	// replacae "400g" with "400 g", since every other unit has spaces
	line = line.replace(/^(\d+)g/i, '$1 g')
	// replace "beef such as cow" with "beef, such as cow" so the comma catches
	line = line.replace(/(\w) (such as|like|for)/, '$1, $2')
	line = FindCompounds(line)

	// this is a gruping oof ingredients
	if (line.charAt(line.length - 1) === ':') {
		GROUP = line.slice(0, -1)
		return false
	}

	var parts = line.split(',')
	var part = parts.shift()
	if (parts.length > 0) { out.notes = parts.join(' ').trim() }

	var bits = part.split(/[\s]/) // split on whitespace
	for (var bit of bits) {
		if (GetAmount(bit) && !foundamount) {
			out.amount += GetAmount(bit)
		} else if (GetUnit(bit)) {
			out.unit = GetUnit(bit)
			foundamount = true // done parsing amounts
		} else if (GetModifier(bit)) {
			out.notes = out.notes.length ? GetModifier(bit) + ', ' + out.notes : GetModifier(bit)
		} else { out.ingredient += bit + ' ' }
	}
	out.notes = out.notes.toLowerCase()
	out.ingredient = FormatIngredient(out.ingredient).replace(COMPOUND_SYMBOL, ' ')
	out.amount = out.amount ? out.amount : null
	if (hideorginal) { delete out.orig }
	if (GROUP) { out.group = GROUP }
	return out
}

// module.exports = ParseIngredient
exports.ParseIngredient = ParseIngredient
exports.ValToFrac = ValToFrac
exports.PluralUnit = PluralUnit
