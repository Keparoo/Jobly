const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

let dataToUpdate;
let jsToSql;

describe('Create SQL update string', () => {
	beforeEach(() => {
		dataToUpdate = { firstName: 'Aliya', age: 32 };
		jsToSql = {
			firstName: 'first_name',
			lastName: 'last_name',
			isAdmin: 'is_admin'
		};
	});

	test('Success: good input', function() {
		const results = sqlForPartialUpdate(dataToUpdate, jsToSql);
		expect(results).toEqual({
			setCols: '"first_name"=$1, "age"=$2',
			values: [ 'Aliya', 32 ]
		});
	});

	test('Fail: dataToUpdate empty', () => {
		try {
			dataToUpdate = '';
			sqlForPartialUpdate(dataToUpdate, jsToSql);
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});

	test('Success: empty jsToSql', () => {
		jsToSql = '';
		const results = sqlForPartialUpdate(dataToUpdate, jsToSql);
		expect(results).toEqual({
			setCols: '"firstName"=$1, "age"=$2',
			values: [ 'Aliya', 32 ]
		});
	});
});
