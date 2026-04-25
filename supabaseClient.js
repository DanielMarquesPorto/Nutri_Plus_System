require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuração das credenciais a partir do arquivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltando credenciais do Supabase. Verifique o arquivo .env');
}

// Criação do cliente de conexão com o banco de dados supabase
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Conexão inicializada com o banco de dados:', supabaseUrl);

// Testando a conexão listando nutricionistas (ou verificando o status)
async function testConnection() {
  const { data, error } = await supabase
    .from('nutricionistas')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Erro ao conectar ou consultar o banco de dados:', error.message);
  } else {
    console.log('Conexão estabelecida com sucesso! Obtido:', data);
  }
}

testConnection();

module.exports = { supabase };
