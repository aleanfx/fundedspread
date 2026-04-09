const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gboavnbalcdhwfgpzbnw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdib2F2bmJhbGNkaHdmZ3B6Ym53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjMwNzAwOCwiZXhwIjoyMDg3ODgzMDA4fQ.oU9wVnikt5eD55XtjikqazYR4A_yllTNr7jFouosuk8';

const supabase = createClient(supabaseUrl, supabaseKey);

const userId = '44e1de2c-ed20-4473-8178-654565e45e6a';
const withdrawalId = 'b448e5ef-67f8-4140-919d-c7bad87f1f7a'; // El retiro de $745.61
const today = '2026-04-01';

async function run() {
    try {
        console.log('1. Updating withdrawal date to today...');
        const { error: dError } = await supabase
            .from('withdrawal_requests')
            .update({ 
                processed_at: today,
                created_at: today 
            })
            .eq('id', withdrawalId);

        if (dError) throw dError;
        console.log('Date updated in withdrawal_requests.');

        console.log('2. Updating leaderboard total_profit...');
        // Total = 1050 + 1483.5 + 745.61 = 3279.11
        const newTotal = 3279.11;
        
        const { error: lError } = await supabase
            .from('leaderboard_traders')
            .update({ total_profit: newTotal })
            .eq('user_id', userId);

        if (lError) throw lError;
        console.log('Leaderboard total_profit updated to 3279.11.');

        console.log('Final update completed successfully!');

    } catch (e) {
        console.error('CRITICAL ERROR:', e.message);
    }
}

run();
