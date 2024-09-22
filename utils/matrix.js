/**
 *
 * @param [array] list
 */
export function multiply(list) {
	return [...list].reduce((m1, m0) => {
		/*const [
			a00, a01, a02,
			a10, a11, a12
		] = m1;
		const [
			b00, b01, b02,
			b10, b11, b12
		] = m1;*/
		return [
			m0[0] * m1[0] + m0[1] * m1[3],
			m0[0] * m1[1] + m0[1] * m1[4],
			m0[0] * m1[2] + m0[1] * m1[5] + m0[2],

			m0[3] * m1[0] + m0[4] * m1[3],
			m0[3] * m1[1] + m0[4] * m1[4],
			m0[3] * m1[2] + m0[4] * m1[5] + m0[5],
		]
	}, [1, 0, 0, 0, 1, 0])
}

export function distance(p0, p1) {
	return Math.sqrt((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2);
}

export function angle(p0, p1) {
	return Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
}

export function getPointAtLine(p0, p1, progress) {
	function mix(d0, d1, p) {
		return d0 + (d1 - d0) * p;
	}

	return [
		mix(p0[0], p1[0], progress),
		mix(p0[1], p1[1], progress)
	]
}

export function distance2(p1, p2, p0) {
	return Math.abs((p2[1] - p1[1]) * p0[0] - (p2[0] - p1[0]) * p0[1] + p2[0]*p1[1] - p2[1] * p1[0]) / distance(p1, p2)
}

export function transform(p, m) {
	return [
		m[0] * p[0] + m[1] * p[1] + m[2],
		m[3] * p[0] + m[4] * p[1] + m[5],
	]
}
export function apply(p, m) {
	return m.reduce(transform, p);
}

export function round(val, p = 10000) {
	return Math.round(val * p) / p;
}