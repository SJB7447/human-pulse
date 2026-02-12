import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) envVars[key.trim()] = val.trim().replace(/^["']|["']$/g, '');
});

const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const key = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];
const supabase = createClient(url, key);

async function testSignup() {
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`\n🚀 Attempting signup with: ${email}`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                username: 'TestUser',
                full_name: 'Test User'
            }
        }
    });

    if (error) {
        console.error('❌ Signup Failed:', error.message);
        return;
    }

    const userId = data.user?.id;
    console.log(`✅ Auth User Created. ID: ${userId}`);

    // Wait a moment for trigger to fire
    console.log('⏳ Waiting 2s for trigger...');
    await new Promise(r => setTimeout(r, 2000));

    // Check profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (profileError) {
        console.error('❌ Profile Fetch Error:', profileError.message);
        console.error('⚠️ This usually means the "handle_new_user" trigger is MISSING or FAILED.');
        console.log(`\nTo fix, please run the SQL in 'supabase/migrations/add_profile_trigger.sql' in the Supabase Dashboard.`);
    } else if (!profile) {
        console.error('❌ Profile NOT found (result is null or empty).');
    } else {
        console.log('✅ Profile Successfully Created via Trigger!');
        console.log('User:', profile);
    }
}

testSignup();
