'use strict';

const { BadRequestError } = require('../expressError');

/*
* This function takes an object of key/value pairs of data to be updated:
    dataToUpdate:
    {firstName: 'Aliya', age: 32}
* and an object of key/value pairs mapping js variables to db column names:
    jsToSql:
    {
    firstName: "first_name",
    lastName: "last_name",
    isAdmin: "is_admin",
    }
    For each column in dataToBeUpdated, the key is converted to the db column name
    and mapped to $1, $2 etc, concatenated to a string => setCols = '"first_name"=$1 "age"=$2'
    The values to be updated are pushed into an array => values = [ 'Aliya', 32 ]
    Returned: { setCols, values }
*/

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
	const keys = Object.keys(dataToUpdate);
	if (keys.length === 0) throw new BadRequestError('No data');

	// {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
	const cols = keys.map(
		(colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
	);

	return {
		setCols: cols.join(', '),
		values: Object.values(dataToUpdate)
	};
}

/*
* Generates a valid WHERE clause from a query string given a jsToSql conversion object:
        query = {key1: value1, key2: value2, key3: value3}

  jsToSql is an object with valid queries as keys, each with the corresponding db column name and corresponding operation:
        jsToSql = { minEmployees: { col: 'num_employees', op: '>=' },
                    maxEmployees: { col: 'num_employees', op: '<=' },
                    nameLike: {col: 'name', op: 'ILIKE'} }

* Checks for valid query strings from keys in jsToSql

    For query = {minEmployees: 100, maxEmployees: 1000, nameLike: 'corp'}
    filter = 'WHERE num_employees >= $1 AND num_employees > $2 AND name ILIKE $3'
    values = [100, 1000, '%corp%']
    
    returning { 'WHERE num_employees >= $1 AND num_employees > $2 AND name ILIKE $3',
                [100, 1000, '%corp%'] }

    Query strings not found in jsToSql will be ignored
    This function assumes that values assigned to valid query strings have already been validated

    If there is no valid query:
    returning {'', []}
*/

const sqlForFilter = (query, jsToSql) => {
	let first = true;
	let filter = 'WHERE ';
	let idx = 0;
	const values = [];

	for (let key in query) {
		if (key in jsToSql) {
			first
				? (filter += `${jsToSql[key].col} ${jsToSql[key].op} $${++idx}`)
				: (filter += ` AND ${jsToSql[key].col} ${jsToSql[key].op} $${++idx}`);

			// Value needs to be wrapped: %value% for ILIKE pattern matching
			if (jsToSql[key].op === 'ILIKE') query[key] = `%${query[key]}%`;

			values.push(query[key]);
			// First query done, subseqent queries need an AND
			first = false;
		}
	}
	if (values.length === 0) filter = '';
	console.log(filter, values);
	return { filter, values };
};

module.exports = {
	sqlForPartialUpdate,
	sqlForFilter
};
