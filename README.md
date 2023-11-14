# Active Directory

Desarrollé una aplicación que les permite al personal del área de RRHH dar de baja de a usuarios en el Active Directory, tambien pueden ver cuáles están activos o deshabilitados en el Active Directory.

Este proyecto está compuesto por el Front End, hecho con React, Tailwind, Flowbite y NextUI, y tambien por el Back End, hecho con Nodejs y librerias como Express y Active Directory.

## Endpoints

La aplicación funciona con Endpoints para enviar y recibir información en formato JSON con metodos GET, POST y PUT.

1. Login
~~~
https://bajas.limpiolux.com.ar:3080/login
~~~

2. Obtener usuarios
~~~
https://bajas.limpiolux.com.ar:3080/users
~~~

3. Desactivar usuarios
~~~
https://bajas.limpiolux.com.ar:3080/disableUser
~~~

3. Activar usuarios
~~~
https://bajas.limpiolux.com.ar:3080/enableUser
~~~

