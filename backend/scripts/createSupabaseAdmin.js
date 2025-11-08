import { adminSupabase } from '../database/supabase.js';
import dotenv from 'dotenv';
dotenv.config();

async function createAdminUser() {
  try {
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: process.env.ADMIN_NAME }
    });

    if (authError) throw authError;

    // Create admin user profile
    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: process.env.ADMIN_EMAIL,
          name: process.env.ADMIN_NAME,
          role: 'admin'
        }
      ])
      .select()
      .single();

    if (userError) throw userError;

    console.log('✅ Admin user created successfully:');
    console.log('Email:', process.env.ADMIN_EMAIL);
    console.log('Password:', process.env.ADMIN_PASSWORD);
    console.log('User ID:', authData.user.id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  }
}

createAdminUser();