function _iterateMulti(functor, pairs) {
	if (pairs.length === 0) {
		return {
			value: functor()
		}
	}
	let obj = {};
	for (let i = 0; i < pairs.length; i++) {
		obj[pairs[i][0]] = _iterateMulti(functor.bind(null, pairs[i][1]), pairs.slice(i + 1));
		obj[pairs[i][0]].value = functor(pairs[i][1]);
	}
	if (Object.keys(obj).length === 0) return null;
	return Object.fromEntries(Object.entries(obj).filter(([key, value]) => value != null));
}

function _multiMinDepth(multiObj, minDepth) {
	return Object.fromEntries(Object.entries(multiObj).filter(([key]) => key !== 'value').map(([key, value]) => {
		if (minDepth > 1) {
			return [key, _multiMinDepth(value, minDepth - 1)];
		}
		return [key, value];
	}));
}

function _unwrapMulti(multiObj, formatter) {
	return Object.entries(multiObj).flatMap(([key, value]) => {
		if (key === 'value') return formatter([], value);
		return _unwrapMulti(value, (keys, value) => formatter([key, ...keys], value));
	});
}


function takeNoReplacement(items = [], count = 0) {
	let obj = {};
	items.forEach((key) => {
		if (obj[key] == null) obj[key] = 0;
		obj[key]++;
	});
	return takeNoReplacementHelper(obj, count);
}
function takeReplacement(items = [], count = 0) {
	let obj = Object.fromEntries(items.filter((a, i) => items.indexOf(a) === i).map((item) => [item, Infinity]));
	return takeNoReplacementHelper(obj, count);
}
function takeNoReplacementHelper(itemObj, count) {
	if (count === 0) return [''];
	return Object.entries(itemObj).filter(([key, value]) => value > 0).flatMap(([key, value]) => {
		return takeNoReplacementHelper({
			...itemObj,
			[key]: value - 1
		}, count - 1).map((str) => key + str);
	});
}
function intersection(...arrs) {
	return arrs.reduce((last, b) => last.filter((a) => b.includes(a)));
}
function union(...arrs) {
	return arrs.reduce((a, b) => a.concat(b.filter((c) => !a.includes(c))));
}
function outputSet(setName, set) {
	return `$${outputSetInMathContext(setName, set)}$`;
}
function outputSetInMathContext(setName, set) {
	return `${setName} = \\{${set.flat().join(",")}\\}`;
}
function unions(...pairs) {
	return _multiMinDepth(_iterateMulti(union, pairs), 2);
}
function outputUnions(...pairs) {
	return _unwrapMulti(unions(...pairs), (keys, value) => `$${keys.join(" \\cup ")} = \\{${value.join(",")}\\}$`).join("\n\n");
}
function intersections(...pairs) {
	return _multiMinDepth(_iterateMulti(intersection, pairs), 2);
}
function outputIntersections(...pairs) {
	return _unwrapMulti(intersections(...pairs), (keys, value) => `$${keys.join(" \\cap ")} = \\{${value.join(",")}\\}$`).join("\n\n");
}

function makeExpression(expText) {
	return nerdamer(expText);
}

function evaluate(exp, values) {
	const valueRun = Object.entries(values);
	return exp.buildFunction(valueRun.map((a) => a[0]))(...valueRun.map((a) => a[1]));
}

function debug(value) {
	console.log(value);
	return value;
}

function generateSections(chapter, problems) {
	const headers = problems.map((problem) => `${chapter}.${problem}`);
	return headers.map((header) => `\\newsection{${header}}\n\n\\endsection\n`).join("\n");
}