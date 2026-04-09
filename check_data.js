const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://gboavnbalcdhwfgpzbnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib2F2bmJhbGNkaHdmZ3B6Ym53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNzAwOCwiZXhwIjoyMDg3ODgzMDA4fQ.oU9wVnikt5eD55XtjikqazYR4A_yllTNr7jFouosuk8';

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '44e1de2c-ed20-4473-8178-654565e45e6a';

async function run() {
    try {
        console.log('Searching for withdrawals for user:', userId);
        const { data: withdrawals, error: wError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('user_id', userId);

        if (wError) {
            console.error('Error fetching withdrawals:', wError);
        } else {
            console.log('Withdrawals found:', withdrawals);
            fs.writeFileSync('withdrawals_debug.txt', JSON.stringify(withdrawals, null, 2));
        }

        console.log('Searching for certificates for user:', userId);
        // I'll try to find if a certificates table exists by just trying to select from it
        const { data: certificates, error: cError } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', userId);

        if (cError) {
            console.log('Certificates table might not exist or error:', cError.message);
        } else {
            console.log('Certificates found:', certificates);
            fs.appendFileSync('withdrawals_debug.txt', '\n\nCertificates:\n' + JSON.stringify(certificates, null, 2));
        }

    } catch (e) {
        console.error('Exception:', e.message);
    }
}

run();
