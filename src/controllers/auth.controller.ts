import { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role, name } = req.body;
    await registerUser(email, password, role, name);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token, message } = await loginUser(email, password);
    res.json({ user, token, message });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
};


export { register, login };