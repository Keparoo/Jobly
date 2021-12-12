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
    filter = 'WHERE minEmployees=$1 AND maxEmployees=$2 AND nameLike=$3'
    values = [5, 10, 'IBM']
    
    returning { 'WHERE minEmployees=$1 AND maxEmployees=$2 AND nameLike=$3',
                [5, 10, 'IBM'] }

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
	if (query['minEmployees'] !== undefined && query['minEmployees'] !== '') {
		minSQL = `num_employees >= $${++idx}`;
		filter += minSQL;
		values.push(query['minEmployees']);
	}
	if (query['maxEmployees'] !== undefined && query['maxEmployees'] !== '') {
		maxSQL = `num_employees <= $${++idx}`;
		minSQL ? (filter += ` AND ${maxSQL}`) : (filter += maxSQL);
		values.push(query['maxEmployees']);
	}
	if (query['nameLike'] !== undefined && query['nameLike'] !== '') {
		nameSQL = `name ILIKE $${++idx}`;
		minSQL || maxSQL ? (filter += ` AND ${nameSQL}`) : (filter += nameSQL);
		values.push(`%${query['nameLike']}%`);
	}

	if (values.length === 0) filter = '';
	return { filter, values };
};

module.exports = { sqlForPartialUpdate, sqlForFilter };
