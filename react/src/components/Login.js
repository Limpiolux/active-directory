import { useState, useEffect } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Chip } from "@nextui-org/react";
import { AiOutlineCheck, AiOutlineClose, AiOutlineLogin, AiOutlineLogout } from "react-icons/ai";
import { Button } from "@nextui-org/react";
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

function Login() {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [permisos, setPermisos] = useState(localStorage.getItem('permisos') === 'true');
    const handleLogout = () => {
        // Elimina la variable permisos del localStorage
        localStorage.removeItem('permisos');
        // Establece permisos en false
        setPermisos(false);
        window.location.reload();
      };
    

    useEffect(() => {
        // Realizar la solicitud GET al endpoint
        fetch('https://bajas.limpiolux.com.ar:3080/users')
            .then(response => response.json())
            .then(data => {
                // Filtrar los usuarios con las propiedades requeridas
                const filteredUsers = data.filter(user => user.mail && user.displayName && (user.isActive === "Activa" || user.isActive === "Inactiva" && user.dn));
                setUsers(filteredUsers);
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });
    }, []);

    const handleLogin = async () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
    
        try {
          const response = await axios.post('https://bajas.limpiolux.com.ar:3080/login', { username: email, password });
          if (response.status === 200) {
            // Guardar permisos en localStorage
            localStorage.setItem('permisos', 'true');
            // Reiniciar la página
            window.location.reload();
          }
        } catch (error) {
          // Mostrar un alert si la autenticación falla
          alert('Autenticación fallida. Por favor, verifica tus credenciales.');
        }
      };

    const handleSearchTermChange = (newSearchTerm) => {
        // Reiniciar la paginación a la página 1 cuando se ingresa un término de búsqueda
        setPage(1);
        setSearchTerm(newSearchTerm);
    };

    const filteredUsers = users.filter(user => {
        // Filtra los usuarios que coinciden con el término de búsqueda en nombre o correo electrónico
        return user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.mail.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const pages = Math.ceil(filteredUsers.length / rowsPerPage);

    const items = filteredUsers.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const disableUser = (userDn) => {
        // Realizar la solicitud POST al endpoint para deshabilitar un usuario
        fetch('https://bajas.limpiolux.com.ar:3080/disableUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ dn: userDn }),
        })
            .then(response => {
                if (response.status === 200) {
                    // Actualizar la lista de usuarios después de deshabilitar
                    const updatedUsers = users.map(user => {
                        if (user.dn === userDn) {
                            return { ...user, isActive: "Inactiva" };
                        }
                        return user;
                    });
                    setUsers(updatedUsers);
                }
            })
            .catch(error => {
                console.error('Error al deshabilitar el usuario:', error);
            });
    };


    return (
        < >
              {permisos ? (
        // Mostrar el botón "Desconectar" si permisos es true
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: "40px", marginBottom: "-25px" }}>
          <Button variant="solid" onClick={handleLogout} style={{ backgroundColor: "#ff0000", color: "#ffffff" }}>
            <AiOutlineLogout/>
            Desconectar
          </Button>
        </div>
      ) : (
        // Mostrar el botón "Entrar" si permisos es false
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: "40px", marginBottom: "-25px" }}>
          <Button variant="solid" onClick={handleShow} style={{ backgroundColor: "#0075a9", color: "#ffffff" }}>
            <AiOutlineLogin />
            Entrar
          </Button>
        </div>
      )}

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Ingresa tus datos</Modal.Title>
                </Modal.Header>
                <Modal.Body><form>
                    <div class="mb-6">
                        <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <input autoComplete='off' type="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="tucorreo@limpiolux.com.ar" required />
                    </div>
                    <div class="mb-6">
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contraseña</label>
                        <input autoComplete='off' type="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required />
                    </div>
                </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="danger" variant="light" onClick={handleClose}>
                        Cerrar
                    </Button>
                    <Button style={{ backgroundColor: "#0075a9", color: "#ffffff" }} variant="solid"             onClick={handleLogin}
>
                        <AiOutlineLogin />
                        Enviar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Login;
