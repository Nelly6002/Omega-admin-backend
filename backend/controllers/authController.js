// controllers/authController.js
import { supabase, adminSupabase } from "../database/supabase.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    // Use Supabase Auth to create user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Use admin client to create user profile (bypasses RLS for initial creation)
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          name: name,
          role: 'user' // Default role
        }
      ])
      .select()
      .single();

    if (userError) {
      console.error('Error creating user profile:', userError);
      // Even if profile creation fails, the auth user was created
    }

    console.log('User registered successfully:', authData.user.id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        role: 'user'
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration"
    });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Use Supabase Auth for login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Get user profile (RLS will ensure users can only access their own data)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: authData.user.id, 
        email: authData.user.email,
        role: userProfile?.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('Login successful for user:', email);
    res.json({
      success: true,
      token,
      data: {
        id: authData.user.id,
        email: authData.user.email,
        name: userProfile?.name,
        role: userProfile?.role || 'user'
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during login'
    });
  }
};