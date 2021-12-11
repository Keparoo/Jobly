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

module.exports = { sqlForPartialUpdate };
