const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://bmfruyjggwyyngvyviks.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtZnJ1eWpnZ3d5eW5ndnl2aWtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDIwOTYsImV4cCI6MjA4NTk3ODA5Nn0.F1D8P4oerXZqg5a0Rokg1aKEMsc65r24e6PRdSQoXa4'
);

async function testSignup() {
    console.log("Starting signup test...");
    const { data, error } = await supabase.auth.signUp({
        email: 'test.alegutierrez123@gmail.com',
        password: 'password123',
        options: {
            data: {
                full_name: 'TestUser123',
            },
        }
    });
    console.log("Error:", error);
    console.log("Data:", data);
}
testSignup();
