import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
    console.error('❌ Could not read .env.local');
    process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, val] = line.split('=');
    if (key && val) {
        envVars[key.trim()] = val.trim().replace(/^["']|["']$/g, ''); // Remove quotes
    }
});

const url = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const key = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!url || !key) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
}

console.log(`✅ Found credentials for: ${url}`);

const supabase = createClient(url, key);

async function check() {
    console.log('\n--- Checking Tables & Columns ---\n');

    // Check 1: Profiles & is_admin
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, is_admin')
        .limit(1);

    if (profileError) {
        if (profileError.code === '42703') { // Undefined column
            console.error('❌ Profiles Table: Column "is_admin" MISSING.');
        } else if (profileError.code === '42P01') { // Undefined table
            console.error('❌ Profiles Table: TABLE MISSING.');
        } else {
            console.error('❌ Profiles Table: Error accessing:', profileError.message);
        }
    } else {
        console.log('✅ Profiles Table: OK (Found is_admin)');
    }

    // Check 2: Articles
    const { error: articleError } = await supabase.from('articles').select('id').limit(1);
    if (articleError) console.error('❌ Articles Table: Error:', articleError.message);
    else console.log('✅ Articles Table: OK');

    // Check 3: Interactions & user_opinion
    const { error: interactionError } = await supabase
        .from('interactions')
        .select('id, user_opinion')
        .limit(1);

    if (interactionError) {
        if (interactionError.code === '42703') {
            console.error('❌ Interactions Table: Column "user_opinion" MISSING.');
        } else {
            console.error('❌ Interactions Table: Error:', interactionError.message);
        }
    } else {
        console.log('✅ Interactions Table: OK (Found user_opinion)');
    }

    // Check 4: Orders
    const { error: orderError } = await supabase.from('orders').select('id').limit(1);
    if (orderError) console.error('❌ Orders Table: Error:', orderError.message);
    else console.log('✅ Orders Table: OK');

    console.log('\n--- Diagnosis Complete ---');
}

check();
