var db = openDatabase('mydb', '1.0', 'Github database', 2 * 1024 * 1024);

db.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS repos (ID INTEGER DEFAULT (1), name TEXT, owner TEXT, description TEXT, checkForPulls BOOL, PRIMARY KEY (name, owner))');
	tx.executeSql('CREATE TRIGGER repo_increment AFTER INSERT ON repos BEGIN UPDATE repos SET ID=(SELECT MAX(ID) FROM repos)+1 WHERE owner = new.owner AND name = new.name; END');
	tx.executeSql('CREATE TABLE IF NOT EXISTS pullrequests (ID INTEGER PRIMART KEY ASC, title TEXT, body TEXT, created DATETIME, updated DATETIME, number INT UNIQUE, htmlUrl TEXT)');
});

function getNumPulls(callback) {
	db.transaction(function (tx) {
		tx.executeSql('SELECT * FROM pullRequests', [], function(tx, rs) {
			callback(rs.rows.length);
		});
	});
}

function deletePulls() {
	db.transaction(function (tx) {
		tx.executeSql('DELETE FROM pullrequests');
	});
}

function persistPulls(pulls) {
	db.transaction(function (tx) {
		for (i in pulls) {
			number = pulls[i].number;
			title = pulls[i].title;
			body = pulls[i].body;
			created = pulls[i].created_at;
			updated = pulls[i].updated_at;
			htmlUrl = pulls[i].html_url;

			tx.executeSql('INSERT OR IGNORE INTO pullRequests (number, title, body, created, updated, htmlUrl) VALUES (?, ?, ?, ?, ?, ?)', [number, title, body, created, updated, htmlUrl]);
		}
	});
}

function persistRepos(repos) {
	
	db.transaction(function (tx) {
		for (i in repos) {
			name = repos[i].name;
			description = repos[i].description;
			url = repos[i].url;
			owner = repos[i].owner.login;

			tx.executeSql('INSERT OR IGNORE INTO repos (name, owner) VALUES (?,?)',[name, owner]);
		}
	});
}

function setRepoCheck(repoId, check) {
	db.transaction(function(tx) {
		tx.executeSql('UPDATE repos SET checkForPulls = ? WHERE ID = ?', [check, repoId]);
	});
}
