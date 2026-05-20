// Script de teste para verificar resposta da API de login
// Execute no console do navegador após fazer login

const testLoginResponse = async () => {
  const credentials = {
    username: prompt('Digite o username:'),
    password: prompt('Digite a senha:')
  }

  try {
    const response = await fetch('http://localhost:8000/hortifruti/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    const data = await response.json()
    console.log('Resposta da API:', data)

    if (data.user) {
      console.log('Usuário:', data.user)
      console.log('is_admin:', data.user.is_admin)
      console.log('Tipo de is_admin:', typeof data.user.is_admin)
    }
  } catch (error) {
    console.error('Erro:', error)
  }
}

// Para executar: testLoginResponse()</content>
<parameter name="filePath">c:\RPA_PYTHON\serrao-frontend-vue\test-login.js