// Cargar usuarios desde el almacenamiento local (si existen)
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

// Función para verificar si un usuario existe
function usuarioExiste(usuario, contrasena) {
  return usuarios.some(u => u.usuario === usuario && u.contrasena === contrasena);
}

const loginForm = document.getElementById('loginForm');
const registroForm = document.getElementById('registroForm');
const conversor = document.getElementById('conversor');
const btnMostrarRegistro = document.getElementById('btnMostrarRegistro');
const btnMostrarLogin = document.getElementById('btnMostrarLogin');

// Formulario de registro
btnMostrarRegistro.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registroForm.style.display = 'block';
});

// Formulario de inicio de sesión
btnMostrarLogin.addEventListener('click', () => {
  registroForm.style.display = 'none';
  loginForm.style.display = 'block';
});

// Verificación de usuario y contraseña
const btnIniciarSesion = document.getElementById('btnIniciarSesion');
const usuarioInput = document.getElementById('usuario');
const contrasenaInput = document.getElementById('contrasena');

btnIniciarSesion.addEventListener('click', () => {
  const usuario = usuarioInput.value;
  const contrasena = contrasenaInput.value;

  if (usuarioExiste(usuario, contrasena)) {
    loginForm.style.display = 'none';
    conversor.style.display = 'block';
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Error de inicio de sesión',
      text: 'Credenciales inválidas',
      footer: '<a href="">¿Por qué tengo este problema?</a>'
    });
  }
});

// (Agregado a la lista de usuarios)
const btnRegistrarse = document.getElementById('btnRegistrarse');
const nuevoUsuarioInput = document.getElementById('nuevoUsuario');
const nuevaContrasenaInput = document.getElementById('nuevaContrasena');

btnRegistrarse.addEventListener('click', () => {
  const nuevoUsuario = nuevoUsuarioInput.value;
  const nuevaContrasena = nuevaContrasenaInput.value;

  // Validación de la contraseña
  if (!validarContrasena(nuevaContrasena)) {
    // Mostrar mensaje de error personalizado con SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Error de registro',
      text: 'La contraseña debe contener al menos una mayúscula y un número.',
      footer: '<a href="">¿Por qué tengo este problema?</a>'
    });
    return;
  }

  // Verificar si el usuario ya existe
  if (usuarios.some(u => u.usuario === nuevoUsuario)) {
    Swal.fire({
      icon: 'error',
      title: 'Error de registro',
      text: 'El nombre de usuario ya está en uso. Por favor, elige otro.',
      footer: '<a href="">¿Por qué tengo este problema?</a>'
    });
    return;
  }

  // Agregar el nuevo usuario a la lista
  usuarios.push({ usuario: nuevoUsuario, contrasena: nuevaContrasena });

  // Guardar la lista actualizada en el almacenamiento local
  localStorage.setItem('usuarios', JSON.stringify(usuarios));

  // Utilizamos Swal.fire para mostrar una ventana modal de SweetAlert2
  Swal.fire(
    'Registro exitoso',
    'Ahora puedes iniciar sesión.',
    'success'
  );

  // Limpiar los campos de entrada
  nuevoUsuarioInput.value = '';
  nuevaContrasenaInput.value = '';
});

// Función de validación de contraseña
function validarContrasena(contrasena) {
  // La contraseña debe contener al menos una mayúscula y al menos un número
  return /[A-Z]/.test(contrasena) && /\d/.test(contrasena);
}

// Resto del código (conversor de divisas) permanece sin cambios

// Define un objeto que mapea códigos de moneda a nombres
const nombresMonedas = {
  ars: 'Pesos Argentinos (ARS)',
  usd: 'Dólares Estadounidenses (USD)',
  eur: 'Euros (EUR)',
  uyu: 'Pesos Uruguayos (UYU)',
  brl: 'Reales Brasileños (BRL)'
};

// Obtén los elementos select de moneda desde el DOM
const seleccionMonedaDesde = document.getElementById('monedaDesde');
const seleccionMonedaA = document.getElementById('monedaA');

// Utiliza el método map para generar las opciones
Object.entries(nombresMonedas).map(([codigo, nombre]) => {
  const optionDesde = document.createElement('option');
  optionDesde.value = codigo;
  optionDesde.text = nombre;

  const optionA = document.createElement('option');
  optionA.value = codigo;
  optionA.text = nombre;

  seleccionMonedaDesde.appendChild(optionDesde);
  seleccionMonedaA.appendChild(optionA);
});

const botonConvertir = document.getElementById('convertir');
const entradaMonto = document.getElementById('monto');
const resultadoDiv = document.getElementById('resultado');

// Cargar tasas de cambio desde un archivo JSON local
fetch('tasas-de-cambio.json')
  .then(response => response.json())
  .then(data => {
    const tasasDeCambio = data.tasasDeCambio;

    botonConvertir.addEventListener('click', () => {
      const monedaDesde = seleccionMonedaDesde.value;
      const monedaA = seleccionMonedaA.value;
      const monto = parseFloat(entradaMonto.value);

      if (isNaN(monto)) {
        resultadoDiv.textContent = 'Ingresa un monto válido';
        return;
      }

      if (tasasDeCambio[monedaDesde] && tasasDeCambio[monedaDesde][monedaA]) {
        const montoConvertido = monto * tasasDeCambio[monedaDesde][monedaA];
        resultadoDiv.textContent = `${monto.toFixed(2)} ${monedaDesde.toUpperCase()} equivalen a ${montoConvertido.toFixed(2)} ${monedaA.toUpperCase()}`;
        
        // Guardar resultado en el almacenamiento local 
        const resultadoJSON = JSON.stringify({
          montoOriginal: monto.toFixed(2),
          monedaDesde: monedaDesde.toUpperCase(),
          montoConvertido: montoConvertido.toFixed(2),
          monedaA: monedaA.toUpperCase()
        });
        localStorage.setItem('resultadoConversión', resultadoJSON);
      } else {
        resultadoDiv.textContent = 'Las tasas de conversión no están disponibles';
      }
    });

    // Mostrar el resultado almacenado en el almacenamiento local 
    window.addEventListener('load', () => {
        const resultadoJSON = localStorage.getItem('resultadoConversión');
        if (resultadoJSON) {
          const resultadoObj = JSON.parse(resultadoJSON);
          resultadoDiv.textContent = `${resultadoObj.montoOriginal} ${resultadoObj.monedaDesde} equivalen a ${resultadoObj.montoConvertido} ${resultadoObj.monedaA}`;
        }
      });
  })
  .catch(error => {
    console.error('Error al cargar las tasas de cambio', error);
  });

// Botón para cerrar sesión
const btnCerrarSesion = document.getElementById('btnCerrarSesion');

btnCerrarSesion.addEventListener('click', () => {
  loginForm.style.display = 'block';
  conversor.style.display = 'none';

  // SweetAlert2 para mostrar un mensaje de cierre de sesión
  Swal.fire({
    title: 'Cierre de Sesión',
    text: 'Has cerrado sesión exitosamente.',
    icon: 'info',
    confirmButtonText: 'Aceptar'
  });
});

// Botón para mostrar instrucciones
document.getElementById('btnMostrarInstrucciones').addEventListener('click', () => {
  Swal.fire({
    title: 'Instrucciones Personalizadas',
    html: `
      <h3>1. Registro e Inicio de Sesión</h3>
      <p>Para comenzar a utilizar el conversor de divisas, primero debes registrarte o iniciar sesión si ya tienes una cuenta.</p>
      <!-- Agrega más contenido de instrucciones aquí -->

      <h3>2. Selecciona la divisa de origen.</h3>
      <h3>3. Ingresa el monto a convertir.</h3>
      <h3>4. Elige la divisa a la que quieres convertir.</h3>
      <h3>5. Click en "CONVERTIR".</h3>
    `,
    width: 600, // Ancho personalizado
    padding: '3em', // Relleno personalizado
    customClass: {
      title: 'custom-title', 
      htmlContainer: 'custom-html-container'
    },
    backdrop: `
      rgba(0, 0, 123, 0.4)
      url("/images/nyan-cat.gif")
      left top
      no-repeat
    `,
    showConfirmButton: false, // Oculta el botón "Confirmar"
    allowOutsideClick: true // Permite cerrar haciendo clic fuera de la ventana emergente
  });
});