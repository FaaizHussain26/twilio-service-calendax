import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pgPool } from "../config/pg";

const registerUser = async (
  email: string,
  password: string,
  role: string,
  name: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (email, password, role, name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, role, name
  `;
  const values = [email, hashedPassword, role, name];
  const { rows } = await pgPool.query(query, values);
  return rows[0];
};

const loginUser = async (email: string, password: string) => {
  const query = `
    SELECT id, email, password, role, name
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await pgPool.query(query, [email]);
  const user = rows[0];
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  const { password: _pw, ...safeUser } = user;
  return { user: safeUser, token, message: "Login successful" };
};

export { registerUser, loginUser };
