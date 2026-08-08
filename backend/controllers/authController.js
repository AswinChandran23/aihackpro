import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new teacher
// @route   POST /api/auth/register
// @access  Public
export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if teacher exists
    const { data: existingTeacher, error: findError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single();

    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 is the error code for 0 rows returned from a .single() query, which is expected if teacher doesn't exist.
      console.error('Error finding teacher:', findError);
      return res.status(500).json({ message: 'Server error during registration' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create teacher
    const { data: newTeacher, error: insertError } = await supabase
      .from('teachers')
      .insert([
        {
          name,
          email,
          password_hash,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting teacher:', insertError);
      return res.status(500).json({ message: 'Error creating teacher record' });
    }

    if (newTeacher) {
      res.status(201).json({
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        token: generateToken(newTeacher.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid teacher data' });
    }
  } catch (error) {
    console.error('Registration Catch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a teacher
// @route   POST /api/auth/login
// @access  Public
export const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for teacher email
    const { data: teacher, error: findError } = await supabase
      .from('teachers')
      .select('*')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Error finding teacher:', findError);
      return res.status(500).json({ message: 'Server error during login' });
    }

    if (!teacher) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, teacher.password_hash);

    if (isMatch) {
      res.json({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        token: generateToken(teacher.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Catch Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
