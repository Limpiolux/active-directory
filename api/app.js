const ActiveDirectory = require('activedirectory');
const express = require('express');
const app = express();
const cors = require('cors'); // Importa cors
const bodyParser = require('body-parser');
app.use(bodyParser.json());
const ldap = require('ldapjs');
const axios = require('axios');
const fs = require('fs');
const https = require('https');

const config = {
    url: 'ldap://192.168.1.2',
    baseDN: 'dc=limpiolux,dc=local',
    username: 'amejias@limpiolux.com.ar',
    password: 'Teclado.7315',
};

const corsOptions = {
  origin: 'https://bajas.limpiolux.com.ar', // Reemplaza con la URL de tu cliente React
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

const privateKey = fs.readFileSync('private.key', 'utf8');
const certificate = fs.readFileSync('ba6371530781da66.pem', 'utf8');
const ca = fs.readFileSync('gd_bundle-g2-g1.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Crear servidor HTTPS
const httpsServer = https.createServer(credentials, app);

app.use(cors(corsOptions)); // Habilita cors con las opciones configuradas

const ad = new ActiveDirectory(config);

app.get('/users', (req, res) => {
  ad.authenticate(config.username, config.password, (err, auth) => {
    if (err) {
      console.log('Autenticación fallida: ' + JSON.stringify(err));
      res.status(401).json({ error: 'Autenticación fallida' });
      return;
    }

    if (auth) {
      console.log('Autenticación exitosa');

      const query = {
        filter: '(&(objectClass=user)(objectCategory=person))',
        scope: 'sub',
        attributes: ['dn', 'sAMAccountName', 'mail', 'cn', 'displayName', 'userAccountControl'],
      };

      ad.find(query, (err, result) => {
        if (err) {
          console.log('Error al buscar usuarios:', err);
          res.status(500).json({ error: 'Error al buscar usuarios' });
          return;
        }

        if (result.users) {
          console.log('Lista de usuarios:');
          const usersData = Array.isArray(result.users) ? result.users : [result.users];

          // Iterate through the list of users and check if they are enabled
          const usersWithEnabledStatus = usersData.map(user => {
            const isEnabled = (user.userAccountControl & 2) === 0; // Check if the account is enabled
            return {
              ...user,
              isActive: isEnabled ? 'Activa' : 'Inactiva', // Agregar la propiedad isActive
            };
          });

          res.json(usersWithEnabledStatus);
        } else {
          console.log('Ningún usuario encontrado.');
          res.json([]);
        }
      });
    } else {
      console.log('Autenticación fallida');
      res.status(401).json({ error: 'Autenticación fallida' });
    }
  });
});

app.post('/disableUser', (req, res) => {
  const { dn, displayName, mail } = req.body;

  // Save displayName and mail in variables for future use if needed
  const userDisplayName = displayName || null;
  const userEmail = mail || null;

  const client = ldap.createClient({
    url: 'ldap://192.168.1.2',
  });

  client.bind(config.username, config.password, (err) => {
    if (err) {
      console.log('Autenticación fallida: ' + JSON.stringify(err));
      res.status(401).json({ error: 'Autenticación fallida' });
      return;
    }

    // Crear una instancia de Attribute para la modificación
    const isEnabledModification = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        vals: ['514'], // El valor para deshabilitar el usuario
      }),
    });

    client.modify(dn, isEnabledModification, (err) => {
      if (err) {
        console.log('Error al deshabilitar el usuario:', err);
        res.status(500).json({ error: 'Error al deshabilitar el usuario' });
      } else {
        console.log('Usuario deshabilitado correctamente.');

        // If needed, use userDisplayName and userEmail in further processing

        // Send HTTP POST request to the specified endpoint
        const postPayload = {
          mail: userEmail || "",
          displayName: userDisplayName || "",
        };

        axios.post('https://prod-02.brazilsouth.logic.azure.com:443/workflows/0f187faaa95646faacb4515136645617/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=B4XKrY0zhct0Q1SQgm73Khe-INtkKKovzJoqd0QdTH4', postPayload)
          .then(response => {
            console.log('HTTP POST request successful:', response.data);
            res.json({ message: 'Usuario deshabilitado correctamente y solicitud enviada.' });
          })
          .catch(error => {
            console.error('Error en el HTTP POST request:', error);
            res.status(500).json({ error: 'Error en el HTTP POST request' });
          });
      }

      client.unbind();
    });
  });
});

app.post('/enableUser', (req, res) => {
  const { dn } = req.body;

  const client = ldap.createClient({
    url: 'ldap://192.168.1.2',
  });

  client.bind(config.username, config.password, (err) => {
    if (err) {
      console.log('Autenticación fallida: ' + JSON.stringify(err));
      res.status(401).json({ error: 'Autenticación fallida' });
      return;
    }

    // Crear una instancia de Attribute para la modificación
    const isEnabledModification = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        vals: ['512'], // El valor para habilitar el usuario
      }),
    });

    client.modify(dn, isEnabledModification, (err) => {
      if (err) {
        console.log('Error al habilitar el usuario:', err);
        res.status(500).json({ error: 'Error al habilitar el usuario' });
      } else {
        console.log('Usuario habilitado correctamente.');
        res.json({ message: 'Usuario habilitado correctamente' });
      }

      client.unbind();
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const client = ldap.createClient({
    url: 'ldap://192.168.1.2',
  });

  // Intenta autenticar al usuario con las credenciales proporcionadas
  client.bind(username, password, (err) => {
    if (err) {
      console.log('Autenticación fallida: ' + JSON.stringify(err));
      res.status(401).json({ error: 'Autenticación fallida' });
      client.unbind();
      return;
    }

    // Intenta activar o desactivar un usuario específico para verificar permisos
    const dnToCheck = 'CN=Eber Perez,OU=Sistemas,OU=Limpiolux,DC=limpiolux,DC=local';
    const isEnabledModification = new ldap.Change({
      operation: 'replace',
      modification: new ldap.Attribute({
        type: 'userAccountControl',
        vals: ['514'], // El valor para deshabilitar el usuario
      }),
    });

    client.modify(dnToCheck, isEnabledModification, (err) => {
      if (err) {
        console.log('No tiene permisos para activar/desactivar usuarios: ' + JSON.stringify(err));
        res.status(403).json({ error: 'No tiene permisos para activar/desactivar usuarios' });
      } else {
        console.log('Usuario autenticado y tiene permisos para activar/desactivar usuarios.');
        res.json({ message: 'Usuario autenticado y tiene permisos para activar/desactivar usuarios' });
      }

      client.unbind();
    });
  });
});


const port = 3080;
httpsServer.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
