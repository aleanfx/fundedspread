/**
 * Bot Schedule System — Deterministic withdrawal schedule generation
 * 
 * Each bot's withdrawal schedule is derived from its UUID, so it's
 * always consistent without needing DB storage. Bots "withdraw" 
 * gradually over the month based on their schedule.
 */

/* Simple 32-bit hash for deterministic seeding */
function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return Math.abs(hash);
}

/* Mulberry32 PRNG — deterministic from seed */
function seededRandom(seed: number): () => number {
    return function () {
        seed |= 0;
        seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

export interface WithdrawalEntry {
    day: number;
    amount: number;
}

/**
 * Generate a deterministic withdrawal schedule for a bot.
 * ~60% withdraw every ~7 days, ~40% every ~14 days.
 * First withdrawal between day 1-6 so table isn't empty early.
 */
export function generateBotSchedule(botId: string, totalProfit: number): WithdrawalEntry[] {
    const hash = simpleHash(botId);
    const rng = seededRandom(hash);

    // Withdrawal frequency
    const interval = rng() > 0.4 ? 7 : 14;

    // First withdrawal day — 20% on day 1-2, 30% on day 3-4, rest on 5-7
    const roll = rng();
    let firstDay: number;

    // Top bots (Elite/Legend) ALWAYS have a Day 1 withdrawal "head start" 
    // to keep the leaderboard competitive even on the first of the month.
    if (totalProfit >= 4000) {
        firstDay = 1;
    } else if (roll < 0.2) {
        firstDay = Math.floor(rng() * 2) + 1;       // Day 1-2
    } else if (roll < 0.5) {
        firstDay = Math.floor(rng() * 2) + 3;  // Day 3-4
    } else {
        firstDay = Math.floor(rng() * 3) + 5;                   // Day 5-7
    }

    // Generate withdrawal days
    const days: number[] = [];
    let currentDay = firstDay;
    while (currentDay <= 28) {
        days.push(currentDay);
        const variance = Math.floor(rng() * 5) - 2; // ±2 day variance
        currentDay += interval + variance;
        if (currentDay <= days[days.length - 1]) {
            currentDay = days[days.length - 1] + 3;
        }
    }

    if (days.length === 0) days.push(firstDay);

    // Distribute total profit across days with realistic variance
    const entries: WithdrawalEntry[] = [];
    let remaining = totalProfit;

    for (let i = 0; i < days.length; i++) {
        if (i === days.length - 1) {
            entries.push({ day: days[i], amount: Math.round(remaining * 100) / 100 });
        } else {
            const avg = remaining / (days.length - i);
            
            // Adjust variance for first withdrawal if it's high profit
            // Top bots get ~40-60% of their total profit on the first withdrawal
            let variance;
            if (i === 0 && totalProfit >= 4000) {
                variance = totalProfit * (0.4 + rng() * 0.25); 
            } else {
                variance = avg * (0.6 + rng() * 0.8); // 60%-140% of average
            }

            const amount = Math.min(variance, remaining * 0.85);
            entries.push({ day: days[i], amount: Math.round(amount * 100) / 100 });
            remaining -= amount;
        }
    }

    return entries;
}

/**
 * Calculate the visible profit for a bot on the current day of the month.
 * Returns the sum of all scheduled withdrawals that have "happened" by today.
 */
export function calculateBotDayProfit(botId: string, totalProfit: number, dayOfMonth?: number): number {
    const today = dayOfMonth ?? new Date().getDate();
    const schedule = generateBotSchedule(botId, totalProfit);

    let visible = 0;
    for (const entry of schedule) {
        if (today >= entry.day) {
            visible += entry.amount;
        }
    }

    // Showcase Calibration: Top 1 Paula Ramos should hit EXACTLY $4820 today for realistic premium look.
    if (botId === 'ef3c15ba-5328-4dff-b2af-a4421752828b' && today === 1) {
        return 4820;
    }

    return Math.round(visible * 100) / 100;
}

/* ============================================
   BOT GENERATION DATA
   ============================================ */

const FIRST_NAMES_M = [
    "Carlos", "Miguel", "Juan", "Pedro", "Diego", "Andrés", "Luis", "José", "Fernando",
    "Ricardo", "Alejandro", "Marco", "Gabriel", "Daniel", "Sergio", "Roberto", "Rafael",
    "Omar", "Héctor", "Martín", "Eduardo", "Pablo", "Raúl", "Gustavo", "Fabián",
    "Cristian", "Nicolás", "Sebastián", "Mateo", "Santiago", "Emilio", "Arturo",
    "Ignacio", "Felipe", "Tomás", "Javier", "Jorge", "Antonio", "Adrián", "Leonardo",
    "Agustín", "Iván", "Francisco", "Gonzalo", "Facundo", "Bruno", "Valentín", "Camilo",
];

const FIRST_NAMES_F = [
    "María", "Ana", "Laura", "Carmen", "Isabella", "Sofía", "Valentina", "Camila",
    "Daniela", "Luciana", "Andrea", "Carolina", "Gabriela", "Paola", "Natalia",
    "Fernanda", "Mariana", "Catalina", "Victoria", "Jimena", "Antonella", "Nicole",
    "Renata", "Paula", "Valeria", "Diana", "Alejandra", "Mónica", "Claudia", "Patricia",
];

const LAST_NAMES = [
    "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez",
    "Sánchez", "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz",
    "Morales", "Ortiz", "Gutiérrez", "Chávez", "Ramos", "Vargas", "Castillo",
    "Mendoza", "Ruiz", "Jiménez", "Medina", "Aguilar", "Vega", "Castro", "Ríos",
    "Herrera", "Silva", "Rojas", "Delgado", "Reyes", "Guerrero", "Navarro", "Romero",
    "Acosta", "Molina", "Paredes", "Salazar", "Escobar", "Núñez", "Ávila", "Cordero",
    "Pardo", "Bravo", "Espinoza", "Suárez",
];

const COUNTRIES = [
    "ar", "mx", "co", "br", "cl", "pe", "ec", "do", "uy", "pa",
    "cr", "gt", "sv", "py", "ve", "bo", "es", "us", "ni", "tt",
];

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 200000];

export interface GeneratedBot {
    username: string;
    checkpoint_level: number;
    total_profit: number;
    win_rate: number;
    risk_reward: number;
    account_size: number;
    trades_count: number;
    rank_title: string;
    is_fake: boolean;
    country_code: string;
    generation_month: string;
    avatar_url?: string | null;
}

/**
 * Generate N realistic trading bots for a given month.
 */
export function generateBots(count: number, month: string): GeneratedBot[] {
    const seed = simpleHash(month + "bots");
    const rng = seededRandom(seed);
    const bots: GeneratedBot[] = [];
    const usedNames = new Set<string>();

    for (let i = 0; i < count; i++) {
        // Generate unique name
        let username = "";
        let attempts = 0;
        do {
            const isFemale = rng() > 0.6;
            const firstNames = isFemale ? FIRST_NAMES_F : FIRST_NAMES_M;
            const first = firstNames[Math.floor(rng() * firstNames.length)];
            const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];

            // 50% "First L.", 30% "First Last", 20% "First Last I."
            const fmt = rng();
            if (fmt < 0.5) {
                username = `${first} ${last.charAt(0)}.`;
            } else if (fmt < 0.8) {
                username = `${first} ${last}`;
            } else {
                const second = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
                username = `${first} ${last} ${second.charAt(0)}.`;
            }
            attempts++;
        } while (usedNames.has(username) && attempts < 20);
        usedNames.add(username);

        // Stats — realistic distribution
        const accountSize = ACCOUNT_SIZES[Math.floor(rng() * ACCOUNT_SIZES.length)];

        // Profit: skewed distribution — significantly higher for Top 10 positioning
        // Range: $200 - $15,000 for realistic "High Stakes" feel
        let totalProfit: number;
        const profitRoll = rng();
        if (profitRoll < 0.15) {
            totalProfit = Math.round(200 + rng() * 300);       // $200-$500 (15%)
        } else if (profitRoll < 0.55) {
            totalProfit = Math.round(500 + rng() * 1500);      // $500-$2000 (40%)
        } else if (profitRoll < 0.80) {
            totalProfit = Math.round(2000 + rng() * 3000);     // $2000-$5000 (25%)
        } else if (profitRoll < 0.93) {
            totalProfit = Math.round(5000 + rng() * 5000);     // $5000-$10000 (13%)
        } else {
            totalProfit = Math.round(10000 + rng() * 8000);    // $10000-$18000 (7%)
        }

        const winRate = Math.round((52 + rng() * 26) * 10) / 10; // 52%-78%
        const riskReward = Math.round((1.2 + rng() * 2.3) * 100) / 100; // 1.2-3.5
        const tradesCount = Math.round(30 + rng() * 470); // 30-500

        // Rank based on profit
        let rankTitle = "novato";
        if (totalProfit >= 3000) rankTitle = "elite";
        else if (totalProfit >= 1000) rankTitle = "warrior";

        const country = COUNTRIES[Math.floor(rng() * COUNTRIES.length)];
        const checkpointLevel = totalProfit >= 3000 ? 3 : totalProfit >= 1000 ? 2 : 1;

        // ~40% of bots get a realistic profile picture (pravatar deterministically by username)
        const hasAvatar = rng() < 0.4;
        const avatarUrl = hasAvatar ? `https://i.pravatar.cc/150?u=${encodeURIComponent(username + month)}` : null;

        bots.push({
            username,
            checkpoint_level: checkpointLevel,
            total_profit: totalProfit,
            win_rate: winRate,
            risk_reward: riskReward,
            account_size: accountSize,
            trades_count: tradesCount,
            rank_title: rankTitle,
            is_fake: true,
            country_code: country,
            generation_month: month,
            avatar_url: avatarUrl,
        });
    }

    // Sort by total_profit descending for consistency
    bots.sort((a, b) => b.total_profit - a.total_profit);
    return bots;
}
