const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('=').map(s => s.trim()))
);

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function syncLeaderboard() {
  const userId = '44e1de2c-ed20-4473-8178-654565e45e6a';
  
  // Calcular total de retiros aprobados
  const { data: withdrawals, error: wError } = await supabase
    .from('withdrawal_requests')
    .select('user_amount, amount')
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (wError) throw wError;

  const totalWithdrawn = withdrawals.reduce((acc, w) => acc + (w.user_amount || w.amount || 0), 0);
  
  // Agregar los retiros sintéticos previos de Jose (1050 + 1483.50)
  const finalProfit = totalWithdrawn + 1050 + 1483.50;

  console.log('Total Withdrawn (Real):', totalWithdrawn);
  console.log('Final Profit for Leaderboard:', finalProfit);

  // Actualizar Leaderboard
  const { error: lError } = await supabase
    .from('leaderboard_traders')
    .update({ 
      total_profit: finalProfit
    })
    .eq('user_id', userId);

  if (lError) throw lError;
  console.log('Leaderboard updated successfully!');
}

syncLeaderboard().catch(console.error);
