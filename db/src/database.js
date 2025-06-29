const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./mydb.sqlite');

db.serialize(() => {
  db.each("SELECT sql FROM sqlite_master WHERE type='table' AND name='nom_de_la_table';'", (err, row) => {
    if (err) {
      console.error(err);
    } else {
      console.log(row.name);
    }
  });
});

db.close();
