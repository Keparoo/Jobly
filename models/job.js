'use strict';

const res = require('express/lib/response');
const db = require('../db');
const { NotFoundError } = require('../expressError');
const { sqlForPartialUpdate, sqlForFilter } = require('../helpers/sql');

/** Related functions for jobs. */

class Jobs {
	/** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { title, salary, equity, company_handle }
   *
   * */

	static async create({ title, salary, equity, companyHandle }) {
		const result = await db.query(
			`INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
			[ title, salary, equity, companyHandle ]
		);
		const job = result.rows[0];

		return job;
	}

	/** Find all jobs.
   *
   * Returns [{ title, salary, equity, company_handle }, ...]
   * 
   * Accepts the following optional query strings that will filter results:
   *    minEmployees: <integer>, maxEmployees: <integer>, nameLike: <string>
   * 
   *    Results will be filtered by:
   *        companies with num_employees >= minEmployees
   *        companies with num_employees <= maxEmployees
   *        companies with nameLike somewhere in the name (case insensitive)
   * 
   *    None, 1, 2 or all 3 three query strings may be used in a single query
   *    The queries will be combined with an AND
   *    Values of valid query strings will be validated at the route level with json-schema
   *    jsToSql is an object listing valid query strings with an object indicating:
   *        col: name of db column name to be filtered
   *        op: the operation to be used in the WHERE clause to filter results
   *    Query strings not found in jsToSql will be ignored
   *    If no valid query string is found, the search will be done unfiltered with no WHERE clause
   * 
   **/

	static async findAll(query) {
		// value needs to change from boolean to numeric type
		// so > '0.0' comparison can be done to show job "has equity"
		if ('hasEquity' in query) query.hasEquity = '0.0';

		const jsToSql = {
			minSalary: { col: 'salary', op: '>=' },
			hasEquity: { col: 'equity', op: '>' },
			title: { col: 'title', op: 'ILIKE' }
		};

		const { filter, values } = sqlForFilter(query, jsToSql);

		const jobsRes = await db.query(
			`SELECT j.id,
                  j.title,
                  j.salary,
                  j.equity,
                  j.company_handle AS "companyHandle",
                  c.name AS "companyName"
           FROM jobs j
           LEFT JOIN companies AS c ON c.handle = j.company_handle
           ${filter}
           ORDER BY title`,
			[ ...values ]
		);
		return jobsRes.rows;
	}

	/** Given an id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

	static async get(id) {
		const jobRes = await db.query(
			`SELECT j.id,
                  j.title,
                  j.salary,
                  j.equity,
                  j.company_handle AS "companyHandle",
                  c.name,
                  c.description,
                  c.num_employees AS "numEmployees",
                  c.logo_url AS "logoUrl"
           FROM jobs j
           LEFT JOIN companies AS c ON c.handle = j.company_handle
           WHERE id = $1`,
			[ id ]
		);

		const res = jobRes.rows[0];
		if (!res) throw new NotFoundError(`No job: ${id}`);

		const job = {
			id: res.id,
			title: res.title,
			salary: res.salary,
			equity: res.equity,
			company: {
				handle: res.companyHandle,
				name: res.name,
				description: res.description,
				numEmployees: res.numEmployees,
				logoUrl: res.logoUrl
			}
		};

		return job;
	}

	/** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   *
   * Returns {id, title, salary, equity, companyHandle}
   *
   * Throws NotFoundError if not found.
   */

	static async update(id, data) {
		const { setCols, values } = sqlForPartialUpdate(data, {});
		const handleVarIdx = '$' + (values.length + 1);

		const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "companyHandle"`;
		const result = await db.query(querySql, [ ...values, id ]);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);

		return job;
	}

	/** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

	static async remove(id) {
		const result = await db.query(
			`DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
			[ id ]
		);
		const job = result.rows[0];

		if (!job) throw new NotFoundError(`No job: ${id}`);
	}
}

module.exports = Jobs;
