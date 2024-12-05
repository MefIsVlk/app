import React, { useState } from 'react';

function AuthForm({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // "login", "register", o "recover"
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };


    const REGISTRATION_ENABLED = false; // Cambiar a false para bloquear registros
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contraseña: password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin();
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo: email, contraseña: password }),
      });
      const data = await response.json();
      if (response.ok) {
        setActiveTab('login');
      } else {
        setErrorMessage(data.message);
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor.');
    }
  };

  const handleRecoverSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const newPassword = prompt('Introduce tu nueva contraseña:');
      if (newPassword) {
        const response = await fetch('http://localhost:3000/recover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: recoveryEmail, nuevaContraseña: newPassword }),
        });
        const data = await response.json();
        if (response.ok) {
          setActiveTab('login');
        } else {
          setErrorMessage(data.message);
        }
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <h1 style={styles.title}>Iniciar Sesión</h1>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introduce tu correo"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                style={styles.input}
                required
              />
            </div>
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            <button type="submit" style={styles.button}>
              Iniciar Sesión
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={styles.form}>
            <h1 style={styles.title}>Registrar</h1>
            <div style={styles.inputGroup}>
              <label htmlFor="nombre" style={styles.label}>
                Nombre del Bar
              </label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Introduce el nombre del bar"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Introduce tu correo"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Introduce tu contraseña"
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma tu contraseña"
                style={styles.input}
                required
              />
            </div>
            <div>
      <button type="button" onClick={handleToggleModal} style={styles.buttonOpen}>
        Leer Términos y Condiciones
      </button>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>Términos y Condiciones</h2>
            <div style={styles.modalContent}>
            Términos y Condiciones de Uso
1. Aceptación de los Términos y Condiciones

Al registrarse y utilizar esta aplicación web, usted (en adelante, "Usuario") acepta estar vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de los términos establecidos aquí, no debe utilizar esta aplicación web.

2. Uso del Servicio

El Usuario se compromete a utilizar este servicio exclusivamente para fines personales y no comerciales. La aplicación web ofrece la gestión de pedidos y ventas en el Bar ANSACA. El Usuario se compromete a no utilizar la aplicación para actividades ilícitas o no autorizadas.

3. Privacidad y Protección de Datos Personales

El Usuario reconoce y acepta que el uso de la aplicación involucra la transmisión de datos personales. El manejo de estos datos estará sujeto a nuestra política de privacidad, la cual está diseñada para proteger la información del Usuario conforme a la legislación aplicable.

4. Propiedad Intelectual

Todos los contenidos, incluyendo textos, gráficos, imágenes, logos, íconos de software, y compilaciones de datos, así como el diseño, estructura y expresión del mismo, son propiedad exclusiva de THE PUBS y están protegidos por las leyes de propiedad intelectual. El Usuario se compromete a respetar todos los derechos de propiedad intelectual.

5. Limitaciones de Responsabilidad

THE PUBS no será responsable por daños o perjuicios que se deriven del uso o incapacidad de usar este servicio, incluyendo pero no limitado a fallas en el sistema, mantenimiento del servidor o compatibilidad con el software o hardware del Usuario.

6. Modificaciones de Términos y Condiciones

THE PUBS se reserva el derecho de modificar estos términos y condiciones en cualquier momento. Dichas modificaciones serán efectivas inmediatamente después de su publicación en la aplicación web.

7. Legislación Aplicable y Jurisdicción

Estos términos y condiciones se regirán e interpretarán de acuerdo con las leyes de Colombia. Cualquier disputa relacionada con estos términos será resuelta en los tribunales competentes de esta jurisdicción.
            </div>
            <button onClick={handleToggleModal} style={styles.buttonClose}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
            
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            <button type="submit" style={styles.button}>
              Registrar
            </button>
          </form>
        )}

        {activeTab === 'recover' && (
          <form onSubmit={handleRecoverSubmit} style={styles.form}>
            <h1 style={styles.title}>Recuperar Contraseña</h1>
            <div style={styles.inputGroup}>
              <label htmlFor="recoveryEmail" style={styles.label}>
                Correo Electrónico
              </label>
              <input
                id="recoveryEmail"
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                placeholder="Introduce tu correo registrado"
                style={styles.input}
                required
              />
            </div>
            {errorMessage && <p style={styles.error}>{errorMessage}</p>}
            <button type="submit" style={styles.button}>
              Recuperar Contraseña
            </button>
          </form>
        )}

        <div style={styles.navigationButtons}>
          <button
            onClick={() => setActiveTab('login')}
            style={{
              ...styles.navButton,
              ...(activeTab === 'login' ? styles.activeNavButton : {}),
            }}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setActiveTab('register')}
            style={{
              ...styles.navButton,
              ...(activeTab === 'register' ? styles.activeNavButton : {}),
            }}
          >
            Registrar
          </button>
          <button
            onClick={() => setActiveTab('recover')}
            style={{
              ...styles.navButton,
              ...(activeTab === 'recover' ? styles.activeNavButton : {}),
            }}
          >
            Recuperar Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#0e0e10',
    padding: '20px',
  },
  formWrapper: {
    width: '100%',
    maxWidth: '400px',
    padding: '25px',
    borderRadius: '10px',
    backgroundColor: '#1e1e23',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '25px',
    color: '#39d353',
  },
  inputGroup: {
    marginBottom: '15px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '5px',
    color: '#d1d1d1',
  },
  input: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #3a3a3d',
    backgroundColor: '#2a2a2e',
    color: '#fff',
    borderRadius: '5px',
  },
  button: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0e0e10',
    backgroundColor: '#39d353',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    marginTop: '10px',
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  navButton: {
    flex: 1,
    margin: '0 5px',
    padding: '10px',
    fontSize: '14px',
    backgroundColor: '#2a2a2e',
    color: '#d1d1d1',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  activeNavButton: {
    backgroundColor: '#39d353',
    color: '#0e0e10',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(22 22 22)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1050,
  },
  
  modal: {
    position: 'relative',
    width: '90%',
    maxWidth: '600px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    zIndex: 1100,
  },
  modalTitle: {
    marginTop: 0,
    color: '#333',
  },
  modalContent: {
    maxHeight: '75vh',
    overflowY: 'auto',
    padding: '20px',
    textAlign: 'left',
    lineHeight: '1.6',
    fontSize: '16px',
    color: '#333333',
  },
  buttonOpen: {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007BFF',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonClose: {
    display: 'block',
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#DC3545',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  }
};

export default AuthForm;
