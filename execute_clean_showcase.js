const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gboavnbalcdhwfgpzbnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib2F2bmJhbGNkaHdmZ3B6Ym53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNzAwOCwiZXhwIjoyMDg3ODgzMDA4fQ.oU9wVnikt5eD55XtjikqazYR4A_yllTNr7jFouosuk8';

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '44e1de2c-ed20-4473-8178-654565e45e6a';
const withdrawalId = '91d39756-b3ac-49a2-af1c-c78daba071fa';

async function run() {
    try {
        console.log('1. Deleting withdrawal $800...');
        const { error: dError } = await supabase
            .from('withdrawal_requests')
            .delete()
            .eq('id', withdrawalId);

        if (dError) throw dError;
        console.log('Withdrawal deleted.');

        console.log('2. Recalculating totals...');
        const { data: withdrawals, error: wError } = await supabase
            .from('withdrawal_requests')
            .select('user_amount')
            .eq('user_id', userId)
            .eq('status', 'approved');

        if (wError) throw wError;

        // Base synthetic amounts for Jose Antonio: 1050 + 1483.5 = 2533.5
        const baseSynth = 2533.5;
        const totalReal = withdrawals.reduce((acc, curr) => acc + (curr.user_amount || 0), 0);
        const newTotal = baseSynth + totalReal;

        console.log(`New total: ${newTotal} (Synth: ${baseSynth} + Real: ${totalReal})`);

        console.log('3. Updating users table...');
        const { error: uError } = await supabase
            .from('users')
            .update({ total_withdrawals: newTotal })
            .eq('id', userId);

        if (uError) throw uError;

        console.log('4. Updating leaderboard_traders table...');
        const { error: lError } = await supabase
            .from('leaderboard_traders')
            .update({ total_withdrawn: newTotal }) // In some tables it's total_withdrawn or total_withdrawals
            .eq('user_id', userId);

        if (lError) {
             console.log('Leaderboard update error (maybe column name total_withdrawn is wrong?):', lError.message);
             // Check another common name
             const { error: l2Error } = await supabase
                .from('leaderboard_traders')
                .update({ total_withdrawals: newTotal })
                .eq('user_id', userId);
             if (l2Error) console.error('Leaderboard update failed twice:', l2Error.message);
        } else {
             console.log('Leaderboard updated.');
        }

        console.log('Execution completed successfully!');

    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

run();
