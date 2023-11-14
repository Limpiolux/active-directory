import { useState, useEffect } from 'react'
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Chip, Button } from "@nextui-org/react";
import { AiOutlineCheck, AiOutlineClose, AiOutlineLogin } from "react-icons/ai";
import Login from './Login';

function TableUsers() {

    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const [searchTerm, setSearchTerm] = useState('');
    const [permisos, setPermisos] = useState(localStorage.getItem('permisos') === 'true');

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

    const disableUser = (userDn, userMail, userDisplayName) => {
        // Realizar la solicitud POST al endpoint para deshabilitar un usuario
        fetch('https://bajas.limpiolux.com.ar:3080/disableUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dn: userDn,
            mail: userMail,
            displayName: userDisplayName,
          }),
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
        <>
            <section className="max-w-xl mt-12 mx-auto px-4 md:px-8">
                <form style={{ marginTop: "25px", marginBottom: "-20px" }}>
                    <label for="simple-search" class="sr-only">Search</label>
                    <div className="relativ w-full">

                        <input
                            type="search"
                            id="default-search"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar usuarios..."
                            value={searchTerm}
                            onChange={(e) => handleSearchTermChange(e.target.value)}
                            autoComplete='off'
                        />
                    </div>
                </form>
                <Login />
            </section>



            <section style={{ margin: "20px" }}>
                <div className="mt-8">
                    <div className="relative overflow-x-auto">
                        <Table aria-label="Example table with client side pagination">
                            <TableHeader>
                                <TableColumn>Nombre</TableColumn>
                                <TableColumn>Mail</TableColumn>
                                <TableColumn>Estado</TableColumn>
                                <TableColumn>
    {permisos && "Opciones"}
</TableColumn>
                            </TableHeader>
                            <TableBody items={items}>
                                {user => (
                                    <TableRow key={user.mail}>
                                        <TableCell>{user.displayName}</TableCell>
                                        <TableCell>{user.mail}</TableCell>
                                        <TableCell>
                                            {user.isActive === "Activa" ? (
                                                <Chip color="success" size="sm" style={{ color: "#ffffff" }}><AiOutlineCheck /></Chip>
                                            ) : (
                                                <Chip color="danger" size="sm" ><AiOutlineClose /></Chip>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {permisos && user.isActive === "Activa" && (
                                                <Button
                                                onClick={() => disableUser(user.dn, user.mail, user.displayName)}
                                                radius="full"
                                                    variant="flat"
                                                    size="sm"
                                                    color="primary"
                                                >
                                                    Desactivar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <div className="flex justify-center">

                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        page={page}
                        style={{ marginTop: "20px" }}
                        total={pages}
                        onChange={newPage => setPage(newPage)}
                    />
                </div>

            </section>
        </>
    )
}

export default TableUsers;
