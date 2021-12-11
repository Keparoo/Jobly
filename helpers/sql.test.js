const { sqlForPartialUpdate } = require('./sql');

const dataToUpdate = { firstName: 'Aliya', age: 32 };
const jsToSql = {
	firstName: 'first_name',
	lastName: 'last_name',
	isAdmin: 'is_admin'
};

describe('Create SQL update string', function() {
	test('works: good input', function() {
		const results = sqlForPartialUpdate(dataToUpdate, jsToSql);
		expect(results).toEqual({
			setCols: '"first_name"=$1, "age"=$2',
			values: [ 'Aliya', 32 ]
		});
	});
});
