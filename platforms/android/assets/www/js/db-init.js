//console.log('Init DB');
var server;
db.open({
  server: 'my-app',
  version: 1,
  schema: {
    exerciseType: {
      key: {
        keyPath: 'id',
        autoIncrement: true
      },
      indexes: {
  			name: {
  			  unique: true
  			}
      }
    },
    exercise: {
      key: {
        keyPath: 'id',
        autoIncrement: true
      },
      indexes: {
  			name: {
  			  unique: true
  			}
      }
    },
    customers: {
      key: {
        keyPath: 'id',
        autoIncrement: true
      },
      indexes: {
  			name: {
  			  unique: true
  			}
      }
    }
  }
}).done(function(s) {
  server = s;
  //console.log('Init server');
  
});
