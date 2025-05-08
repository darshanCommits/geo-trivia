import { Pool } from "pg";
import bcrypt from "bcrypt";
import { config } from "../config";

const pool = new Pool({
	connectionString: config.DATABASE_URL,
});

export interface Account {
	id: number;
	email: string;
	password_hash: string;
}

export async function createAccount(
	email: string,
	password: string,
): Promise<Account> {
	const saltRounds = 10;
	const passwordHash = await bcrypt.hash(password, saltRounds);

	const result = await pool.query(
		"INSERT INTO accounts (email, password_hash) VALUES ($1, $2) RETURNING *",
		[email, passwordHash],
	);

	return result.rows[0];
}

export async function validateAccount(
	email: string,
	password: string,
): Promise<Account | null> {
	const result = await pool.query("SELECT * FROM accounts WHERE email = $1", [
		email,
	]);

	if (result.rows.length === 0) {
		return null;
	}

	const account = result.rows[0];
	const isValid = await bcrypt.compare(password, account.password_hash);

	return isValid ? account : null;
}

export async function getAccountById(id: number): Promise<Account | null> {
	const result = await pool.query("SELECT * FROM accounts WHERE id = $1", [id]);

	return result.rows[0] || null;
}
