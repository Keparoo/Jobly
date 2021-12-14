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
* Checks for valid query strings: minEmployees, maxEmployees, nameLike
* If valid queries: returns the appropriate SQL WHERE clause and an array of values:

    For query = {minEmployees: 5, maxEmployees: 10, nameLike: 'IBM'}
    filter = 'WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3'
    values = [5, 10, 'IBM']
    
    returning { 'WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3',
                [5, 10, 'IBM'] }

    Query strings other than minEmployees, maxEmployees and nameLike will be ignored

    If there is no valid query:
    returning {'', []}
*/

const sqlForFilter = (query) => {
	let minSQL;
	let maxSQL;
	let nameSQL;
	let filter = 'WHERE ';
	const values = [];
	let idx = 0;

	if (query['minEmployees'] && query['minEmployees'] !== '') {
		minSQL = `num_employees >= $${++idx}`;
		filter += minSQL;
		values.push(query['minEmployees']);
	}
	if (query['maxEmployees'] && query['maxEmployees'] !== '') {
		maxSQL = `num_employees <= $${++idx}`;
		minSQL ? (filter += ` AND ${maxSQL}`) : (filter += maxSQL);
		values.push(query['maxEmployees']);
	}
	if (query['nameLike'] && query['nameLike'] !== '') {
		nameSQL = `name ILIKE $${++idx}`;
		minSQL || maxSQL ? (filter += ` AND ${nameSQL}`) : (filter += nameSQL);
		values.push(`%${query['nameLike']}%`);
	}

	console.log(filter, values);
	if (values.length === 0) filter = '';
	return { filter, values };
};

/*
* Checks for valid query strings: minSalary, hasEquity, and title
* If valid queries: returns the appropriate SQL WHERE clause and an array of values:

    For query = {minSalary: 1000, hasEquity: true, title: 'developer'}
    filter = 'WHERE salary >= $1 AND hasEquity > $2 AND title ILIKE $3'
    values = [1000, '0.0', 'developer']
    
    returning { 'WHERE salary >= $1 AND hasEquity > $2 AND title ILIKE $3',
                [1000, '0.0', 'developer'] }

    Query strings other than minSalary, hasEquity and title will be ignored

    If there is no valid query:
    returning {'', []}
*/

const sqlForJobFilter = (query) => {
	let minSalarySQL;
	let hasEquitySQL;
	let titleSQL;
	let filter = 'WHERE ';
	const values = [];
	let idx = 0;

	// console.log(query);

	if (query['minSalary'] && query['minSalary'] !== '') {
		minSalarySQL = `salary >= $${++idx}`;
		filter += minSalarySQL;
		values.push(query['minSalary']);
	}
	if (query['hasEquity'] && query['hasEquity'] !== '') {
		hasEquitySQL = `equity > $${++idx}`;
		minSalarySQL
			? (filter += ` AND ${hasEquitySQL}`)
			: (filter += hasEquitySQL);
		values.push('0.0');
	}
	if (query['title'] && query['title'] !== '') {
		titleSQL = `title ILIKE $${++idx}`;
		minSalarySQL || hasEquitySQL
			? (filter += ` AND ${titleSQL}`)
			: (filter += titleSQL);
		values.push(`%${query['title']}%`);
	}

	if (values.length === 0) filter = '';
	console.log(query, filter, values);
	return { filter, values };
};

module.exports = { sqlForPartialUpdate, sqlForFilter, sqlForJobFilter };
