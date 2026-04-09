const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://gboavnbalcdhwfgpzbnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib2F2bmJhbGNkaHdmZ3B6Ym53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNzAwOCwiZXhwIjoyMDg3ODgzMDA4fQ.oU9wVnikt5eD55XtjikqazYR4A_yllTNr7jFouosuk8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        console.log('Searching for accounts...');
        const { data: accounts, error } = await supabase
            .from('mt5_accounts')
            .select('id, user_id, mt5_login')
            .limit(10);

        if (error) {
            fs.writeFileSync('ids_debug.txt', 'Error fetching accounts: ' + error.message);
            return;
        }

        console.log('Accounts found:', accounts.length);
        fs.writeFileSync('ids_debug.txt', JSON.stringify(accounts, null, 2));

        // Let's also look for the specific user by joining or by email if available in another table
        const { data: joseAcc, error: jError } = await supabase
            .from('mt5_accounts')
            .select('*')
            // Since I don't have the user_id, I'll search for accounts that might be his
            .limit(100);
            
        fs.appendFileSync('ids_debug.txt', '\n\nAll MT5 Accounts (first 100):\n' + JSON.stringify(joseAcc, null, 2));

    } catch (e) {
        fs.writeFileSync('ids_debug.txt', 'Exception: ' + e.message);
    }
}

run();
