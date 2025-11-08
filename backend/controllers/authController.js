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

    // Use upsert instead of insert for user profile - don't overwrite existing roles
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .upsert([
        {
          id: authData.user.id,
          email: email,
          name: name,
          role: 'user' // Only set for new users, won't overwrite existing roles due to upsert
        }
      ], { 
        onConflict: 'id',
        ignoreDuplicates: false // This ensures existing roles are preserved
      })
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
      console.error('Login auth error:', authError);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log('Auth successful, user ID:', authData.user.id);

    // Get user profile from database - use upsert to handle both cases
    let userProfile;
    const { data: existingProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    console.log('Existing profile:', existingProfile);

    if (profileError || !existingProfile) {
      console.log('User profile not found, creating one automatically...');
      
      // Auto-create user profile if it doesn't exist - default to 'user' role
      const profileData = {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.name || 
              authData.user.user_metadata?.full_name || 
              authData.user.email.split('@')[0],
        role: 'user' // Default role for new users
      };

      console.log('Creating new profile with data:', profileData);

      const { data: newProfile, error: createError } = await adminSupabase
        .from('users')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (createError) {
        console.error('Error auto-creating user profile:', createError);
        return res.status(500).json({
          success: false,
          message: `User profile creation failed: ${createError.message}`
        });
      }

      userProfile = newProfile;
      console.log('Auto-created user profile successfully:', userProfile);
    } else {
      // Profile exists - PRESERVE THE EXISTING ROLE
      userProfile = existingProfile;
      console.log('Found existing user profile, preserving role:', userProfile.role);
    }

    // Generate JWT token with user ID
    const token = jwt.sign(
      { 
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role // Use the actual role from database
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log('Login successful for user:', email, 'with role:', userProfile.role);
    res.json({
      success: true,
      token,
      data: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role // Use the actual role from database
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