const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'chithu',
  database: 'complaintt_system'
});

db.connect(err => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║          COMPLAINT SYSTEM DIAGNOSTIC REPORT                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Show ALL complaints
  db.query('SELECT id, name, email, status, location, category, head_id FROM complaints ORDER BY id DESC', (err, complaints) => {
    if (err) {
      console.error('Error fetching complaints:', err.message);
      db.end();
      process.exit(1);
    }

    console.log('📋 ALL COMPLAINTS IN DATABASE:');
    console.log('─'.repeat(60));
    if (complaints.length === 0) {
      console.log('⚠️  NO COMPLAINTS FOUND IN DATABASE!');
    } else {
      complaints.forEach(c => {
        console.log(`ID: ${c.id} | Status: ${c.status} | Location: ${c.location} | Category: ${c.category}`);
        console.log(`   Name: ${c.name} | Email: ${c.email} | Head ID: ${c.head_id}`);
      });
    }

    // Step 2: Count by status
    db.query('SELECT status, COUNT(*) as count FROM complaints GROUP BY status', (err, stats) => {
      console.log('\n📊 COMPLAINTS BY STATUS:');
      console.log('─'.repeat(60));
      if (stats.length === 0) {
        console.log('⚠️  No status information');
      } else {
        stats.forEach(s => {
          console.log(`   ${s.status}: ${s.count} complaint(s)`);
        });
      }

      // Step 3: Show admins
      db.query('SELECT id, name, email, location, category, status FROM admins', (err, admins) => {
        console.log('\n👤 ADMINS IN SYSTEM:');
        console.log('─'.repeat(60));
        if (admins.length === 0) {
          console.log('⚠️  NO ADMINS FOUND IN DATABASE!');
        } else {
          admins.forEach(a => {
            console.log(`ID: ${a.id} | ${a.name} | ${a.email}`);
            console.log(`   Status: ${a.status} | Location: ${a.location} | Category: ${a.category}`);
          });
        }

        // Step 4: Check for matches
        if (complaints.length > 0 && admins.length > 0) {
          console.log('\n🔍 LOCATION/CATEGORY MATCHING:');
          console.log('─'.repeat(60));
          complaints.forEach(c => {
            const matchingAdmin = admins.find(a => 
              a.location === c.location && 
              a.category === c.category && 
              a.status === 'ACTIVE'
            );
            if (matchingAdmin) {
              console.log(`✅ Complaint ID ${c.id} → Admin ID ${matchingAdmin.id} (${matchingAdmin.name})`);
            } else {
              console.log(`❌ Complaint ID ${c.id} → NO MATCHING ADMIN FOUND`);
              console.log(`   Looking for: location='${c.location}' + category='${c.category}'`);
            }
          });
        }

        // Step 5: Check table structure
        db.query('DESCRIBE complaints', (err, columns) => {
          console.log('\n⚙️  COMPLAINTS TABLE STRUCTURE:');
          console.log('─'.repeat(60));
          const criticalColumns = ['id', 'status', 'created_at', 'location', 'category'];
          criticalColumns.forEach(colName => {
            const col = columns.find(c => c.Field === colName);
            if (col) {
              console.log(`✅ ${colName}: ${col.Type}`);
            } else {
              console.log(`❌ ${colName}: MISSING!`);
            }
          });
        });

        console.log('\n' + '═'.repeat(60) + '\n');
        db.end();
        process.exit(0);
      });
    });
  });
});
