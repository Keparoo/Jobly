'use strict';

const { sqlForPartialUpdate, sqlForFilter } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('Create SQL update string', () => {
	let dataToUpdate;
	let jsToSql;
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

describe('Create Filter SQL', () => {
	let query;
	beforeEach(() => {
		query = { minEmployees: 'Aliya', maxEmployees: 32, nameLike: 'ibm' };
	});

	test('Success: 3 good query strings', function() {
		query = { minEmployees: 100, maxEmployees: 500, nameLike: 'ibm' };
		const results = sqlForFilter(query);
		expect(results).toEqual({
			filter:
				'WHERE num_employees >= $1 AND num_employees <= $2 AND name ILIKE $3',
			values: [ 100, 500, '%ibm%' ]
		});
	});

	test('Success: 2 good query strings', function() {
		query = { minEmployees: 100, maxEmployees: 500 };
		const results = sqlForFilter(query);
		expect(results).toEqual({
			filter: 'WHERE num_employees >= $1 AND num_employees <= $2',
			values: [ 100, 500 ]
		});
	});

	test('Success: 1 good query strings', function() {
		query = { nameLike: 'ibm' };
		const results = sqlForFilter(query);
		expect(results).toEqual({
			filter: 'WHERE name ILIKE $1',
			values: [ '%ibm%' ]
		});
	});

	test('No query strings: return empty vars', function() {
		query = {};
		const results = sqlForFilter(query);
		expect(results).toEqual({
			filter: '',
			values: []
		});
	});

	test('Invalid query string: return empty vars', function() {
		query = { invalid: 'invalid' };
		const results = sqlForFilter(query);
		expect(results).toEqual({
			filter: '',
			values: []
		});
	});

	test('Valid & invalid query strings: return valid only', function() {
		query = {
			invalid: 'invalid',
			nameLike: 'ibm',
			invalid2: 'invalid2',
			minEmployees: 100,
			invalid3: 'invalid3'
		};
		const results = sqlForFilter(query);
		expect(results).toEqual({
			filter: 'WHERE num_employees >= $1 AND name ILIKE $2',
			values: [ 100, '%ibm%' ]
		});
	});
});
